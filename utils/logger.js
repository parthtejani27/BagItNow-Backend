const winston = require("winston");
const { NODE_ENV } = require("../config/environment");

const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  // transports: [
  //   new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  //   new winston.transports.File({ filename: "logs/combined.log" }),
  // ],
});

if (NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
