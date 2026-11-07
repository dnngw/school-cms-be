import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { sanitizeRichText } from '../../utils/sanitize.js';
import { uniqueSlug } from '../../utils/slug.js';
import * as sectionsService from '../sections/sections.service.js';

async function toRow(data, id) {
  return {
    title: data.title,
    slug: await uniqueSlug(db, 'pages', data.slug || data.title, id),
    content: sanitizeRichText(data.content),
    coverImage: data.coverImage,
    metaDescription: data.metaDescription ?? null,
    status: data.status,
  };
}

/** Published page + its visible page-builder sections. */
export async function findPublishedBySlug(slug) {
  const page = await db('pages').where({ slug, status: 'published' }).first();
  if (!page) throw ApiError.notFound('Page not found');
  const sections = await sectionsService.list({ pageId: page.id, onlyVisible: true });
  return { ...page, sections };
}

export const list = () =>
  db('pages').select('id', 'title', 'slug', 'status', 'createdAt', 'updatedAt').orderBy('title');

export async function findById(id) {
  const page = await db('pages').where({ id }).first();
  if (!page) throw ApiError.notFound('Page not found');
  return page;
}

export async function create(data) {
  const [page] = await db('pages')
    .insert(await toRow(data))
    .returning('*');
  return page;
}

export async function update(id, data) {
  const [page] = await db('pages')
    .where({ id })
    .update(await toRow(data, id))
    .returning('*');
  if (!page) throw ApiError.notFound('Page not found');
  return page;
}

export async function remove(id) {
  const deleted = await db('pages').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Page not found');
}
