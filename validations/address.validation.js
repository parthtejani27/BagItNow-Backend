const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addressValidation = {
  getAddress: {
    params: Joi.object({
      addressId: Joi.string().custom(objectId).required(),
    }),
  },

  createAddress: {
    body: Joi.object({
      type: Joi.string()
        .valid("House", "Apartment", "Office", "Hotel", "Other")
        .default("Other"),
      address: Joi.string().required().trim().min(5).max(200),
      streetNumber: Joi.string().trim().allow("").default(""),
      unit: Joi.string().trim().allow(null, "").default(null),
      streetName: Joi.string().trim().allow("").default(""),
      city: Joi.string().trim().allow("").default(""),
      state: Joi.string().trim().allow("").default(""),
      country: Joi.string().trim().allow("").default(""),
      zipcode: Joi.string().trim().allow("").default(""),
      lat: Joi.number().required().min(-90).max(90),
      lng: Joi.number().required().min(-180).max(180),
      additionalInfo: Joi.string().trim().allow("").default(""),
      dropoffOption: Joi.string()
        .valid(
          "Hand it to me",
          "Meet outside",
          "Meet in the lobby",
          "Leave at my door",
          "Leave at building reception"
        )
        .default("Leave at my door"),
      deliveryInstructions: Joi.string().trim().allow("").default(""),
      isDefault: Joi.boolean().default(false),
      formattedAddress: Joi.string().trim().allow(""),
      label: Joi.string().trim().allow("").default(""),
    }),
  },

  updateAddress: {
    params: Joi.object({
      addressId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      type: Joi.string().valid(
        "House",
        "Apartment",
        "Office",
        "Hotel",
        "Other"
      ),
      address: Joi.string().trim().min(5).max(200),
      streetNumber: Joi.string().trim().allow(""),
      unit: Joi.string().trim().allow(null, ""),
      streetName: Joi.string().trim().allow(""),
      city: Joi.string().trim().allow(""),
      state: Joi.string().trim().allow(""),
      country: Joi.string().trim().allow(""),
      zipcode: Joi.string().trim().allow(""),
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180),
      additionalInfo: Joi.string().trim().allow(""),
      dropoffOption: Joi.string().valid(
        "Hand it to me",
        "Meet outside",
        "Meet in the lobby",
        "Leave at my door",
        "Leave at building reception"
      ),
      deliveryInstructions: Joi.string().trim().allow(""),
      isDefault: Joi.boolean(),
      formattedAddress: Joi.string().trim().allow(""),
      label: Joi.string().trim().allow(""),
    }).min(1),
  },

  deleteAddress: {
    params: Joi.object({
      addressId: Joi.string().custom(objectId).required(),
    }),
  },

  setDefault: {
    params: Joi.object({
      addressId: Joi.string().custom(objectId).required(),
    }),
  },

  // New validation for bulk operations if needed
  bulkDelete: {
    body: Joi.object({
      addressIds: Joi.array()
        .items(Joi.string().custom(objectId))
        .min(1)
        .required(),
    }),
  },

  // Validation for searching nearby addresses
  searchNearby: {
    query: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
      radius: Joi.number().positive().default(5000), // Default 5km radius
    }),
  },
};

module.exports = addressValidation;
