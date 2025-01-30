const Address = require("../models/address.model");
const ApiError = require("../utils/apiError");

class AddressService {
  // Get all addresses for a user
  async getUserAddresses(userId) {
    return await Address.find({ user: userId }).sort({ isDefault: -1 });
  }

  // Get single address
  async getAddress(userId, addressId) {
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    return address;
  }

  // Create new address
  async createAddress(userId, addressData) {
    // If this is the first address, make it default
    const addressCount = await Address.countDocuments({ user: userId });
    if (addressCount === 0) {
      addressData.isDefault = true;
    }

    // Create address
    const address = await Address.create({
      user: userId,
      ...addressData,
    });

    return address;
  }

  // Update address
  async updateAddress(addressId, addressData) {
    const address = await Address.findOneAndUpdate(
      { _id: addressId },
      addressData,
      { new: true }
    );

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    return address;
  }

  // Delete address
  async deleteAddress(userId, addressId) {
    const address = await Address.findByIdAndDelete(addressId);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    // If deleted address was default and other addresses exist,
    // make the first remaining address default
    if (address.isDefault) {
      const remainingAddress = await Address.findOne({ user: userId });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    return address;
  }

  // Set address as default
  async setDefaultAddress(userId, addressId) {
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    address.isDefault = true;
    return await address.save();
  }
}

module.exports = new AddressService();
