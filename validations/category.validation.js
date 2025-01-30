const Joi = require("joi");
const { objectId } = require("./custom.validation");

const categoryValidation = {
  createCategory: {
    body: Joi.object({
      name: Joi.string().required().min(2).max(50),
      description: Joi.string().max(500),
      imageUrl: Joi.string().uri(),
      isActive: Joi.boolean(),
      order: Joi.number().integer().min(0),
    }),
  },

  updateCategory: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(50),
      description: Joi.string().max(500),
      imageUrl: Joi.string().uri(),
      isActive: Joi.boolean(),
      order: Joi.number().integer().min(0),
    }).min(1),
  },

  getCategory: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
  },

  deleteCategory: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
  },

  updateOrder: {
    body: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().custom(objectId).required(),
          order: Joi.number().integer().min(0).required(),
        })
      )
      .min(1),
  },
};

module.exports = categoryValidation;
