const Joi = require("joi");
const { objectId } = require("./custom.validation");

const orderValidation = {
  createOrderWithPayment: {
    body: Joi.object({
      address: Joi.string().custom(objectId).required(),
      delivery: Joi.object({
        option: Joi.string().valid("standard", "express", "sameday").required(),
        instructions: Joi.string().max(500).trim(),
      }).required(),
      timeslot: Joi.string().custom(objectId).required(),
      payment: Joi.object({
        method: Joi.string().valid("card", "cod", "wallet").required(),
      }).required(),
      promoCode: Joi.string().max(20).trim(),
    }),
  },
  createOrder: {
    body: Joi.object({
      address: Joi.string().custom(objectId).required(),
      delivery: Joi.object({
        option: Joi.string().valid("standard", "express", "sameday").required(),
        instructions: Joi.string().max(500).trim(),
      }).required(),
      timeslot: Joi.string().custom(objectId).required(),
      payment: Joi.object({
        method: Joi.string()
          .valid("card", "apple_pay", "google_pay", "cod")
          .required(),
        transactionId: Joi.string().when("method", {
          is: Joi.valid("card", "apple_pay", "google_pay"),
          then: Joi.string(),
          otherwise: Joi.forbidden(),
        }),
      }).required(),
    }),
  },

  getOrders: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.string().valid(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      sortBy: Joi.string(),
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref("startDate")),
    }),
  },

  getOrder: {
    params: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
    }),
  },

  cancelOrder: {
    params: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      cancellationReason: Joi.string().max(500),
    }),
  },

  updateOrderStatus: {
    params: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      status: Joi.string()
        .valid("processing", "shipped", "delivered", "cancelled")
        .required(),
      trackingId: Joi.string().when("status", {
        is: "shipped",
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
    }),
  },

  reorder: {
    params: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
    }),
  },

  getOrderInvoice: {
    params: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
    }),
  },

  validatePayment: {
    body: Joi.object({
      orderId: Joi.string().custom(objectId).required(),
      transactionId: Joi.string().required(),
      paymentMethod: Joi.string().valid("card", "upi").required(),
      amount: Joi.number().positive().required(),
    }),
  },
};

module.exports = orderValidation;
