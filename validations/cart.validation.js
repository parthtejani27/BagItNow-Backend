const Joi = require("joi");
const { objectId } = require("./custom.validation");

const cartValidation = {
  addItem: {
    body: Joi.object({
      productId: Joi.string().custom(objectId).required(),
      quantity: Joi.number().integer().min(1).required(),
    }),
  },

  updateQuantity: {
    body: Joi.object({
      productId: Joi.string().custom(objectId).required(),
      quantity: Joi.number().integer().min(1).required(),
    }),
  },

  removeItem: {
    params: Joi.object({
      productId: Joi.string().custom(objectId).required(),
    }),
  },
};

module.exports = cartValidation;
