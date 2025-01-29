const Joi = require("joi");
const { objectId } = require("./custom.validation");

const productValidation = {
  createProduct: {
    body: Joi.object({
      name: Joi.string().required().min(2).max(100),
      description: Joi.string().required().min(10),
      price: Joi.number().required().min(0),
      category: Joi.string().custom(objectId).required(),
      subcategory: Joi.string().custom(objectId).required(),
      imageUrl: Joi.string().required().uri(),
      stock: Joi.number().required().min(0),
      specifications: Joi.object(),
      brand: Joi.string(),
      unit: Joi.string(),
      tags: Joi.array().items(Joi.string()),
      discountPercentage: Joi.number().min(0).max(100),
      isActive: Joi.boolean(),
    }),
  },

  updateProduct: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      description: Joi.string().min(10),
      price: Joi.number().min(0),
      category: Joi.string().custom(objectId),
      subcategory: Joi.string().custom(objectId),
      imageUrl: Joi.string().uri(),
      stock: Joi.number().min(0),
      specifications: Joi.object(),
      brand: Joi.string(),
      unit: Joi.string(),
      tags: Joi.array().items(Joi.string()),
      discountPercentage: Joi.number().min(0).max(100),
      isActive: Joi.boolean(),
    }).min(1),
  },

  getProduct: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
  },

  deleteProduct: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
  },

  updateStock: {
    params: Joi.object({
      id: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object({
      quantity: Joi.number().required().min(1),
    }),
  },
};

module.exports = productValidation;
