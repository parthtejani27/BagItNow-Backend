const BaseController = require("./base.controller");
const SubcategoryService = require("../services/subcategory.service");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/response");

class SubcategoryController extends BaseController {
  constructor() {
    super(new SubcategoryService());
  }

  // Get all subcategories with optional category filter
  async getAll(req, res, next) {
    try {
      const filter = { isActive: true };
      if (req.query.category) {
        filter.category = req.query.category;
      }

      const options = { sort: { order: 1, name: 1 } };

      const subcategories = await this.service.findAll(filter, options);

      return res.json(
        ApiResponse.success(
          "Subcategories retrieved successfully",
          subcategories
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Get subcategories by category ID
  async getByCategoryId(req, res, next) {
    try {
      const { categoryId } = req.params;
      const filter = {
        category: categoryId,
        isActive: true,
      };
      const options = { sort: { order: 1, name: 1 } };

      const subcategories = await this.service.findAll(filter, options);

      return res.json(
        ApiResponse.success(
          "Subcategories retrieved successfully",
          subcategories
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Get subcategory by ID
  async get(req, res, next) {
    try {
      const subcategory = await this.service.findById(req.params.id);

      return res.json(
        ApiResponse.success("Subcategory retrieved successfully", subcategory)
      );
    } catch (error) {
      next(error);
    }
  }

  // Create subcategory
  async create(req, res, next) {
    try {
      const subcategory = await this.service.create(req.body);

      return res
        .status(201)
        .json(
          ApiResponse.success("Subcategory created successfully", subcategory)
        );
    } catch (error) {
      next(error);
    }
  }

  // Update subcategory
  async update(req, res, next) {
    try {
      const subcategory = await this.service.update(req.params.id, req.body);

      return res.json(
        ApiResponse.success("Subcategory updated successfully", subcategory)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete subcategory
  async delete(req, res, next) {
    try {
      await this.service.delete(req.params.id);

      return res.json(ApiResponse.success("Subcategory deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Update subcategory order within a category
  async updateOrder(req, res, next) {
    try {
      const { categoryId } = req.params;
      const subcategories = await this.service.updateOrder(
        categoryId,
        req.body
      );

      return res.json(
        ApiResponse.success(
          "Subcategory order updated successfully",
          subcategories
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubcategoryController;
