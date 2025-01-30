const BaseService = require("./base.service");
const Timeslot = require("../models/timeslot.model");
const ApiError = require("../utils/apiError");
const moment = require("moment");

class TimeslotService extends BaseService {
  constructor() {
    super(Timeslot);
  }

  async getAvailableTimeslots(date, { includeBuffer = false } = {}) {
    // Convert to UTC
    const startOfDay = moment.utc(date).startOf("day").toDate();
    const endOfDay = moment.utc(date).endOf("day").toDate();
    const dayOfWeek = moment.utc(date).day();

    console.log("UTC times:", {
      date,
      startOfDay,
      endOfDay,
      dayOfWeek,
    });

    const query = {
      startTime: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        {
          dayOfWeek,
          repeatWeekly: true,
          isActive: true,
        },
        {
          specialDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          repeatWeekly: false,
          isActive: true,
        },
      ],
    };

    // Add capacity check
    if (includeBuffer) {
      query.$expr = {
        $lt: ["$currentOrders", { $add: ["$maxOrders", "$bufferCapacity"] }],
      };
    } else {
      query.$expr = {
        $lt: ["$currentOrders", "$maxOrders"],
      };
    }

    const slots = await this.model.find(query).sort("startTime").lean();

    // Filter out slots that are past their cutoff time
    const now = moment.utc();
    return slots.filter((slot) => {
      const slotDate = moment.utc(slot.startTime).format("YYYY-MM-DD");
      const requestedDate = moment.utc(date).format("YYYY-MM-DD");

      if (slotDate !== requestedDate) {
        return false;
      }

      const cutoffTime = moment
        .utc(slot.startTime)
        .subtract(slot.cutoffHours, "hours");
      return cutoffTime.isAfter(now);
    });
  }

  async reserveTimeslot(slotId, orderId) {
    const session = await this.model.startSession();
    try {
      session.startTransaction();

      const slot = await this.model.findById(slotId).session(session);
      if (!slot) {
        throw new ApiError(404, "Timeslot not found");
      }

      // Check if slot is still available
      if (slot.currentOrders >= slot.maxOrders) {
        // Check buffer capacity
        if (slot.currentOrders >= slot.maxOrders + slot.bufferCapacity) {
          throw new ApiError(400, "Timeslot is fully booked");
        }
      }

      // Check cutoff time
      const cutoffTime = moment(slot.startTime).subtract(
        slot.cutoffHours,
        "hours"
      );
      if (moment().isAfter(cutoffTime)) {
        throw new ApiError(400, "Booking cutoff time has passed");
      }

      // Increment currentOrders
      slot.currentOrders += 1;
      await slot.save({ session });

      await session.commitTransaction();
      return slot;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async releaseTimeslot(slotId, orderId) {
    const session = await this.model.startSession();
    try {
      session.startTransaction();

      const slot = await this.model.findById(slotId).session(session);
      if (!slot) {
        throw new ApiError(404, "Timeslot not found");
      }

      if (slot.currentOrders > 0) {
        slot.currentOrders -= 1;
        await slot.save({ session });
      }

      await session.commitTransaction();
      return slot;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateDefaultSlots(startDate, endDate, config) {
    const start = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");
    const slots = [];

    for (let date = start; date.isSameOrBefore(end); date.add(1, "day")) {
      for (const timeSlot of config.dailySlots) {
        const [startHour, startMinute] = timeSlot.start.split(":");
        const [endHour, endMinute] = timeSlot.end.split(":");

        const slotStart = date
          .clone()
          .hours(parseInt(startHour))
          .minutes(parseInt(startMinute));

        const slotEnd = date
          .clone()
          .hours(parseInt(endHour))
          .minutes(parseInt(endMinute));

        slots.push({
          startTime: slotStart.toDate(),
          endTime: slotEnd.toDate(),
          maxOrders: timeSlot.maxOrders || config.defaultMaxOrders,
          dayOfWeek: date.day(),
          repeatWeekly: true,
          cutoffHours: timeSlot.cutoffHours || config.defaultCutoffHours,
          bufferCapacity:
            timeSlot.bufferCapacity || config.defaultBufferCapacity,
        });
      }
    }

    return await this.model.insertMany(slots);
  }

  async getWeeklyTimeslots(
    startDate,
    { includeBuffer = false, includeExpired = false } = {}
  ) {
    const start = moment(startDate).startOf("day");
    const end = moment(startDate).add(6, "days").endOf("day");

    const query = {
      $or: [
        // Weekly recurring slots
        {
          repeatWeekly: true,
          isActive: true,
        },
        // Special one-time slots within the week
        {
          specialDate: {
            $gte: start.toDate(),
            $lte: end.toDate(),
          },
          repeatWeekly: false,
          isActive: true,
        },
      ],
    };

    // Add capacity check
    if (includeBuffer) {
      query.$expr = {
        $lt: ["$currentOrders", { $add: ["$maxOrders", "$bufferCapacity"] }],
      };
    } else {
      query.$expr = {
        $lt: ["$currentOrders", "$maxOrders"],
      };
    }

    const slots = await this.model.find(query).sort("startTime").lean();

    // Group slots by date
    const weeklySlots = {};
    const now = moment();

    for (let i = 0; i < 7; i++) {
      const currentDate = moment(start).add(i, "days");
      const dateKey = currentDate.format("YYYY-MM-DD");
      const dayOfWeek = currentDate.day();

      // Filter slots for this day
      const daySlots = slots.filter((slot) => {
        // Check if it's a special date slot
        if (slot.specialDate) {
          return moment(slot.specialDate).isSame(currentDate, "day");
        }
        // Check if it's a recurring slot for this day of week
        return slot.dayOfWeek === dayOfWeek;
      });

      // Filter out expired slots if needed
      const availableSlots = daySlots.filter((slot) => {
        if (!includeExpired && currentDate.isSame(now, "day")) {
          const cutoffTime = moment(slot.startTime).subtract(
            slot.cutoffHours,
            "hours"
          );
          return cutoffTime.isAfter(now);
        }
        return true;
      });

      // Format slots with additional info
      const formattedSlots = availableSlots.map((slot) => ({
        ...slot,
        isAvailable: slot.currentOrders < slot.maxOrders,
        remainingCapacity: slot.maxOrders - slot.currentOrders,
        remainingBufferCapacity:
          slot.maxOrders + slot.bufferCapacity - slot.currentOrders,
        isCutoffReached: moment().isAfter(
          moment(slot.startTime).subtract(slot.cutoffHours, "hours")
        ),
      }));

      weeklySlots[dateKey] = {
        date: dateKey,
        dayOfWeek,
        dayName: currentDate.format("dddd"),
        isToday: currentDate.isSame(now, "day"),
        slots: formattedSlots,
      };
    }

    return weeklySlots;
  }
}

module.exports = new TimeslotService();
