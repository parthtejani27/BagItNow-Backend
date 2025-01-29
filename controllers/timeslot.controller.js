const BaseController = require("./base.controller");
const TimeslotService = require("../services/timeslot.service");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/response");
const moment = require("moment");

class TimeslotController extends BaseController {
  constructor() {
    super(TimeslotService);
  }

  // Get available timeslots for a specific date
  async getAvailableSlots(req, res, next) {
    try {
      const { date, includeBuffer } = req.query;

      if (!date) {
        throw new ApiError(400, "Date is required");
      }

      const slots = await this.service.getAvailableTimeslots(new Date(date), {
        includeBuffer: includeBuffer === "true",
      });

      return res.json(
        ApiResponse.success("Available timeslots retrieved successfully", slots)
      );
    } catch (error) {
      next(error);
    }
  }

  // Reserve a timeslot
  async reserveSlot(req, res, next) {
    try {
      const { slotId } = req.params;
      const { orderId } = req.body;

      if (!orderId) {
        throw new ApiError(400, "Order ID is required");
      }

      const slot = await this.service.reserveTimeslot(slotId, orderId);

      return res.json(
        ApiResponse.success("Timeslot reserved successfully", slot)
      );
    } catch (error) {
      next(error);
    }
  }

  // Release a timeslot
  async releaseSlot(req, res, next) {
    try {
      const { slotId } = req.params;
      const { orderId } = req.body;

      if (!orderId) {
        throw new ApiError(400, "Order ID is required");
      }

      const slot = await this.service.releaseTimeslot(slotId, orderId);

      return res.json(
        ApiResponse.success("Timeslot released successfully", slot)
      );
    } catch (error) {
      next(error);
    }
  }

  // Generate default slots for a date range (admin only)
  async generateSlots(req, res, next) {
    try {
      const { startDate, endDate, config } = req.body;

      if (!startDate || !endDate || !config) {
        throw new ApiError(
          400,
          "Start date, end date, and configuration are required"
        );
      }

      const slots = await this.service.generateDefaultSlots(
        startDate,
        endDate,
        config
      );

      return res.json(
        ApiResponse.success("Default timeslots generated successfully", slots)
      );
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyTimeslots(req, res, next) {
    try {
      const {
        startDate = moment().format("YYYY-MM-DD"),
        includeBuffer = false,
        includeExpired = false,
      } = req.query;

      // Validate date format
      if (!moment(startDate, "YYYY-MM-DD", true).isValid()) {
        throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
      }

      const slots = await this.service.getWeeklyTimeslots(startDate, {
        includeBuffer: includeBuffer === "true",
        includeExpired: includeExpired === "true",
      });

      const summary = {
        startDate,
        endDate: moment(startDate).add(6, "days").format("YYYY-MM-DD"),
        totalDays: 7,
        daysWithSlots: Object.values(slots).filter(
          (day) => day.slots.length > 0
        ).length,
        totalSlots: Object.values(slots).reduce(
          (sum, day) => sum + day.slots.length,
          0
        ),
      };

      return res.json(
        ApiResponse.success("Weekly timeslots retrieved successfully", {
          summary,
          slots,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TimeslotController();
