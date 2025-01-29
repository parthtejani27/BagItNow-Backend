const express = require("express");
const router = express.Router();
const { adminAuth, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const subcategoryValidation = require("../validations/subcategory.validation");
const SubcategoryController = require("../controllers/subcategory.controller");

const subcategoryController = new SubcategoryController();

// Public Routes
/**
 * @route   GET /api/subcategories
 * @desc    Get all subcategories
 * @access  Public
 */
router.get("/", subcategoryController.getAll.bind(subcategoryController));

/**
 * @route   GET /api/categories/:categoryId/subcategories
 * @desc    Get subcategories by category ID
 * @access  Public
 */
router.get(
  "/category/:categoryId",
  validate(subcategoryValidation.getByCategoryId),
  subcategoryController.getByCategoryId.bind(subcategoryController)
);

/**
 * @route   GET /api/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Public
 */
router.get(
  "/:id",
  validate(subcategoryValidation.getSubcategory),
  subcategoryController.get.bind(subcategoryController)
);

// Protected Routes (Admin Only)
/**
 * @route   POST /api/subcategories
 * @desc    Create new subcategory
 * @access  Private/Admin
 */
router.post(
  "/",
  adminAuth,
  authorize(),
  validate(subcategoryValidation.createSubcategory),
  subcategoryController.create.bind(subcategoryController)
);

/**
 * @route   PUT /api/subcategories/:id
 * @desc    Update subcategory
 * @access  Private/Admin
 */
router.put(
  "/:id",
  adminAuth,
  authorize(),
  validate(subcategoryValidation.updateSubcategory),
  subcategoryController.update.bind(subcategoryController)
);

/**
 * @route   DELETE /api/subcategories/:id
 * @desc    Delete subcategory
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  adminAuth,
  authorize(),
  validate(subcategoryValidation.deleteSubcategory),
  subcategoryController.delete.bind(subcategoryController)
);

/**
 * @route   PUT /api/categories/:categoryId/subcategories/order
 * @desc    Update subcategory order within a category
 * @access  Private/Admin
 */
router.put(
  "/category/:categoryId/order",
  adminAuth,
  authorize(),
  validate(subcategoryValidation.updateOrder),
  subcategoryController.updateOrder.bind(subcategoryController)
);

module.exports = router;
