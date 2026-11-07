import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { paginate } from '../../utils/pagination.js';

function filtered({ album, search }) {
  const query = db('gallery_items').orderBy([
    { column: 'sortOrder' },
    { column: 'id', order: 'desc' },
  ]);
  if (album) query.where({ album });
  if (search) query.whereILike('title', `%${search}%`);
  return query;
}

export const listVisible = (filters) =>
  paginate(filtered(filters).where({ isVisible: true }), filters);

export const list = (filters) => paginate(filtered(filters), filters);

/** Distinct album names with item counts — used for filter tabs on the website. */
export const listAlbums = () =>
  db('gallery_items')
    .where({ isVisible: true })
    .whereNotNull('album')
    .groupBy('album')
    .orderBy('album')
    .select('album')
    .count({ total: '*' })
    .then((rows) => rows.map((row) => ({ name: row.album, total: Number(row.total) })));

export async function create(data) {
  const [row] = await db('gallery_items').insert(data).returning('*');
  return row;
}

export async function update(id, data) {
  const [row] = await db('gallery_items').where({ id }).update(data).returning('*');
  if (!row) throw ApiError.notFound('Gallery item not found');
  return row;
}

export async function remove(id) {
  const deleted = await db('gallery_items').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Gallery item not found');
}
