import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { paginate } from '../../utils/pagination.js';
import { sanitizeRichText } from '../../utils/sanitize.js';
import { uniqueSlug } from '../../utils/slug.js';

/** Base query joining category & author so the client gets everything in one request. */
function baseQuery() {
  return db('posts as p')
    .leftJoin('categories as c', 'c.id', 'p.categoryId')
    .leftJoin('users as u', 'u.id', 'p.authorId')
    .select('p.*', 'c.name as categoryName', 'c.slug as categorySlug', 'u.name as authorName');
}

function applySearch(query, search) {
  if (search)
    query.where((q) =>
      q.whereILike('p.title', `%${search}%`).orWhereILike('p.excerpt', `%${search}%`),
    );
}

const isPublished = (query) =>
  query.where('p.status', 'published').where('p.publishedAt', '<=', db.fn.now());

/** Create a plain text excerpt from HTML when the author didn't write one. */
const makeExcerpt = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

async function toRow(data, id) {
  const content = sanitizeRichText(data.content);
  return {
    title: data.title,
    slug: await uniqueSlug(db, 'posts', data.slug || data.title, id),
    excerpt: data.excerpt || makeExcerpt(content),
    content,
    coverImage: data.coverImage,
    categoryId: data.categoryId ?? null,
    status: data.status,
    isFeatured: data.isFeatured,
    // Publishing without a date means "publish now".
    publishedAt:
      data.status === 'published' ? (data.publishedAt ?? new Date()) : (data.publishedAt ?? null),
  };
}

// --- Public ---------------------------------------------------------------

export function listPublished({ page, limit, search, category, featured }) {
  const query = isPublished(baseQuery()).orderBy('p.publishedAt', 'desc');
  applySearch(query, search);
  if (category) query.where('c.slug', category);
  if (featured !== undefined) query.where('p.isFeatured', featured);
  // Lists don't need the full article body.
  query
    .clearSelect()
    .select(
      'p.id',
      'p.title',
      'p.slug',
      'p.excerpt',
      'p.coverImage',
      'p.publishedAt',
      'p.views',
      'p.isFeatured',
      'c.name as categoryName',
      'c.slug as categorySlug',
      'u.name as authorName',
    );
  return paginate(query, { page, limit });
}

export async function findPublishedBySlug(slug) {
  const post = await isPublished(baseQuery()).where('p.slug', slug).first();
  if (!post) throw ApiError.notFound('Post not found');

  await db('posts').where({ id: post.id }).increment('views', 1);
  return { ...post, views: post.views + 1 };
}

// --- Admin ----------------------------------------------------------------

export function list({ page, limit, search, status, categoryId }) {
  const query = baseQuery().orderBy('p.createdAt', 'desc');
  applySearch(query, search);
  if (status) query.where('p.status', status);
  if (categoryId) query.where('p.categoryId', categoryId);
  return paginate(query, { page, limit });
}

export async function findById(id) {
  const post = await baseQuery().where('p.id', id).first();
  if (!post) throw ApiError.notFound('Post not found');
  return post;
}

export async function create(data, authorId) {
  const [{ id }] = await db('posts')
    .insert({ ...(await toRow(data)), authorId })
    .returning('id');
  return findById(id);
}

export async function update(id, data) {
  const updated = await db('posts')
    .where({ id })
    .update(await toRow(data, id));
  if (!updated) throw ApiError.notFound('Post not found');
  return findById(id);
}

export async function remove(id) {
  const deleted = await db('posts').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Post not found');
}
