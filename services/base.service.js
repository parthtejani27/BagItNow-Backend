class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Create
  async create(data) {
    return await this.model.create(data);
  }

  // Find by ID
  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(filter = {}, options = {}) {
    const { select, populate } = options;
    const query = this.model.findOne(filter);

    if (select) {
      query.select(select);
    }

    if (populate) {
      query.populate(populate);
    }

    return await query;
  }

  // Find All with Pagination and Filters
  async findAll(filters, options) {
    const { page = 1, limit = 10, sort = "-createdAt", select } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query = this.model.find(filters);

    // Apply sorting
    if (sort) {
      query.sort(sort);
    }

    // Apply field selection
    if (select) {
      query.select(select);
    }

    // Execute query with pagination
    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      this.model.countDocuments(filters),
    ]);

    // Calculate pagination info
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { data, pagination };
  }

  // Update
  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Patch
  async patch(id, data) {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  // Delete
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter = {}) {
    return await this.model.deleteOne(filter);
  }

  // Bulk Create
  async bulkCreate(dataArray) {
    return await this.model.insertMany(dataArray);
  }

  // Bulk Update
  async bulkUpdate(updates) {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.data },
      },
    }));
    return await this.model.bulkWrite(bulkOps);
  }

  // Bulk Delete
  async bulkDelete(ids) {
    return await this.model.deleteMany({ _id: { $in: ids } });
  }

  // Toggle Status
  async toggleStatus(id) {
    const document = await this.model.findById(id);
    if (!document) return null;

    document.isActive = !document.isActive;
    return await document.save();
  }

  // Count Documents
  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  // Custom Query
  async query(filter = {}, projection = {}, options = {}) {
    return await this.model.find(filter, projection, options);
  }
}

module.exports = BaseService;
