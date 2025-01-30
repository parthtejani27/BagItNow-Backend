const BaseController = require("./base.controller");
const CategoryService = require("../services/category.service");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/response");

class CategoryController extends BaseController {
  constructor() {
    super(new CategoryService());
  }

  // Get all categories
  async getAll(req, res, next) {
    try {
      const filter = { isActive: true };
      const options = { sort: { order: 1, name: 1 } };

      const categories = await this.service.findAll(filter, options);

      return res.json(
        ApiResponse.success("Categories retrieved successfully", categories)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get category by ID
  async get(req, res, next) {
    try {
      const category = await this.service.findById(req.params.id);

      return res.json(
        ApiResponse.success("Category retrieved successfully", category)
      );
    } catch (error) {
      next(error);
    }
  }

  // Create category
  async create(req, res, next) {
    try {
      const category = await this.service.create(req.body);

      return res
        .status(201)
        .json(ApiResponse.success("Category created successfully", category));
    } catch (error) {
      next(error);
    }
  }

  // Update category
  async update(req, res, next) {
    try {
      const category = await this.service.update(req.params.id, req.body);

      return res.json(
        ApiResponse.success("Category updated successfully", category)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete category
  async delete(req, res, next) {
    try {
      await this.service.delete(req.params.id);

      return res.json(ApiResponse.success("Category deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Update category order
  async updateOrder(req, res, next) {
    try {
      const categories = await this.service.updateOrder(req.body);

      return res.json(
        ApiResponse.success("Category order updated successfully", categories)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
