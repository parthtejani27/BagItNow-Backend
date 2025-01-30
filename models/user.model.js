const mongoose = require("mongoose");
const baseSchema = require("./base.model");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    ...baseSchema.obj,

    // Basic Info
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    // Verification
    isActive: {
      type: Boolean,
      default: true,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    verifiedPhone: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: String,
    phoneVerificationCode: String,
    verificationCodeExpiry: Date,

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // Preferences
    preferredLanguage: {
      type: String,
      enum: ["en", "fr"],
      default: "en",
    },
    notificationPreferences: {
      email: {
        marketing: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
        deliveryUpdates: { type: Boolean, default: true },
      },
      push: {
        marketing: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
        deliveryUpdates: { type: Boolean, default: true },
      },
    },

    // Payment
    stripeCustomerId: String,
    defaultPaymentMethod: String,

    // Orders & Lists
    favoriteItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    recentlyViewedItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Referral
    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralCount: {
      type: Number,
      default: 0,
    },

    // Tokens
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Metadata
    deviceTokens: [String],
    lastOrderDate: Date,
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ "recentlyViewedItems.viewedAt": -1 });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return;
  }

  this.loginAttempts += 1;

  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 3600000; // Lock for 1 hour
  }

  await this.save();
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for orders
userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "user",
});

// Virtual for addresses
userSchema.virtual("addresses", {
  ref: "Address",
  localField: "_id",
  foreignField: "user",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
