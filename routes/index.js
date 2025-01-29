const express = require("express");
const router = express.Router();
const userRoutes = require("./user.routes");
const adminRoutes = require("./admin.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const subcategoryRoutes = require("./subcategory.routes");
const cartRoutes = require("./cart.routes");
const addressRoutes = require("./address.routes");
const orderRoutes = require("./order.routes");
const paymentRoutes = require("./payment.routes");
const timeslotRoutes = require("./timeslot.routes");
const apiLimiter = require("../middleware/rateLimiter.middleware");

router.use(apiLimiter);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/cart", cartRoutes);
router.use("/address", addressRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/timeslots", timeslotRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

module.exports = router;
