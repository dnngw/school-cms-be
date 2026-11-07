import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { sanitizeRichText } from '../../utils/sanitize.js';
import { uniqueSlug } from '../../utils/slug.js';
import * as sectionsService from '../sections/sections.service.js';

async function toData(input, id) {
  return {
    title: input.title,
    slug: await uniqueSlug(prisma.page, input.slug || input.title, id),
    content: sanitizeRichText(input.content),
    coverImage: input.coverImage,
    metaDescription: input.metaDescription ?? null,
    status: input.status,
  };
}

/** Published page + its visible page-builder sections. */
export async function findPublishedBySlug(slug) {
  const page = await prisma.page.findFirst({ where: { slug, status: 'published' } });
  if (!page) throw ApiError.notFound('Page not found');
  const sections = await sectionsService.list({ pageId: page.id, onlyVisible: true });
  return { ...page, sections };
}

export const list = () =>
  prisma.page.findMany({
    select: { id: true, title: true, slug: true, status: true, createdAt: true, updatedAt: true },
    orderBy: { title: 'asc' },
  });

export async function findById(id) {
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) throw ApiError.notFound('Page not found');
  return page;
}

export async function create(input) {
  return prisma.page.create({ data: await toData(input) });
}

export async function update(id, input) {
  return prisma.page.update({ where: { id }, data: await toData(input, id) });
}

export async function remove(id) {
  // Sections of this page are removed too (onDelete: Cascade in the schema).
  await prisma.page.delete({ where: { id } });
}
