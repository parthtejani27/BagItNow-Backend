const CartService = require("../services/cart.service");
const ApiResponse = require("../utils/response");

class CartController {
  // Get cart
  async getCart(req, res, next) {
    try {
      const cart = await CartService.getUserCart(req.user.id);
      return res.json(ApiResponse.success("Cart retrieved successfully", cart));
    } catch (error) {
      next(error);
    }
  }

  // Add item to cart
  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const cart = await CartService.addItem(req.user.id, productId, quantity);
      return res.json(
        ApiResponse.success("Item added to cart successfully", cart)
      );
    } catch (error) {
      next(error);
    }
  }

  // Update item quantity
  async updateQuantity(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const cart = await CartService.updateItemQuantity(
        req.user.id,
        productId,
        quantity
      );
      return res.json(ApiResponse.success("Cart updated successfully", cart));
    } catch (error) {
      next(error);
    }
  }

  // Remove item from cart
  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const cart = await CartService.removeItem(req.user.id, productId);
      return res.json(
        ApiResponse.success("Item removed from cart successfully", cart)
      );
    } catch (error) {
      next(error);
    }
  }

  // Clear cart
  async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart(req.user.id);
      return res.json(ApiResponse.success("Cart cleared successfully", cart));
    } catch (error) {
      next(error);
    }
  }

  // Get cart summary
  async getCartSummary(req, res, next) {
    try {
      const summary = await CartService.getCartSummary(req.user.id);
      return res.json(
        ApiResponse.success("Cart summary retrieved successfully", summary)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
