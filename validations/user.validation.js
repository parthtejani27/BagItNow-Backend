const Joi = require("joi");

const userValidators = {
  checkUser: Joi.object({
    emailOrPhone: Joi.alternatives()
      .try(
        Joi.string().email().message("Invalid email format"),
        Joi.string()
          .pattern(/^[0-9]{10,15}$/)
          .message("Invalid phone number format")
      )
      .required(),
  }),

  sendOTP: Joi.object({
    emailOrPhone: Joi.alternatives()
      .try(
        Joi.string().email().message("Invalid email format"),
        Joi.string()
          .pattern(/^[+][0-9]{10,15}$/)
          .message("Invalid phone number format")
      )
      .required(),
  }),

  verifyOTP: Joi.object({
    type: Joi.string().valid("email", "phone").required(),
    value: Joi.string()
      .required()
      .when("type", {
        is: "email",
        then: Joi.string().email(),
        otherwise: Joi.string().pattern(/^[+][0-9]{10,15}$/),
      }),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required(),
    verificationId: Joi.string().required(),
    userId: Joi.string().required(),
  }),

  savePassword: Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }),
    userId: Joi.string().required(),
  }),

  register: Joi.object({
    userId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }),

  login: Joi.object({
    userId: Joi.string().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  updateProfile: {
    body: Joi.object()
      .keys({
        name: Joi.string().min(2).max(50),
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        avatar: Joi.string().uri(),
        oldPassword: Joi.string().min(8).when("newPassword", {
          is: Joi.exist(),
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        newPassword: Joi.string().min(8).optional(),
        language: Joi.string().valid("en", "es", "fr").default("en"),
        notifications: Joi.object({
          email: Joi.boolean(),
          push: Joi.boolean(),
          sms: Joi.boolean(),
        }),
      })
      .min(1), // At least one field must be present
  },

  // New validators for payment related operations
  updatePaymentMethod: Joi.object({
    paymentMethodId: Joi.string().required(),
  }),

  addFavoriteItem: Joi.object({
    productId: Joi.string().required(),
  }),

  updateNotificationPreferences: Joi.object({
    orderUpdates: Joi.boolean(),
    promotions: Joi.boolean(),
    deliveryUpdates: Joi.boolean(),
  }),
};

module.exports = userValidators;
