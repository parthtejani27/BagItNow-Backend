// validations/custom.validation.js
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

/**
 * Custom Validation Helper Functions
 */
const custom = {
  // Custom validation for MongoDB ObjectId
  objectId: (value, helpers) => {
    if (!ObjectId.isValid(value)) {
      return helpers.message("{{#label}} must be a valid mongo id");
    }
    return value;
  },

  // Custom validation for Password
  password: (value, helpers) => {
    if (value.length < 8) {
      return helpers.message("password must be at least 8 characters");
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      return helpers.message(
        "password must contain at least 1 letter and 1 number"
      );
    }
    return value;
  },

  // Custom validation for Phone Number
  phone: (value, helpers) => {
    if (!value.match(/^\+?[\d\s-]{10,}$/)) {
      return helpers.message("please enter a valid phone number");
    }
    return value;
  },

  // Custom validation for URL
  url: (value, helpers) => {
    try {
      new URL(value);
      return value;
    } catch (error) {
      return helpers.message("please enter a valid URL");
    }
  },

  // Custom validation for Email
  email: (value, helpers) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return helpers.message("please enter a valid email address");
    }
    return value;
  },

  // Custom validation for Date
  date: (value, helpers) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return helpers.message("please enter a valid date");
    }
    return value;
  },

  // Custom validation for Array Length
  arrayLength: (min, max) => (value, helpers) => {
    if (value.length < min || value.length > max) {
      return helpers.message(
        `array must contain between ${min} and ${max} items`
      );
    }
    return value;
  },

  // Custom validation for String Length
  stringLength: (min, max) => (value, helpers) => {
    if (value.length < min || value.length > max) {
      return helpers.message(
        `string length must be between ${min} and ${max} characters`
      );
    }
    return value;
  },

  // Custom validation for Number Range
  numberRange: (min, max) => (value, helpers) => {
    if (value < min || value > max) {
      return helpers.message(`number must be between ${min} and ${max}`);
    }
    return value;
  },

  // Custom validation for File Size (in bytes)
  fileSize: (maxSize) => (value, helpers) => {
    if (value > maxSize) {
      return helpers.message(
        `file size must not exceed ${maxSize / (1024 * 1024)}MB`
      );
    }
    return value;
  },

  // Custom validation for File Type
  fileType: (allowedTypes) => (value, helpers) => {
    if (!allowedTypes.includes(value.mimetype)) {
      return helpers.message(
        `file type must be one of: ${allowedTypes.join(", ")}`
      );
    }
    return value;
  },
};

module.exports = custom;
