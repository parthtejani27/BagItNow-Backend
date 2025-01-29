// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/environment");
const ApiError = require("../utils/apiError");
const Admin = require("../models/admin.model");
const User = require("../models/user.model");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const admin = await Admin.findById(decoded.id);

      if (!admin || !admin.isActive) {
        throw new ApiError(401, "Invalid admin authentication");
      }

      req.admin = admin;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid token");
      } else if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token has expired");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);

      console.log(decoded);

      if (!user || !user.isActive) {
        throw new ApiError(401, "Invalid user authentication");
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid token");
      } else if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token has expired");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const authorize = () => {
  return (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(403, "Admin access required");
    }
    next();
  };
};

module.exports = {
  adminAuth,
  userAuth,
  authorize,
};
