import { ApiError } from '../utils/api-error.js';

/**
 * Validate `req.body`, `req.query` and/or `req.params` with Zod schemas.
 * Parsed (and coerced) values are stored in `req.validated` so controllers
 * always work with clean, typed data.
 *
 * @example
 * router.post('/', validate({ body: createPostSchema }), controller.create)
 *
 * @param {{ body?: import('zod').ZodType, query?: import('zod').ZodType, params?: import('zod').ZodType }} schemas
 */
export function validate(schemas) {
  return (req, _res, next) => {
    req.validated ??= {};

    for (const key of ['params', 'query', 'body']) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key] ?? {});
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new ApiError(422, 'Validation failed', { details }));
      }
      req.validated[key] = result.data;
    }

    next();
  };
}
