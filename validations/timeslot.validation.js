const Joi = require("joi");

const timeslotValidators = {
  getAvailable: {
    query: Joi.object({
      date: Joi.date().required(),
      includeBuffer: Joi.boolean().default(false),
    }),
  },

  getWeekly: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      includeBuffer: Joi.boolean().default(false),
      includeExpired: Joi.boolean().default(false),
    }),
  },

  reserve: {
    params: Joi.object({
      slotId: Joi.string().required(),
    }),
    body: Joi.object({
      orderId: Joi.string().required(),
    }),
  },

  release: {
    params: Joi.object({
      slotId: Joi.string().required(),
    }),
    body: Joi.object({
      orderId: Joi.string().required(),
    }),
  },

  generate: {
    body: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      config: Joi.object({
        defaultMaxOrders: Joi.number().integer().min(1).required(),
        defaultCutoffHours: Joi.number().min(0).required(),
        defaultBufferCapacity: Joi.number().integer().min(0).required(),
        dailySlots: Joi.array()
          .items(
            Joi.object({
              start: Joi.string()
                .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
              end: Joi.string()
                .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
              maxOrders: Joi.number().integer().min(1),
              cutoffHours: Joi.number().min(0),
              bufferCapacity: Joi.number().integer().min(0),
            })
          )
          .min(1)
          .required(),
      }).required(),
    }),
  },
};

module.exports = timeslotValidators;
