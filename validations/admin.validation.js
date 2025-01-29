const Joi = require("joi");

const adminValidation = {
  register: Joi.object({
    username: Joi.string().required().min(3),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),

  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

module.exports = adminValidation;
