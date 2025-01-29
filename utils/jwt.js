const jwt = require("jsonwebtoken");

exports.generateJWT = (userId, expiresIn = "15m") => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn });
};
