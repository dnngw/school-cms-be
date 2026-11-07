import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { reorderRows } from '../../utils/reorder.js';

const ordered = () => db('staff').orderBy([{ column: 'sortOrder' }, { column: 'id' }]);

export function listVisible({ limit } = {}) {
  const query = ordered().where({ isVisible: true });
  if (limit) query.limit(limit);
  return query;
}

export const list = () => ordered();

export async function create(data) {
  const { max } = await db('staff').max({ max: 'sortOrder' }).first();
  const [row] = await db('staff')
    .insert({ ...data, sortOrder: (max ?? -1) + 1 })
    .returning('*');
  return row;
}

export async function update(id, data) {
  const [row] = await db('staff').where({ id }).update(data).returning('*');
  if (!row) throw ApiError.notFound('Staff not found');
  return row;
}

export async function remove(id) {
  const deleted = await db('staff').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Staff not found');
}

export const reorder = (ids) => reorderRows(db, 'staff', ids);
