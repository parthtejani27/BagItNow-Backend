const ProductService = require("../services/product.service");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/response");

class ProductController {
  constructor() {
    this.service = new ProductService();
  }

  async getAll(req, res, next) {
    try {
      const {
        page,
        limit,
        sort,
        category,
        subcategory,
        minPrice,
        maxPrice,
        search,
        fields,
      } = req.query;

      const filter = { isActive: true };

      if (category) filter.category = category;
      if (subcategory) filter.subcategory = subcategory;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const options = {
        page,
        limit,
        sort,
        select: fields?.split(",").join(" "),
      };

      let result;
      if (search) {
        result = await this.service.search(search, options);
      } else {
        result = await this.service.findAll(filter, options);
      }

      return res.json(
        ApiResponse.success(
          "Products retrieved successfully",
          result.data,
          result.pagination
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const product = await this.service.findById(req.params.id);
      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      return res.json(
        ApiResponse.success("Product retrieved successfully", product)
      );
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await this.service.create(req.body);
      return res
        .status(201)
        .json(ApiResponse.success("Product created successfully", product));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await this.service.update(req.params.id, req.body);
      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      return res.json(
        ApiResponse.success("Product updated successfully", product)
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const product = await this.service.delete(req.params.id);
      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      return res.json(ApiResponse.success("Product deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const { quantity } = req.body;
      const product = await this.service.updateStock(req.params.id, quantity);

      return res.json(
        ApiResponse.success("Product stock updated successfully", product)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
