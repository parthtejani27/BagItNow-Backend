const mongoose = require("mongoose");
const baseSchema = require("./base.model");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function () {
      return !this.phone; // Required if 'phone' is not provided
    },
    validate: {
      validator: function (value) {
        return !this.phone || (value && this.type === "email");
      },
      message: "Either email or phone should be provided, but not both.",
    },
  },
  phone: {
    type: String,
    required: function () {
      return !this.email; // Required if 'email' is not provided
    },
    validate: {
      validator: function (value) {
        return !this.email || (value && this.type === "phone");
      },
      message: "Either email or phone should be provided, but not both.",
    },
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "phone"],
    required: true,
    validate: {
      validator: function (value) {
        if (value === "email") {
          return this.email && !this.phone;
        } else if (value === "phone") {
          return this.phone && !this.email;
        }
        return false;
      },
      message:
        'Type should match the provided field: either "email" or "phone".',
    },
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 minutes
  },
});

module.exports = mongoose.model("Otp", otpSchema);
