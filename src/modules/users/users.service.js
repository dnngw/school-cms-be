import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { hashPassword } from '../auth/password.js';

const FIELDS = ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt'];

export const list = () => db('users').select(FIELDS).orderBy('id');

export async function create({ password, ...data }) {
  const [user] = await db('users')
    .insert({ ...data, passwordHash: await hashPassword(password) })
    .returning(FIELDS);
  return user;
}

export async function update(id, { password, ...data }) {
  const changes = { ...data };
  if (password) changes.passwordHash = await hashPassword(password);

  const [user] = await db('users').where({ id }).update(changes).returning(FIELDS);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function remove(id, currentUserId) {
  if (id === currentUserId) throw ApiError.badRequest('You cannot delete your own account');
  const deleted = await db('users').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('User not found');
}
