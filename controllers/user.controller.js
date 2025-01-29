const BaseController = require("./base.controller");
const userService = require("../services/user.service");
const OTPService = require("../services/otp.service");
const ApiResponse = require("../utils/response");
const { validateEmail, validatePhone } = require("../utils/validation");
const { generateOTP } = require("../utils/otp");
const otpService = require("../services/otp.service");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const tokenService = require("../services/token.service");

class UserController extends BaseController {
  constructor() {
    super(userService);
  }

  async checkUser(req, res, next) {
    try {
      const { emailOrPhone } = req.body;

      let query = {};
      let type;

      if (validateEmail(emailOrPhone)) {
        query = { email: emailOrPhone.toLowerCase() };
        type = "email";
      } else if (validatePhone(emailOrPhone)) {
        query = { phone: emailOrPhone };
        type = "phone";
      }

      const user = await userService.findOne(query);

      const otpData = {
        type: type,
        otp: 111111 || generateOTP(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      Object.assign(otpData, query);
      const OTPDetails = await OTPService.saveOTP(otpData);

      // if (type === "email") {
      //   await sendEmailOTP(emailOrPhone, otp);
      // } else {
      //   await sendSMSOTP(emailOrPhone, otp);
      // }

      if (!!user) {
        const responseData = Object.assign({}, user.toObject(), {
          verificationId: OTPDetails._id,
        });
        res.json(ApiResponse.success("OTP Sent Successfully", responseData));
      } else {
        const user = await userService.create(query);
        const responseData = Object.assign({}, user.toObject(), {
          verificationId: OTPDetails._id,
        });
        res.json(ApiResponse.success("OTP Sent Successfully", responseData));
      }
    } catch (error) {
      next(error);
    }
  }

  async sendOTP(req, res, next) {
    try {
      const { emailOrPhone } = req.body;

      let query = {};
      let type = {};

      if (validateEmail(emailOrPhone)) {
        query = { email: emailOrPhone.toLowerCase() };
        type = "email";
      } else if (validatePhone(emailOrPhone)) {
        query = { phone: emailOrPhone };
        type = "phone";
      }

      const otpData = {
        type: type,
        otp: 111111 || generateOTP(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      Object.assign(otpData, query);
      const OTPDetails = await OTPService.saveOTP(otpData);

      res.status(201).json(
        ApiResponse.success("OTP sent successfully", {
          verificationId: OTPDetails._id,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { type, value, otp, verificationId, userId } = req.body;

      const userAgent = req.headers["user-agent"];
      const ipAddress = req.ip;

      // Find OTP record
      const otpRecord = await otpService.findOne({
        _id: mongoose.Types.ObjectId.createFromHexString(verificationId),
        [type]: value,
        expiresAt: { $gt: Date.now() }, // Check if OTP hasn't expired
      });

      // If OTP record not found or expired
      if (!otpRecord) {
        return res
          .status(400)
          .json(ApiResponse.error("Invalid or expired OTP"));
      }

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        // Increment failed attempts
        otpRecord.attempts += 1;
        await otpRecord.save();

        // Check if max attempts exceeded
        if (otpRecord.attempts >= 3) {
          await otpService.deleteOne({ _id: otpRecord._id });
          return res
            .status(400)
            .json(
              ApiResponse.error(
                "Maximum attempts exceeded. Please request a new OTP."
              )
            );
        }

        return res.status(400).json(ApiResponse.error("Invalid OTP"));
      }

      // Check if user exists
      const existingUser = await userService.findById(userId);
      existingUser[type] = value;
      if (type === "phone") {
        existingUser.verifiedPhone = true;
      } else {
        existingUser.verifiedEmail = true;
      }

      await existingUser.save();

      // Delete used OTP
      await otpService.deleteOne({ _id: otpRecord._id });

      if (existingUser.isRegistered) {
        // Generate JWT token for existing user

        const { accessToken, refreshToken } = await tokenService.createTokens(
          existingUser._id,
          userAgent,
          ipAddress
        );

        await session.commitTransaction();

        res.status(200).json(
          ApiResponse.success("User Logged In successfully", {
            user: existingUser,
            isRegistered: existingUser.isRegistered,
            accessToken,
            refreshToken,
          })
        );
      } else {
        await session.commitTransaction();
        return res.status(200).json(
          ApiResponse.success(`${type} is verified`, {
            isRegistered: existingUser.isRegistered,
            user: existingUser,
          })
        );
      }
    } catch (error) {
      await session.commitTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }

  async savePassword(req, res, next) {
    try {
      const { password, userId } = req.body;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Find temporary user data by email or phone
      const user = await userService.findById(userId);

      if (!user) {
        return res.status(400).json(ApiResponse.error("User not Found"));
      }

      // Update user with hashed password
      user.password = password;
      await user.save();

      res.status(200).json(ApiResponse.success("Password saved successfully"));
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const userAgent = req.headers["user-agent"];
      const ipAddress = req.ip;
      const { user, accessToken, refreshToken } = await userService.register(
        req.body,
        userAgent,
        ipAddress
      );

      res.status(201).json(
        ApiResponse.success("User registered successfully", {
          user,
          accessToken,
          refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const userAgent = req.headers["user-agent"];
      const ipAddress = req.ip;
      const { userId, password } = req.body;
      const { user, accessToken, refreshToken } = await userService.login(
        userId,
        password,
        userAgent,
        ipAddress
      );
      res.status(200).json(
        ApiResponse.success("Login successful", {
          user,
          accessToken,
          refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userAgent = req.headers["user-agent"];
      const ipAddress = req.ip;
      if (!refreshToken) {
        throw new ApiError(401, "Refresh token required");
      }

      const { newAccessToken, newRefreshToken } =
        await userService.refreshToken(refreshToken, userAgent, ipAddress);

      res.json(
        ApiResponse.success("Token Generated successful", {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      res.json(ApiResponse.success("Profile retrieved successfully", req.user));
    } catch (error) {
      next(error);
    }
  }

  async setDefaultPaymentMethod(req, res, next) {
    try {
      const { paymentMethodId } = req.body;
      const user = await userService.setDefaultPaymentMethod(
        req.user._id,
        paymentMethodId
      );

      res.json(ApiResponse.success("Default payment method updated", user));
    } catch (error) {
      next(error);
    }
  }

  async toggleFavoriteItem(req, res, next) {
    try {
      const { productId } = req.body;
      const user = await userService.toggleFavoriteItem(
        req.user._id,
        productId
      );

      res.json(ApiResponse.success("Favorites updated", user));
    } catch (error) {
      next(error);
    }
  }

  async updateDeviceToken(req, res, next) {
    try {
      const { deviceToken } = req.body;
      const user = await userService.updateDeviceToken(
        req.user._id,
        deviceToken
      );

      res.json(ApiResponse.success("Device token updated", user));
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationPreferences(req, res, next) {
    try {
      const user = await userService.findByIdAndUpdate(
        req.user._id,
        { notificationPreferences: req.body },
        { new: true }
      );

      res.json(ApiResponse.success("Notification preferences updated", user));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedUser = await UserService.updateProfile(userId, updateData);

      return res.json(
        ApiResponse.success("Profile updated successfully", updatedUser)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
