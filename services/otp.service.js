const BaseService = require("./base.service");
const ApiError = require("../utils/apiError");
const Otp = require("../models/otp.model");

class OTPService extends BaseService {
  constructor() {
    super(Otp);
  }
  async saveOTP(data) {
    if (data.type == "email") {
      await Otp.deleteMany({ email: data.email });
    } else if (data.type == "phone") {
      await Otp.deleteMany({ phone: data.phone });
    }

    const OTPDetails = this.create(data);
    return OTPDetails;
  }
}
module.exports = new OTPService();
