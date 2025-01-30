const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { userAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const paymentValidation = require("../validations/payment.validation");

router.use(userAuth);

// Create payment intent
router.post(
  "/intent",
  validate(paymentValidation.createPaymentIntent),
  paymentController.createPaymentIntent.bind(paymentController)
);

// Handle Stripe webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Raw body parser for Stripe webhooks
  paymentController.handleWebhook.bind(paymentController)
);

// Set default payment method
router.post(
  "/set-default",
  validate(paymentValidation.setDefaultPaymentMethod),
  paymentController.setDefaultPaymentMethod.bind(paymentController)
);

// Get payment status
router.get(
  "/:paymentId/status",
  validate(paymentValidation.getPaymentStatus),
  paymentController.getPaymentStatus.bind(paymentController)
);

// Get default payment
router.get(
  "/methods",
  paymentController.getPaymentMethods.bind(paymentController)
);

// Validate order amount
router.post(
  "/:orderId/validate-amount",
  validate(paymentValidation.validateOrderAmount),
  paymentController.validateOrderAmount.bind(paymentController)
);

router.post(
  "/save-card",
  validate(paymentValidation.saveCard),
  paymentController.saveCard.bind(paymentController)
);

module.exports = router;
