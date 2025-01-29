const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["House", "Apartment", "Office", "Hotel", "Other"],
      default: "Other",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    streetNumber: {
      type: String,
      trim: true,
      default: "",
    },
    unit: {
      type: String,
      trim: true,
      default: null,
    },
    streetName: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    zipcode: {
      type: String,
      trim: true,
      default: "",
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
      default: "",
    },
    dropoffOption: {
      type: String,
      enum: [
        "Hand it to me",
        "Meet outside",
        "Meet in the lobby",
        "Leave at my door",
        "Leave at building reception",
      ],
      default: "Leave at my door",
    },
    deliveryInstructions: {
      type: String,
      trim: true,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    formattedAddress: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to handle default address
addressSchema.pre("save", async function (next) {
  try {
    // If this is a new address and no other addresses exist, make it default
    if (this.isNew) {
      const addressCount = await this.constructor.countDocuments({
        user: this.user,
      });
      if (addressCount === 0) {
        this.isDefault = true;
      }
    }

    // If this address is being set as default, unset other default addresses
    if (this.isDefault) {
      await this.constructor.updateMany(
        {
          user: this.user,
          _id: { $ne: this._id },
          isDefault: true,
        },
        { isDefault: false }
      );
    }

    // If there are no default addresses, make this one default
    const defaultAddressCount = await this.constructor.countDocuments({
      user: this.user,
      isDefault: true,
      _id: { $ne: this._id },
    });

    if (defaultAddressCount === 0) {
      this.isDefault = true;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for full address string
addressSchema.virtual("fullAddress").get(function () {
  const parts = [];

  if (this.streetNumber) parts.push(this.streetNumber);
  if (this.streetName) parts.push(this.streetName);
  if (this.unit) parts.push(`Unit ${this.unit}`);
  if (this.city) parts.push(this.city);
  if (this.state) parts.push(this.state);
  if (this.zipcode) parts.push(this.zipcode);
  if (this.country) parts.push(this.country);

  return parts.join(", ");
});

// Index for geospatial queries
addressSchema.index({ lat: 1, lng: 1 });

// Index for user queries
addressSchema.index({ user: 1, isDefault: 1 });

// Methods
addressSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.fullAddress = this.fullAddress;
  return obj;
};

module.exports = mongoose.model("Address", addressSchema);
