import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { comparePassword, hashPassword } from './password.js';
import { signToken } from './token.js';

const PUBLIC_USER_FIELDS = ['id', 'name', 'email', 'role', 'lastLoginAt', 'createdAt'];

export async function login({ email, password }) {
  const user = await db('users').where({ email }).first();

  // Same error for "unknown email" and "wrong password" so attackers can't enumerate accounts.
  const isValid = user && user.isActive && (await comparePassword(password, user.passwordHash));
  if (!isValid) throw ApiError.unauthorized('Invalid email or password');

  await db('users').where({ id: user.id }).update({ lastLoginAt: db.fn.now() });

  const { passwordHash: _ignored, ...safeUser } = user;
  return { token: signToken(user), user: safeUser };
}

export async function getProfile(userId) {
  const user = await db('users').where({ id: userId }).first(PUBLIC_USER_FIELDS);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function updateProfile(userId, data) {
  const [user] = await db('users').where({ id: userId }).update(data).returning(PUBLIC_USER_FIELDS);
  return user;
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await db('users').where({ id: userId }).first('passwordHash');
  if (!(await comparePassword(currentPassword, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  await db('users')
    .where({ id: userId })
    .update({ passwordHash: await hashPassword(newPassword) });
}
