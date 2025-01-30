const BaseService = require("./base.service");
const TokenService = require("./token.service");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const { STRIPE_SECRET_KEY } = require("../config/environment");
const { default: mongoose } = require("mongoose");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  async register(userData, userAgent, ipAddress) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingUser = await this.findById(userData._id);
      if (existingUser) {
        throw new ApiError(400, "Email already registered");
      }

      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: userData.email,
        phone: userData.phone,
        name: `${userData.firstName} ${userData.lastName}`,
      });

      const user = await User.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId.createFromHexString(userData.userId) },
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          isRegistered: true,
          stripeCustomerId: stripeCustomer.id,
        },
        {
          new: true,
          upsert: true,
          session,
          runValidators: true,
        }
      );

      const { accessToken, refreshToken } = await TokenService.createTokens(
        userData.userId,
        userAgent,
        ipAddress
      );

      await session.commitTransaction();
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, accessToken, refreshToken };
    } catch (err) {
      await session.abortTransaction();
      throw new ApiError(400, "Failed to register: " + err.message);
    } finally {
      session.endSession();
    }
  }

  async setDefaultPaymentMethod(userId, paymentMethodId) {
    const user = await this.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    try {
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      user.defaultPaymentMethod = paymentMethodId;
      await user.save();

      return user;
    } catch (error) {
      throw new ApiError(400, "Failed to set default payment method");
    }
  }

  async updateOrderStats(userId, orderAmount) {
    const user = await this.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.totalOrders += 1;
    user.totalSpent += orderAmount;
    user.lastOrderDate = new Date();

    await user.save();
    return user;
  }

  async toggleFavoriteItem(userId, productId) {
    const user = await this.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const index = user.favoriteItems.indexOf(productId);
    if (index > -1) {
      user.favoriteItems.splice(index, 1);
    } else {
      user.favoriteItems.push(productId);
    }

    await user.save();
    return user;
  }

  async updateDeviceToken(userId, deviceToken) {
    const user = await this.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
      await user.save();
    }
    return user;
  }

  // Existing methods...
  async login(userId, password, userAgent, ipAddress) {
    const user = await User.findById(userId).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await TokenService.createTokens(
      userId,
      userAgent,
      ipAddress
    );
    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken, userAgent, ipAddress) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const { newAccessToken, newRefreshToken } =
        await TokenService.createTokens(decoded.userId, userAgent, ipAddress);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "Refresh token expired");
      }
      throw new ApiError(401, "Invalid refresh token");
    }
  }

  async updateProfile(userId, updateData) {
    const user = await this.model.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Handle password update
    if (updateData.newPassword) {
      // Verify old password
      const isPasswordValid = await bcrypt.compare(
        updateData.oldPassword,
        user.password
      );
      if (!isPasswordValid) {
        throw new ApiError(400, "Current password is incorrect");
      }

      // Hash new password
      updateData.password = await bcrypt.hash(updateData.newPassword, 10);
      delete updateData.newPassword;
      delete updateData.oldPassword;
    }

    // Handle email update
    if (updateData.email && updateData.email !== user.email) {
      // Check if email is already taken
      const existingUser = await this.model.findOne({
        email: updateData.email,
      });
      if (existingUser) {
        throw new ApiError(400, "Email already in use");
      }
      updateData.isEmailVerified = false; // Reset email verification
    }

    // Handle phone update
    if (updateData.phone && updateData.phone !== user.phone) {
      // Check if phone is already taken
      const existingUser = await this.model.findOne({
        phone: updateData.phone,
      });
      if (existingUser) {
        throw new ApiError(400, "Phone number already in use");
      }
      updateData.isPhoneVerified = false; // Reset phone verification
    }

    // Update user
    const updatedUser = await this.model
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      )
      .select("-password");

    return updatedUser;
  }
}

module.exports = new UserService();
