import multer from 'multer';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

// PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_INVALID_TEXT = '22P02';

/** Translate known (non ApiError) errors into ApiError instances. */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof multer.MulterError) {
    return ApiError.badRequest(err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message);
  }
  if (err.type === 'entity.parse.failed') return ApiError.badRequest('Malformed JSON body');
  if (err.type === 'entity.too.large') return new ApiError(413, 'Request body is too large');
  if (err.code === PG_UNIQUE_VIOLATION) return ApiError.conflict(err.detail ?? 'Duplicate value');
  if (err.code === PG_FOREIGN_KEY_VIOLATION)
    return ApiError.badRequest('Related resource not found');
  if (err.code === PG_INVALID_TEXT) return ApiError.badRequest('Invalid input syntax');

  return null;
}

// Express recognises error handlers by their 4 arguments, so `_next` must stay.
export function errorHandler(err, req, res, _next) {
  const apiError = normalizeError(err);

  if (!apiError) {
    // Unexpected error: log everything, but never leak internals to the client.
    logger.error({ err, path: req.originalUrl }, 'Unhandled error');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        ...(env.isProduction ? {} : { stack: err.stack }),
      },
    });
  }

  res.status(apiError.statusCode).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details ? { details: apiError.details } : {}),
    },
  });
}
