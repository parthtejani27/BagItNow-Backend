const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller");
const { userAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const addressValidation = require("../validations/address.validation");

router.use(userAuth); // All address routes require authentication

router.get("/", addressController.getAddresses.bind(addressController));

router.get(
  "/:addressId",
  validate(addressValidation.getAddress),
  addressController.getAddress.bind(addressController)
);

router.post(
  "/",
  validate(addressValidation.createAddress),
  addressController.createAddress.bind(addressController)
);

router.put(
  "/:addressId",
  validate(addressValidation.updateAddress),
  addressController.updateAddress.bind(addressController)
);

router.delete(
  "/:addressId",
  validate(addressValidation.deleteAddress),
  addressController.deleteAddress.bind(addressController)
);

router.patch(
  "/:addressId/default",
  validate(addressValidation.setDefault),
  addressController.setDefaultAddress.bind(addressController)
);

module.exports = router;
