const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");

class CartService {
  // Get user's cart
  async getUserCart(userId) {
    let cart = await Cart.findOne({
      user: userId,
      status: "active",
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        status: "active",
      });
    }

    return cart;
  }

  // Add item to cart
  async addItem(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
      throw new ApiError(400, "Not enough stock available");
    }

    let cart = await this.getUserCart(userId);

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
      existingItem.productDetails = {
        name: product.name,
        imageUrl: product.imageUrl,
        unit: product.unit,
      };
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        productDetails: {
          name: product.name,
          imageUrl: product.imageUrl,
          unit: product.unit,
        },
      });
    }

    return await cart.save();
  }

  // Update cart item quantity
  async updateItemQuantity(userId, productId, quantity) {
    const cart = await this.getUserCart(userId);
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      throw new ApiError(404, "Item not found in cart");
    }

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      throw new ApiError(400, "Not enough stock available");
    }

    item.quantity = quantity;
    return await cart.save();
  }

  // Remove item from cart
  async removeItem(userId, productId) {
    const cart = await this.getUserCart(userId);
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    return await cart.save();
  }

  // Clear cart
  async clearCart(userId) {
    const cart = await this.getUserCart(userId);
    cart.items = [];
    return await cart.save();
  }

  // Get cart summary
  async getCartSummary(userId) {
    const cart = await this.getUserCart(userId);
    const summary = {
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.totalAmount,
      tax: cart.totalAmount * 0.1, // 10% tax
      shipping: cart.totalAmount > 100 ? 0 : 10, // Free shipping over $100
      total: 0,
    };

    summary.total = summary.subtotal + summary.tax + summary.shipping;
    return summary;
  }
}

module.exports = new CartService();
