const Joi = require("joi");
const { objectId } = require("./custom.validation");
const subcategoryValidation = {
  createSubcategory: {
    body: Joi.object({
      name: Joi.string().required().min(2).max(50),
      description: Joi.string().max(500),
      category: Joi.string().custom(objectId).required(),
      imageUrl: Joi.string().uri(),
      isActive: Joi.boolean(),
      order: Joi.number().integer().min(0),
    }),
  },

  updateSubcategory: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(50),
      description: Joi.string().max(500),
      category: Joi.string().custom(objectId),
      imageUrl: Joi.string().uri(),
      isActive: Joi.boolean(),
      order: Joi.number().integer().min(0),
    }).min(1),
  },

  getSubcategory: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
  },

  getByCategoryId: {
    params: Joi.object({
      categoryId: Joi.string().custom(objectId).required(),
    }),
  },

  deleteSubcategory: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
  },

  updateOrder: {
    params: Joi.object({
      categoryId: Joi.string().custom(objectId).required(),
    }),
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

module.exports = subcategoryValidation;
