import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { contains, paginate } from '../../utils/pagination.js';
import { sanitizeRichText } from '../../utils/sanitize.js';
import { uniqueSlug } from '../../utils/slug.js';

async function toData(input, id) {
  return {
    ...input,
    slug: await uniqueSlug(prisma.event, input.slug || input.title, id),
    description: sanitizeRichText(input.description),
    endAt: input.endAt ?? null,
    location: input.location ?? null,
  };
}

/** Events that haven't finished yet (events without an end date count until the end of their day). */
function upcomingFilter() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return {
    OR: [{ endAt: { gte: new Date() } }, { endAt: null, startAt: { gte: startOfToday } }],
  };
}

export function listPublished({ page, limit, search, upcoming }) {
  const where = {
    isPublished: true,
    ...(search ? { title: contains(search) } : {}),
    ...(upcoming ? upcomingFilter() : {}),
  };
  return paginate(
    prisma.event,
    { where, orderBy: { startAt: upcoming ? 'asc' : 'desc' } },
    { page, limit },
  );
}

export async function findPublishedBySlug(slug) {
  const event = await prisma.event.findFirst({ where: { slug, isPublished: true } });
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

export function list({ page, limit, search }) {
  const where = search ? { title: contains(search) } : {};
  return paginate(prisma.event, { where, orderBy: { startAt: 'desc' } }, { page, limit });
}

export async function findById(id) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

export async function create(input) {
  return prisma.event.create({ data: await toData(input) });
}

export async function update(id, input) {
  return prisma.event.update({ where: { id }, data: await toData(input, id) });
}

export async function remove(id) {
  await prisma.event.delete({ where: { id } });
}
