const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const refreshToken = require("../models/refreshToken");
const BaseService = require("./base.service");
const { REFRESH_TOKEN_SECRET, JWT_SECRET } = require("../config/environment");

class TokenService extends BaseService {
  generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  }

  generateRefreshToken(userId) {
    const refreshToken = jwt.sign(
      {
        userId,
        random: crypto.randomBytes(40).toString("hex"), // Add randomness
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return refreshToken;
  }

  verifyToken(token, isRefreshToken = false) {
    try {
      return jwt.verify(
        token,
        isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET
      );
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async createTokens(userId, userAgent, ipAddress) {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    // Save refresh token
    await this.saveRefreshToken(userId, refreshToken, userAgent, ipAddress);

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(userId, token, userAgent, ipAddress) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshtoken = await refreshToken.create({
      userId,
      token,
      expiresAt,
      isValid: true,
      metadata: {
        userAgent,
        ipAddress,
        createdAt: new Date(),
      },
    });
    return refreshtoken;
  }
}

const tokenService = new TokenService();
module.exports = tokenService;
