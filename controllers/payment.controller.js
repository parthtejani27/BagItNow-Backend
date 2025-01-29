const PaymentService = require("../services/payment.service");
const ApiResponse = require("../utils/response");

class PaymentController {
  // Create payment intent
  async createPaymentIntent(req, res, next) {
    try {
      const result = await PaymentService.createPaymentIntent(
        req.body,
        req.user
      );
      return res
        .status(201)
        .json(
          ApiResponse.success("Payment intent created successfully", result)
        );
    } catch (error) {
      next(error);
    }
  }

  // Handle Stripe webhook events
  async handleWebhook(req, res, next) {
    try {
      const event = req.body;
      await PaymentService.handleWebhook(event);
      return res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(req, res, next) {
    try {
      const result = await PaymentService.setDefaultPaymentMethod(
        req.user,
        req.body.paymentMethodId
      );
      return res.json(
        ApiResponse.success("Default payment method set successfully", result)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get payment status
  async getPaymentStatus(req, res, next) {
    try {
      const status = await PaymentService.getPaymentStatus(
        req.params.paymentId
      );
      return res.json(
        ApiResponse.success("Payment status retrieved successfully", { status })
      );
    } catch (error) {
      next(error);
    }
  }

  async getPaymentMethods(req, res, next) {
    try {
      console.log(":");
      const result = await PaymentService.getPaymentMethods(req.user.id);
      return res.json(
        ApiResponse.success("Payment status retrieved successfully", result)
      );
    } catch (error) {
      next(error);
    }
  }

  // Validate order amount
  async validateOrderAmount(req, res, next) {
    try {
      const isValid = await PaymentService.validateOrderAmount(
        req.params.orderId,
        req.body.amount
      );
      return res.json(
        ApiResponse.success("Order amount validation completed", { isValid })
      );
    } catch (error) {
      next(error);
    }
  }

  async saveCard(req, res, next) {
    try {
      const { paymentMethodId, nickname } = req.body;
      const result = await PaymentService.savePaymentMethod(
        req.user.id,
        paymentMethodId,
        nickname
      );
      return res.json(ApiResponse.success("Card saved successfully", result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
