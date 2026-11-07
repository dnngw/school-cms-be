import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { paginate } from '../../utils/pagination.js';
import { sanitizeRichText } from '../../utils/sanitize.js';
import { uniqueSlug } from '../../utils/slug.js';

async function toRow(data, id) {
  return {
    ...data,
    slug: await uniqueSlug(db, 'events', data.slug || data.title, id),
    description: sanitizeRichText(data.description),
    endAt: data.endAt ?? null,
    location: data.location ?? null,
  };
}

export function listPublished({ page, limit, search, upcoming }) {
  const query = db('events').where({ isPublished: true });
  if (search) query.whereILike('title', `%${search}%`);
  if (upcoming) {
    query.where((q) =>
      q
        .where('endAt', '>=', db.fn.now())
        .orWhere((q2) => q2.whereNull('endAt').where('startAt', '>=', db.raw('CURRENT_DATE'))),
    );
    query.orderBy('startAt', 'asc');
  } else {
    query.orderBy('startAt', 'desc');
  }
  return paginate(query, { page, limit });
}

export async function findPublishedBySlug(slug) {
  const event = await db('events').where({ slug, isPublished: true }).first();
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

export function list({ page, limit, search }) {
  const query = db('events').orderBy('startAt', 'desc');
  if (search) query.whereILike('title', `%${search}%`);
  return paginate(query, { page, limit });
}

export async function findById(id) {
  const event = await db('events').where({ id }).first();
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

export async function create(data) {
  const [event] = await db('events')
    .insert(await toRow(data))
    .returning('*');
  return event;
}

export async function update(id, data) {
  const [event] = await db('events')
    .where({ id })
    .update(await toRow(data, id))
    .returning('*');
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

export async function remove(id) {
  const deleted = await db('events').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Event not found');
}
