const mongoose = require("mongoose");

const baseSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

baseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = baseSchema;
