import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { paginate } from '../../utils/pagination.js';

export async function create({ website: _honeypot, ...data }) {
  const [row] = await db('messages').insert(data).returning(['id', 'createdAt']);
  return row;
}

export function list({ page, limit, search, isRead }) {
  const query = db('messages').orderBy('createdAt', 'desc');
  if (isRead !== undefined) query.where({ isRead });
  if (search) {
    query.where((q) =>
      q
        .whereILike('name', `%${search}%`)
        .orWhereILike('email', `%${search}%`)
        .orWhereILike('subject', `%${search}%`),
    );
  }
  return paginate(query, { page, limit });
}

export async function update(id, { isRead }) {
  const [row] = await db('messages').where({ id }).update({ isRead }).returning('*');
  if (!row) throw ApiError.notFound('Message not found');
  return row;
}

export async function remove(id) {
  const deleted = await db('messages').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Message not found');
}
