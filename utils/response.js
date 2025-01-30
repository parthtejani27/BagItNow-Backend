class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
  }

  static success(message, data) {
    return new ApiResponse(true, message, data);
  }

  static error(message) {
    return new ApiResponse(false, message);
  }
}

module.exports = ApiResponse;
