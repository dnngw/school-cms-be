import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { uniqueSlug } from '../../utils/slug.js';

/** All categories with the number of published posts in each. */
export function list() {
  return db('categories as c')
    .leftJoin('posts as p', function joinPublished() {
      this.on('p.categoryId', 'c.id').andOnVal('p.status', 'published');
    })
    .groupBy('c.id')
    .orderBy('c.name')
    .select('c.*')
    .count({ postCount: 'p.id' })
    .then((rows) => rows.map((row) => ({ ...row, postCount: Number(row.postCount) })));
}

export async function create({ name, slug, description }) {
  const [row] = await db('categories')
    .insert({ name, description, slug: await uniqueSlug(db, 'categories', slug || name) })
    .returning('*');
  return row;
}

export async function update(id, { name, slug, description }) {
  const [row] = await db('categories')
    .where({ id })
    .update({ name, description, slug: await uniqueSlug(db, 'categories', slug || name, id) })
    .returning('*');
  if (!row) throw ApiError.notFound('Category not found');
  return row;
}

export async function remove(id) {
  const deleted = await db('categories').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Category not found');
}
