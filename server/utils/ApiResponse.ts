export class ApiResponse {
  static success(data: any, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, statusCode = 500) {
    return {
      success: false,
      message,
      statusCode,
    };
  }

  static paginated(data: any, meta: any) {
    return {
      success: true,
      data,
      meta,
    };
  }
}