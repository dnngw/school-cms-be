import multer from 'multer';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { Prisma } from '../generated/prisma/client.ts';
import { ApiError } from '../utils/api-error.js';

// Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_ERRORS = {
  P2002: () => ApiError.conflict('A record with the same unique value already exists'),
  P2003: () => ApiError.badRequest('Related resource not found'),
  P2025: () => ApiError.notFound(), // record to update/delete does not exist
};

/** Translate known (non ApiError) errors into ApiError instances. */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof multer.MulterError) {
    return ApiError.badRequest(err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message);
  }
  if (err.type === 'entity.parse.failed') return ApiError.badRequest('Malformed JSON body');
  if (err.type === 'entity.too.large') return new ApiError(413, 'Request body is too large');
  if (err instanceof Prisma.PrismaClientKnownRequestError && PRISMA_ERRORS[err.code]) {
    return PRISMA_ERRORS[err.code]();
  }

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
