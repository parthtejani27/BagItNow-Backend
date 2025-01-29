const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { userAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const userValidators = require("../validations/user.validation");

router.post(
  "/checkUser",
  validate(userValidators.checkUser),
  userController.checkUser.bind(userController)
);

router.post(
  "/sendOTP",
  validate(userValidators.sendOTP),
  userController.sendOTP.bind(userController)
);

router.post(
  "/verifyOTP",
  validate(userValidators.verifyOTP),
  userController.verifyOTP.bind(userController)
);

router.post(
  "/savePassword",
  validate(userValidators.savePassword),
  userController.savePassword.bind(userController)
);

router.post(
  "/register",
  validate(userValidators.register),
  userController.register.bind(userController)
);

router.post(
  "/login",
  validate(userValidators.login),
  userController.login.bind(userController)
);

router.post(
  "/refreshToken",
  validate(userValidators.refreshToken),
  userController.refreshToken.bind(userController)
);

router.get(
  "/profile",
  userAuth,
  userController.getProfile.bind(userController)
);

router.post(
  "/payment-method/default",
  userAuth,
  validate(userValidators.updatePaymentMethod),
  userController.setDefaultPaymentMethod
);
router.post(
  "/favorites",
  userAuth,
  validate(userValidators.addFavoriteItem),
  userController.toggleFavoriteItem
);
router.post("/device-token", userAuth, userController.updateDeviceToken);
router.put(
  "/notifications",
  userAuth,
  validate(userValidators.updateNotificationPreferences),
  userController.updateNotificationPreferences
);

router.patch(
  "/profile",
  validate(userValidators.updateProfile),
  userController.updateProfile.bind(userController)
);

module.exports = router;
