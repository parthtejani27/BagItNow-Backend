const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { userAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const orderValidation = require("../validations/order.validation");

router.use(userAuth);

// router.post(
//   "/",
//   validate(orderValidation.createOrder),
//   orderController.createOrder.bind(orderController)
// );

router
  .route("/")
  .post(
    validate(orderValidation.createOrderWithPayment),
    orderController.createOrderWithPayment
  );

router.get(
  "/",
  validate(orderValidation.getOrders),
  orderController.getUserOrders.bind(orderController)
);

router.get(
  "/:orderId",
  validate(orderValidation.getOrder),
  orderController.getOrderDetails.bind(orderController)
);

router.post(
  "/:orderId/cancel",
  validate(orderValidation.cancelOrder),
  orderController.cancelOrder.bind(orderController)
);

module.exports = router;
