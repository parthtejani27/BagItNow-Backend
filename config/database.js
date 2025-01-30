const mongoose = require("mongoose");
const { MONGODB_URI } = require("./environment");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("MongoDB Connected");
  } catch (error) {
    logger.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
