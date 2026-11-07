/**
 * An error that is safe to expose to API clients.
 * Throw it anywhere (service, controller, middleware) and the global
 * error handler will turn it into a proper JSON response.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message Human readable message
   * @param {object} [options]
   * @param {string} [options.code] Machine readable error code
   * @param {unknown} [options.details] Extra info (e.g. validation issues)
   */
  constructor(statusCode, message, { code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code ?? defaultCode(statusCode);
    this.details = details;
  }

  static badRequest(message = 'Bad request', details) {
    return new ApiError(400, message, { details });
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }
}

function defaultCode(statusCode) {
  const codes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'TOO_MANY_REQUESTS',
  };
  return codes[statusCode] ?? 'INTERNAL_ERROR';
}
