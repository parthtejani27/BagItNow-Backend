const Joi = require("joi");
const { objectId } = require("./custom.validation");

const paymentValidation = {
  createPaymentIntent: {
    body: Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().custom(objectId).required(),
            price: Joi.number().positive().required(),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
      savePaymentMethod: Joi.boolean().default(false),
      orderId: Joi.string().custom(objectId).required(),
    }),
  },

  setDefaultPaymentMethod: {
    body: Joi.object({
      paymentMethodId: Joi.string().required(),
    }),
  },

  getPaymentStatus: {
    params: Joi.object({
      paymentId: Joi.string().custom(objectId).required(),
    }),
  },

  validateOrderAmount: {
    params: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      amount: Joi.number().positive().required(),
    }),
  },

  handleWebhook: {
    body: Joi.object().unknown(true), // Accepts any payload, as Stripe sends dynamic event objects
  },

  saveCard: {
    body: Joi.object({
      paymentMethodId: Joi.string().required(),
      nickname: Joi.string().required(),
    }),
  },
};

module.exports = paymentValidation;
