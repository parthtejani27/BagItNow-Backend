const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { userAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const cartValidation = require("../validations/cart.validation");

router.use(userAuth); // All cart routes require authentication

router.get("/", cartController.getCart.bind(cartController));

router.post(
  "/items",
  validate(cartValidation.addItem),
  cartController.addItem.bind(cartController)
);

router.patch(
  "/items",
  validate(cartValidation.updateQuantity),
  cartController.updateQuantity.bind(cartController)
);

router.delete(
  "/items/:productId",
  validate(cartValidation.removeItem),
  cartController.removeItem.bind(cartController)
);

router.delete("/clear", cartController.clearCart.bind(cartController));

router.get("/summary", cartController.getCartSummary.bind(cartController));

module.exports = router;
