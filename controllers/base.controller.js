const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/response");

class BaseController {
  constructor(service) {
    this.service = service;
  }

  // Create
  async create(req, res, next) {
    try {
      const data = await this.service.create(req.body);
      return res
        .status(201)
        .json(ApiResponse.success("Resource created successfully", data));
    } catch (error) {
      next(error);
    }
  }

  // Read - Get Single Resource
  async get(req, res, next) {
    try {
      const data = await this.service.findById(req.params.id);
      if (!data) {
        throw new ApiError(404, "Resource not found");
      }
      return res.json(
        ApiResponse.success("Resource retrieved successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Read - Get All Resources with Pagination and Filters
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "-createdAt",
        fields,
        ...filters
      } = req.query;

      // Build query options
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        select: fields?.split(",").join(" "),
      };

      const { data, pagination } = await this.service.findAll(filters, options);

      return res.json(
        ApiResponse.success(
          "Resources retrieved successfully",
          data,
          pagination
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Update
  async update(req, res, next) {
    try {
      const data = await this.service.update(req.params.id, req.body);
      if (!data) {
        throw new ApiError(404, "Resource not found");
      }
      return res.json(
        ApiResponse.success("Resource updated successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Patch - Partial Update
  async patch(req, res, next) {
    try {
      const data = await this.service.patch(req.params.id, req.body);
      if (!data) {
        throw new ApiError(404, "Resource not found");
      }
      return res.json(
        ApiResponse.success("Resource patched successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete
  async delete(req, res, next) {
    try {
      const data = await this.service.delete(req.params.id);
      if (!data) {
        throw new ApiError(404, "Resource not found");
      }
      return res.json(
        ApiResponse.success("Resource deleted successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Bulk Create
  async bulkCreate(req, res, next) {
    try {
      const data = await this.service.bulkCreate(req.body);
      return res
        .status(201)
        .json(ApiResponse.success("Resources created successfully", data));
    } catch (error) {
      next(error);
    }
  }

  // Bulk Update
  async bulkUpdate(req, res, next) {
    try {
      const data = await this.service.bulkUpdate(req.body);
      return res.json(
        ApiResponse.success("Resources updated successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Bulk Delete
  async bulkDelete(req, res, next) {
    try {
      const data = await this.service.bulkDelete(req.body.ids);
      return res.json(
        ApiResponse.success("Resources deleted successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Toggle Status (Active/Inactive)
  async toggleStatus(req, res, next) {
    try {
      const data = await this.service.toggleStatus(req.params.id);
      if (!data) {
        throw new ApiError(404, "Resource not found");
      }
      return res.json(
        ApiResponse.success("Resource status updated successfully", data)
      );
    } catch (error) {
      next(error);
    }
  }

  // Count Documents
  async count(req, res, next) {
    try {
      const count = await this.service.count(req.query);
      return res.json(
        ApiResponse.success("Count retrieved successfully", { count })
      );
    } catch (error) {
      next(error);
    }
  }

  // Custom Query Builder
  async query(req, res, next) {
    try {
      const { filter = {}, projection = {}, options = {} } = req.body;
      const data = await this.service.query(filter, projection, options);
      return res.json(ApiResponse.success("Query executed successfully", data));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BaseController;
