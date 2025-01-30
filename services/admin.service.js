const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const ApiError = require("../utils/apiError");
const { JWT_SECRET } = require("../config/environment");

class AdminService {
  async register(adminData) {
    try {
      // Check if username exists
      const existingUsername = await Admin.findOne({
        username: adminData.username,
      });
      if (existingUsername) {
        throw new ApiError(400, "Username already exists");
      }

      // Check if email exists
      const existingEmail = await Admin.findOne({ email: adminData.email });
      if (existingEmail) {
        throw new ApiError(400, "Email already exists");
      }

      // Create admin
      const admin = await Admin.create(adminData);

      // Generate token
      const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      const adminResponse = admin.toObject();
      delete adminResponse.password;

      return { admin: adminResponse, token };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Find admin
      const admin = await Admin.findOne({ email, isActive: true });
      if (!admin) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Check password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Generate token
      const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      const adminResponse = admin.toObject();
      delete adminResponse.password;

      return { admin: adminResponse, token };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminService();
