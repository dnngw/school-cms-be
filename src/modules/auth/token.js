import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

/** @param {{ id: number, role: string }} user */
export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
