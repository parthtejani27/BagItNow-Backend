const AddressService = require("../services/address.service");
const ApiResponse = require("../utils/response");

class AddressController {
  // Get all addresses
  async getAddresses(req, res, next) {
    try {
      const addresses = await AddressService.getUserAddresses(req.user.id);
      return res.json(
        ApiResponse.success("Addresses retrieved successfully", addresses)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get single address
  async getAddress(req, res, next) {
    try {
      const address = await AddressService.getAddress(
        req.user.id,
        req.params.addressId
      );
      return res.json(
        ApiResponse.success("Address retrieved successfully", address)
      );
    } catch (error) {
      next(error);
    }
  }

  // Create address
  async createAddress(req, res, next) {
    try {
      const address = await AddressService.createAddress(req.user.id, req.body);
      return res
        .status(201)
        .json(ApiResponse.success("Address created successfully", address));
    } catch (error) {
      next(error);
    }
  }

  // Update address
  async updateAddress(req, res, next) {
    try {
      const address = await AddressService.updateAddress(
        req.params.addressId,
        req.body
      );
      return res.json(
        ApiResponse.success("Address updated successfully", address)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete address
  async deleteAddress(req, res, next) {
    try {
      const address = await AddressService.deleteAddress(
        req.user.id,
        req.params.addressId
      );
      return res.json(
        ApiResponse.success("Address deleted successfully", address)
      );
    } catch (error) {
      next(error);
    }
  }

  // Set default address
  async setDefaultAddress(req, res, next) {
    try {
      const address = await AddressService.setDefaultAddress(
        req.user.id,
        req.params.addressId
      );
      return res.json(
        ApiResponse.success("Default address set successfully", address)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
