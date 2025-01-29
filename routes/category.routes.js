const express = require("express");
const router = express.Router();
const { adminAuth, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const categoryValidation = require("../validations/category.validation");
const CategoryController = require("../controllers/category.controller");

const categoryController = new CategoryController();

// Public Routes
/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get("/", categoryController.getAll.bind(categoryController));

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get(
  "/:id",
  validate(categoryValidation.getCategory),
  categoryController.get.bind(categoryController)
);

// Protected Routes (Admin Only)
/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
router.post(
  "/",
  adminAuth,
  authorize(),
  validate(categoryValidation.createCategory),
  categoryController.create.bind(categoryController)
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
router.put(
  "/:id",
  adminAuth,
  authorize(),
  validate(categoryValidation.updateCategory),
  categoryController.update.bind(categoryController)
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  adminAuth,
  authorize(),
  validate(categoryValidation.deleteCategory),
  categoryController.delete.bind(categoryController)
);

/**
 * @route   PUT /api/categories/order
 * @desc    Update category order
 * @access  Private/Admin
 */
router.put(
  "/order",
  adminAuth,
  authorize(),
  validate(categoryValidation.updateOrder),
  categoryController.updateOrder.bind(categoryController)
);

module.exports = router;
