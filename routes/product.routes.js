const express = require("express");
const router = express.Router();
const { adminAuth, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const productValidation = require("../validations/product.validation");
const ProductController = require("../controllers/product.controller");

const productController = new ProductController();

// Public routes
router.get("/", productController.getAll.bind(productController));
router.get(
  "/:id",
  validate(productValidation.getProduct),
  productController.get.bind(productController)
);

// Protected routes (Admin only)
router.post(
  "/",
  adminAuth,
  authorize(),
  validate(productValidation.createProduct),
  productController.create.bind(productController)
);

router.put(
  "/:id",
  adminAuth,
  authorize(),
  validate(productValidation.updateProduct),
  productController.update.bind(productController)
);

router.delete(
  "/:id",
  adminAuth,
  authorize(),
  validate(productValidation.deleteProduct),
  productController.delete.bind(productController)
);

router.patch(
  "/:id/stock",
  adminAuth,
  authorize(),
  validate(productValidation.updateStock),
  productController.updateStock.bind(productController)
);

module.exports = router;
