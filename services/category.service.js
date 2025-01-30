const BaseService = require("./base.service");
const Category = require("../models/category.model");
const ApiError = require("../utils/apiError");

class CategoryService extends BaseService {
  constructor() {
    super(Category);
  }

  async findAll(filter = {}, options = {}) {
    try {
      return await this.model.find(filter).sort(options.sort).lean().exec();
    } catch (error) {
      throw new ApiError(500, "Error fetching categories");
    }
  }

  async findById(id) {
    try {
      const category = await this.model.findById(id).lean().exec();

      if (!category) {
        throw new ApiError(404, "Category not found");
      }

      return category;
    } catch (error) {
      throw new ApiError(500, "Error fetching category");
    }
  }

  async create(data) {
    try {
      const exists = await this.model.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (exists) {
        throw new ApiError(400, "Category with this name already exists");
      }

      const category = await this.model.create(data);
      return category;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error creating category");
    }
  }

  async update(id, data) {
    try {
      if (data.name) {
        const exists = await this.model.findOne({
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${data.name}$`, "i") },
        });

        if (exists) {
          throw new ApiError(400, "Category with this name already exists");
        }
      }

      const category = await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!category) {
        throw new ApiError(404, "Category not found");
      }

      return category;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating category");
    }
  }

  async delete(id) {
    try {
      const category = await this.model.findById(id);

      if (!category) {
        throw new ApiError(404, "Category not found");
      }

      // Check if category has subcategories
      const hasSubcategories = await mongoose
        .model("Subcategory")
        .exists({ category: id });
      if (hasSubcategories) {
        throw new ApiError(
          400,
          "Cannot delete category with existing subcategories"
        );
      }

      await category.deleteOne();
      return category;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error deleting category");
    }
  }
}

module.exports = CategoryService;
