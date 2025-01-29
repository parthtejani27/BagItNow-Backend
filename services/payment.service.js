// services/payment.service.js

const Order = require("../models/order.model");
const Payment = require("../models/payment.model");
const PaymentMethod = require("../models/paymentMethod.model");
const BaseService = require("./base.service");
const ApiError = require("../utils/apiError");
const { STRIPE_SECRET_KEY } = require("../config/environment");
const User = require("../models/user.model");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

class PaymentService extends BaseService {
  constructor() {
    super(Payment);
  }

  async createPaymentIntent(orderData, user) {
    try {
      // Calculate order amount
      const amount = this.calculateOrderAmount(orderData.items);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "cad",
        customer: user.stripeCustomerId,
        setup_future_usage: orderData.savePaymentMethod
          ? "off_session"
          : undefined,
        metadata: {
          orderId: orderData.orderId,
          userId: user._id.toString(),
        },
        payment_method_types: ["card", "apple_pay", "google_pay"],
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
      });

      // Create payment record
      const payment = await this.create({
        user: user._id,
        order: orderData.orderId,
        amount,
        currency: "usd",
        paymentIntentId: paymentIntent.id,
        status: "pending",
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
      };
    } catch (error) {
      throw new ApiError(
        400,
        "Error creating payment intent: " + error.message
      );
    }
  }

  async handleWebhook(event) {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    const payment = await this.model.findOne({
      paymentIntentId: paymentIntent.id,
    });

    if (!payment) throw new ApiError(404, "Payment not found");

    payment.status = "completed";
    payment.paymentMethod = paymentIntent.payment_method;
    await payment.save();

    // Update order status
    await Order.findByIdAndUpdate(payment.order, {
      status: "paid",
      paymentStatus: "completed",
    });
  }

  async handlePaymentFailure(paymentIntent) {
    const payment = await this.model.findOne({
      paymentIntentId: paymentIntent.id,
    });

    if (!payment) throw new ApiError(404, "Payment not found");

    payment.status = "failed";
    payment.failureReason = paymentIntent.last_payment_error?.message;
    await payment.save();

    // Update order status
    await Order.findByIdAndUpdate(payment.order, {
      status: "payment_failed",
      paymentStatus: "failed",
    });
  }

  async setDefaultPaymentMethod(user, paymentMethodId) {
    try {
      const customer = await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await PaymentMethod.updateMany(
        { userId: user._id },
        { $set: { isDefault: false } }
      );

      await PaymentMethod.findOneAndUpdate(
        { userId: user._id, stripePaymentMethodId: paymentMethodId },
        { $set: { isDefault: true } }
      );

      return customer.invoice_settings;
    } catch (error) {
      throw new ApiError(
        400,
        `Error setting default payment method: ${error.message}`
      );
    }
  }
  async getPaymentStatus(paymentId) {
    const payment = await this.model.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment.status;
  }

  async getPaymentMethods(userId) {
    try {
      const user = await User.findById(userId);
      if (!user.stripeCustomerId) return { paymentMethods: [] };

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      const defaultPaymentMethodId =
        customer.invoice_settings.default_payment_method;

      const formattedMethods = paymentMethods.data.map((method) => ({
        id: method.id,
        brand: method.card.brand,
        last4: method.card.last4,
        expiryMonth: method.card.exp_month,
        expiryYear: method.card.exp_year,
        isDefault: method.id === defaultPaymentMethodId,
      }));

      return {
        paymentMethods: formattedMethods,
        defaultPaymentMethod: formattedMethods.find((m) => m.isDefault),
      };
    } catch (error) {
      throw new ApiError(
        400,
        "Failed to get payment methods: " + error.message
      );
    }
  }

  async validateOrderAmount(orderId, amount) {
    const payment = await this.model.findOne({ order: orderId });
    if (!payment) return false;
    return payment.amount === amount;
  }

  async savePaymentMethod(userId, paymentMethodId, nickname) {
    try {
      // Get user's Stripe customer ID
      const user = await User.findById(userId);
      let customerId = user.stripeCustomerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
        });
        customerId = customer.id;
        await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
      }

      // Attach payment method to Stripe customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Get all user's payment methods to check if this is the first one
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      // Get payment method details from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentMethodId
      );

      // Save to database
      const savedPaymentMethod = await PaymentMethod.create({
        userId,
        stripePaymentMethodId: paymentMethodId,
        nickname,
        isDefault: paymentMethods.data.length === 1,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expiryMonth: paymentMethod.card.exp_month,
        expiryYear: paymentMethod.card.exp_year,
      });

      // If it's the first payment method, set as default in Stripe
      if (paymentMethods.data.length === 1) {
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      return savedPaymentMethod;
    } catch (error) {
      throw new ApiError(
        400,
        "Failed to save payment method: " + error.message
      );
    }
  }

  // Update calculateOrderAmount to match the order service's calculation
  calculateOrderAmount(items, delivery = 0, tax = 0) {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return subtotal + delivery + tax;
  }
}

module.exports = new PaymentService();
