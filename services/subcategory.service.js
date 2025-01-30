const BaseService = require("./base.service");
const Subcategory = require("../models/subcategory.model");
const ApiError = require("../utils/apiError");

class SubcategoryService extends BaseService {
  constructor() {
    super(Subcategory);
  }

  async findAll(filter = {}, options = {}) {
    try {
      return await this.model
        .find(filter)
        .populate("category", "name slug")
        .sort(options.sort)
        .lean()
        .exec();
    } catch (error) {
      throw new ApiError(500, "Error fetching subcategories");
    }
  }

  async findById(id) {
    try {
      const subcategory = await this.model
        .findById(id)
        .populate("category", "name slug")
        .lean()
        .exec();

      if (!subcategory) {
        throw new ApiError(404, "Subcategory not found");
      }

      return subcategory;
    } catch (error) {
      throw new ApiError(500, "Error fetching subcategory");
    }
  }

  async create(data) {
    try {
      const exists = await this.model.findOne({
        category: data.category,
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (exists) {
        throw new ApiError(
          400,
          "Subcategory with this name already exists in this category"
        );
      }

      const subcategory = await this.model.create(data);
      return subcategory.populate("category", "name slug");
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error creating subcategory");
    }
  }

  async update(id, data) {
    try {
      if (data.name || data.category) {
        const subcategory = await this.model.findById(id);
        if (!subcategory) {
          throw new ApiError(404, "Subcategory not found");
        }

        const categoryId = data.category || subcategory.category;

        const exists = await this.model.findOne({
          _id: { $ne: id },
          category: categoryId,
          name: {
            $regex: new RegExp(`^${data.name || subcategory.name}$`, "i"),
          },
        });

        if (exists) {
          throw new ApiError(
            400,
            "Subcategory with this name already exists in this category"
          );
        }
      }

      const subcategory = await this.model
        .findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true }
        )
        .populate("category", "name slug");

      if (!subcategory) {
        throw new ApiError(404, "Subcategory not found");
      }

      return subcategory;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating subcategory");
    }
  }

  async delete(id) {
    try {
      const subcategory = await this.model.findById(id);

      if (!subcategory) {
        throw new ApiError(404, "Subcategory not found");
      }

      await subcategory.deleteOne();
      return subcategory;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error deleting subcategory");
    }
  }
}

module.exports = SubcategoryService;
