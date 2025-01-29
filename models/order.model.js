const mongoose = require("mongoose");
const baseSchema = require("./base.model");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const deliverySchema = new mongoose.Schema({
  option: {
    type: String,
    enum: ["standard", "express", "sameday"],
    default: "standard",
  },
  instructions: {
    type: String,
    trim: true,
  },
  fee: {
    type: Number,
    required: true,
    min: 0,
  },
  estimatedDeliveryTime: Date,
});

const amountsSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  delivery: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["cod", "card", "upi", "wallet"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "authorized", "captured", "failed", "refunded"],
    default: "pending",
  },
  transactionId: String,
  paymentIntentId: String,
  clientSecret: String,
  paymentMethodId: String,
  refundId: String,
  refundAmount: Number,
  refundReason: String,
  failureReason: String,
  paidAt: Date,
});

const orderSchema = new mongoose.Schema(
  {
    ...baseSchema.obj,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    delivery: deliverySchema,
    timeslot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timeslot",
      required: true,
    },
    payment: paymentSchema,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "ready_for_pickup",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    amounts: amountsSchema,
    cancelReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "payment.status": 1 });

// Generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = (await this.constructor.countDocuments()) + 1;
  }
  next();
});

// Methods
orderSchema.methods.canCancel = function () {
  const nonCancellableStatuses = ["delivered", "cancelled", "refunded"];
  return !nonCancellableStatuses.includes(this.status);
};

orderSchema.methods.canRefund = function () {
  return (
    this.status === "delivered" &&
    this.payment.status === "captured" &&
    !this.payment.refundId
  );
};

orderSchema.methods.calculateAmounts = function () {
  this.amounts.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.amounts.total =
    this.amounts.subtotal +
    this.amounts.delivery +
    this.amounts.tax -
    this.amounts.discount;
  return this.amounts;
};

// Virtuals
orderSchema.virtual("isComplete").get(function () {
  return ["delivered", "cancelled", "refunded"].includes(this.status);
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);
