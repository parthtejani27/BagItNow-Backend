// services/order.service.js

const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Payment = require("../models/payment.model");
const paymentService = require("./payment.service");
const ApiError = require("../utils/apiError");
const { default: mongoose } = require("mongoose");
const User = require("../models/user.model");
const PaymentMethod = require("../models/paymentMethod.model");
const { STRIPE_SECRET_KEY } = require("../config/environment");

const stripe = require("stripe")(STRIPE_SECRET_KEY);

class OrderService {
  constructor() {}

  async createOrderWithPayment(userId, orderData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [user, cart, defaultPaymentMethod] = await Promise.all([
        User.findById(userId),
        Cart.findOne({ user: userId, status: "active" }).populate(
          "items.product"
        ),
        PaymentMethod.findOne({ userId, isDefault: true, isActive: true }),
      ]);

      if (!cart?.items.length) throw new ApiError(400, "Cart is empty");
      if (orderData.payment.method === "card" && !defaultPaymentMethod) {
        throw new ApiError(400, "No default payment method found");
      }

      const amounts = this.calculateAmounts(
        cart.items,
        orderData.delivery.option
      );
      const order = await this.createOrder(
        userId,
        cart,
        orderData,
        amounts,
        session
      );

      let paymentDetails = null;
      if (orderData.payment.method === "card") {
        paymentDetails = await this.processCardPayment(
          order,
          user.stripeCustomerId,
          defaultPaymentMethod.stripePaymentMethodId,
          amounts.total,
          session
        );
      }

      // await this.updateInventoryAndCart(cart, session);
      await session.commitTransaction();

      return { order, payment: paymentDetails };
    } catch (error) {
      await session.abortTransaction();
      throw new ApiError(error.statusCode || 500, error.message);
    } finally {
      session.endSession();
    }
  }

  async createOrder(userId, cart, orderData, amounts, session) {
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      quantity: item.quantity,
      price: item.product.price,
      total: item.quantity * item.product.price,
    }));

    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          address: orderData.address,
          delivery: {
            option: orderData.delivery.option,
            instructions: orderData.delivery.instructions,
            fee: amounts.delivery,
            estimatedDeliveryTime: this.calculateEstimatedDelivery(
              orderData.delivery.option
            ),
          },
          timeslot: orderData.timeslot,
          payment: {
            method: orderData.payment.method,
            status: "pending",
          },
          amounts,
          status: "pending",
        },
      ],
      { session }
    );

    return order;
  }

  async processCardPayment(
    order,
    customerId,
    paymentMethodId,
    amount,
    session
  ) {
    const stripeIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "cad",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          "payment.paymentIntentId": stripeIntent.id,
          "payment.paymentMethodId": paymentMethodId,
          "payment.status": "authorized",
        },
      },
      { session }
    );

    return { paymentIntentId: stripeIntent.id };
  }

  calculateEstimatedDelivery(option) {
    const now = new Date();
    switch (option) {
      case "sameday":
        return new Date(now.setHours(now.getHours() + 3));
      case "express":
        return new Date(now.setHours(now.getHours() + 6));
      case "standard":
        return new Date(now.setHours(now.getHours() + 24));
      default:
        return new Date(now.setHours(now.getHours() + 24));
    }
  }

  // async createOrder(userId, orderData) {
  //   // Get user's cart
  //   const cart = await Cart.findOne({
  //     user: userId,
  //     status: "active",
  //   }).populate("items.product");

  //   if (!cart || cart.items.length === 0) {
  //     throw new ApiError(400, "Cart is empty");
  //   }

  //   // Calculate amounts
  //   const amounts = this.calculateAmounts(
  //     cart.items,
  //     orderData.delivery.option
  //   );

  //   // Create order items
  //   const orderItems = cart.items.map((item) => ({
  //     product: item.product._id,
  //     quantity: item.quantity,
  //     price: item.product.price,
  //     total: item.quantity * item.product.price,
  //   }));

  //   // Create initial order
  //   const order = await Order.create({
  //     user: userId,
  //     items: orderItems,
  //     address: orderData.address,
  //     delivery: orderData.delivery,
  //     timeslot: orderData.timeslot,
  //     payment: {
  //       method: orderData.payment.method,
  //       status: "pending",
  //     },
  //     amounts,
  //     status: orderData.payment.method === "cod" ? "confirmed" : "pending",
  //   });

  //   // If payment method is card, create payment intent
  //   if (orderData.payment.method === "card") {
  //     const paymentData = {
  //       orderId: order._id,
  //       items: orderItems,
  //       savePaymentMethod: orderData.payment.saveCard || false,
  //     };

  //     const paymentResult = await paymentService.createPaymentIntent(
  //       paymentData,
  //       { _id: userId, stripeCustomerId: orderData.stripeCustomerId }
  //     );

  //     // Update order with payment info
  //     order.payment.clientSecret = paymentResult.clientSecret;
  //     order.payment.paymentId = paymentResult.paymentId;
  //     await order.save();
  //   }

  //   // Update product stock
  //   await Promise.all(
  //     cart.items.map((item) =>
  //       Product.findByIdAndUpdate(item.product._id, {
  //         $inc: { stock: -item.quantity },
  //       })
  //     )
  //   );

  //   // Clear cart
  //   await Cart.findByIdAndUpdate(cart._id, {
  //     status: "completed",
  //     items: [],
  //   });

  //   return order;
  // }

  calculateAmounts(items, deliveryOption) {
    const subtotal = items.reduce(
      (total, item) => total + item.quantity * item.product.price,
      0
    );

    const deliveryCharges = {
      standard: 40,
      express: 80,
      sameday: 120,
    };

    const delivery = deliveryCharges[deliveryOption];
    const tax = subtotal * 0.18; // 18% tax

    return {
      subtotal,
      delivery,
      tax,
      total: subtotal + delivery + tax,
    };
  }

  // Get user's orders
  async getUserOrders(userId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const filter = { user: userId };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("items.product", "name imageUrl")
      .populate("address")
      .populate("timeslot")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(userId, orderId) {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("items.product")
      .populate("address")
      .populate("timeslot");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }

  async cancelOrder(userId, orderId) {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: { $nin: ["delivered", "cancelled"] },
    });

    if (!order) {
      throw new ApiError(404, "Order not found or cannot be cancelled");
    }

    // Restore product stock
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      )
    );

    order.status = "cancelled";
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
