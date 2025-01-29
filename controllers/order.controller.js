const OrderService = require("../services/order.service");
const ApiResponse = require("../utils/response");

class OrderController {
  async createOrderWithPayment(req, res, next) {
    try {
      const { order, payment } = await OrderService.createOrderWithPayment(
        req.user._id,
        req.body
      );

      return res.status(201).json(
        ApiResponse.success("Order created successfully", {
          order,
          payment,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Create order
  async createOrder(req, res, next) {
    try {
      const order = await OrderService.createOrder(req.user.id, req.body);
      return res
        .status(201)
        .json(ApiResponse.success("Order created successfully", order));
    } catch (error) {
      next(error);
    }
  }

  // Get user orders
  async getUserOrders(req, res, next) {
    try {
      const result = await OrderService.getUserOrders(req.user.id, req.query);
      return res.json(
        ApiResponse.success("Orders retrieved successfully", result)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get order details
  async getOrderDetails(req, res, next) {
    try {
      const order = await OrderService.getOrderDetails(
        req.user.id,
        req.params.orderId
      );
      return res.json(
        ApiResponse.success("Order details retrieved successfully", order)
      );
    } catch (error) {
      next(error);
    }
  }

  // Cancel order
  async cancelOrder(req, res, next) {
    try {
      const order = await OrderService.cancelOrder(
        req.user.id,
        req.params.orderId
      );
      return res.json(
        ApiResponse.success("Order cancelled successfully", order)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
