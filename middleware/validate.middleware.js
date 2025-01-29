// middleware/validate.middleware.js
const ApiError = require("../utils/apiError");

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validationContext = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      let error;

      // Validate body if schema has body validation
      if (schema.body) {
        const { error: bodyError } = schema.body.validate(req.body, {
          abortEarly: false,
          allowUnknown: true,
        });
        if (bodyError) error = bodyError;
      }

      // Validate params if schema has params validation
      if (schema.params) {
        const { error: paramsError } = schema.params.validate(req.params, {
          abortEarly: false,
          allowUnknown: true,
        });
        if (paramsError) error = paramsError;
      }

      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return next(new ApiError(400, errorMessage));
      }

      return next();
    } catch (error) {
      return next(new ApiError(500, "Validation error"));
    }
  };
};

module.exports = validate;
