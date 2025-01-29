const AdminService = require("../services/admin.service");
const ApiResponse = require("../utils/response");

class AdminController {
  async register(req, res, next) {
    try {
      const { admin, token } = await AdminService.register(req.body);
      res
        .status(201)
        .json(
          ApiResponse.success("Admin registered successfully", { admin, token })
        );
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { admin, token } = await AdminService.login(email, password);
      res.json(ApiResponse.success("Login successful", { admin, token }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
