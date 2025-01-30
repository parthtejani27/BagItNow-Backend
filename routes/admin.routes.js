// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");
const adminValidation = require("../validations/admin.validation");
const AdminController = require("../controllers/admin.controller");

router.post(
  "/register",
  validate(adminValidation.register),
  AdminController.register
);

router.post("/login", validate(adminValidation.login), AdminController.login);

module.exports = router;
