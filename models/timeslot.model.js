const mongoose = require("mongoose");
const baseSchema = require("./base.model");
const moment = require("moment");
const ApiError = require("../utils/apiError");

const timeslotSchema = new mongoose.Schema(
  {
    ...baseSchema.obj,
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      validate: {
        validator: function (value) {
          return moment(value).isValid();
        },
        message: "Invalid start time format",
      },
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return (
            moment(value).isValid() && moment(value).isAfter(this.startTime)
          );
        },
        message: "End time must be after start time",
      },
    },
    maxOrders: {
      type: Number,
      required: [true, "Maximum orders capacity is required"],
      min: [1, "Maximum orders must be at least 1"],
      default: 20,
    },
    currentOrders: {
      type: Number,
      default: 0,
      min: [0, "Current orders cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.maxOrders + this.bufferCapacity;
        },
        message:
          "Current orders cannot exceed maximum capacity including buffer",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dayOfWeek: {
      type: Number,
      required: [true, "Day of week is required"],
      min: [0, "Day of week must be between 0 and 6"],
      max: [6, "Day of week must be between 0 and 6"],
      validate: {
        validator: function (value) {
          if (this.specialDate) {
            return value === moment(this.specialDate).day();
          }
          return true;
        },
        message: "Day of week must match special date if provided",
      },
    },
    repeatWeekly: {
      type: Boolean,
      default: true,
    },
    cutoffHours: {
      type: Number,
      default: 2,
      min: [0, "Cutoff hours cannot be negative"],
      validate: {
        validator: function (value) {
          // Only validate cutoff hours for same-day slots
          const slotDate = moment(this.startTime).startOf("day");
          const today = moment().startOf("day");

          if (slotDate.isSame(today)) {
            const duration = moment
              .duration(moment(this.startTime).diff(moment()))
              .asHours();
            return value <= duration;
          }
          return true; // Skip validation for future dates
        },
        message:
          "Cutoff hours cannot be greater than the time until slot starts",
      },
    },
    specialDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (value) {
            return moment(value).isValid();
          }
          return true;
        },
        message: "Invalid special date format",
      },
    },
    bufferCapacity: {
      type: Number,
      default: 5,
      min: [0, "Buffer capacity cannot be negative"],
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance optimization
timeslotSchema.index({ startTime: 1, endTime: 1 });
timeslotSchema.index({ dayOfWeek: 1 });
timeslotSchema.index({ isActive: 1 });
timeslotSchema.index({ specialDate: 1 });
timeslotSchema.index({ repeatWeekly: 1 });

// Virtuals
timeslotSchema.virtual("remainingCapacity").get(function () {
  return this.maxOrders - this.currentOrders;
});

timeslotSchema.virtual("remainingBufferCapacity").get(function () {
  return this.maxOrders + this.bufferCapacity - this.currentOrders;
});

timeslotSchema.virtual("isCutoffReached").get(function () {
  const cutoffTime = moment(this.startTime).subtract(this.cutoffHours, "hours");
  return moment().isAfter(cutoffTime);
});

// Methods
timeslotSchema.methods.isAvailable = function () {
  if (!this.isActive) return false;
  if (this.isCutoffReached) return false;
  return this.currentOrders < this.maxOrders;
};

timeslotSchema.methods.canAcceptBuffer = function () {
  if (!this.isActive) return false;
  if (this.isCutoffReached) return false;
  return this.currentOrders < this.maxOrders + this.bufferCapacity;
};

timeslotSchema.methods.addOrder = async function (orderId) {
  if (!this.canAcceptBuffer()) {
    throw new ApiError(400, "Timeslot is fully booked");
  }

  if (!this.orders.includes(orderId)) {
    this.orders.push(orderId);
    this.currentOrders += 1;
    await this.save();
  }

  return this;
};

timeslotSchema.methods.removeOrder = async function (orderId) {
  const orderIndex = this.orders.indexOf(orderId);
  if (orderIndex > -1) {
    this.orders.splice(orderIndex, 1);
    this.currentOrders = Math.max(0, this.currentOrders - 1);
    await this.save();
  }
  return this;
};

// Static methods
timeslotSchema.statics.findAvailableSlots = async function (
  date,
  includeBuffer = false
) {
  const startOfDay = moment(date).startOf("day").toDate();
  const endOfDay = moment(date).endOf("day").toDate();
  const dayOfWeek = moment(date).day();

  const query = {
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
        isActive: true,
      },
    ],
  };

  if (includeBuffer) {
    query.$expr = {
      $lt: ["$currentOrders", { $add: ["$maxOrders", "$bufferCapacity"] }],
    };
  } else {
    query.$expr = {
      $lt: ["$currentOrders", "$maxOrders"],
    };
  }

  const slots = await this.find(query)
    .sort("startTime")
    .populate("orders", "id status");

  // Filter out slots that are past their cutoff time
  const now = moment();
  return slots.filter((slot) => {
    const cutoffTime = moment(slot.startTime).subtract(
      slot.cutoffHours,
      "hours"
    );
    return cutoffTime.isAfter(now);
  });
};

// Middleware
timeslotSchema.pre("save", function (next) {
  // Validate time consistency
  if (moment(this.endTime).isSameOrBefore(this.startTime)) {
    next(new Error("End time must be after start time"));
  }

  // Set dayOfWeek if specialDate is provided
  if (this.specialDate) {
    this.dayOfWeek = moment(this.specialDate).day();
  }

  // Ensure currentOrders doesn't exceed capacity
  if (this.currentOrders > this.maxOrders + this.bufferCapacity) {
    next(
      new Error(
        "Current orders cannot exceed maximum capacity including buffer"
      )
    );
  }

  next();
});

const Timeslot = mongoose.model("Timeslot", timeslotSchema);

module.exports = Timeslot;
