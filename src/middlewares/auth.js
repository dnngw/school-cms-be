import { db } from '../db/knex.js';
import { ApiError } from '../utils/api-error.js';
import { verifyToken } from '../modules/auth/token.js';

/** Require a valid `Authorization: Bearer <token>` header and attach `req.user`. */
export async function authenticate(req, _res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized());
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }

  // Re-check the database so deleted/deactivated users lose access immediately.
  const user = await db('users')
    .where({ id: payload.sub, isActive: true })
    .first('id', 'name', 'email', 'role');

  if (!user) return next(ApiError.unauthorized('User no longer exists'));

  req.user = user;
  next();
}

/**
 * Restrict a route to certain roles. Must be used after `authenticate`.
 * @param {...('admin'|'editor')} roles
 */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
