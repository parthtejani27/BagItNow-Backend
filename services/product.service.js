const BaseService = require("./base.service");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");

class ProductService extends BaseService {
  constructor() {
    super(Product);
  }

  async findAll(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt", select } = options;

      const skip = (page - 1) * limit;
      const query = this.model
        .find(filter)
        .populate("category", "name")
        .populate("subcategory", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      if (select) {
        query.select(select);
      }

      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter),
      ]);

      return {
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApiError(500, "Error fetching products");
    }
  }

  async search(query, options = {}) {
    try {
      const filter = {
        $text: { $search: query },
        isActive: true,
      };
      return this.findAll(filter, options);
    } catch (error) {
      throw new ApiError(500, "Error searching products");
    }
  }

  async findByCategory(categoryId, options = {}) {
    try {
      const filter = { category: categoryId, isActive: true };
      return this.findAll(filter, options);
    } catch (error) {
      throw new ApiError(500, "Error fetching products by category");
    }
  }

  async updateStock(id, quantity) {
    try {
      const product = await this.model.findById(id);
      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      if (product.stock < quantity) {
        throw new ApiError(400, "Insufficient stock");
      }

      product.stock -= quantity;
      await product.save();

      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error updating product stock");
    }
  }
}

module.exports = ProductService;
