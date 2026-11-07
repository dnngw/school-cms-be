import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { nextSortOrder, reorderRows } from '../../utils/reorder.js';

/** "home" (or nothing) = sections of the home page, which have no pageId. */
const pageFilter = (pageId) => ({
  pageId: pageId === 'home' || pageId === null || pageId === undefined ? null : pageId,
});

export function list({ pageId = 'home', onlyVisible = false } = {}) {
  return prisma.section.findMany({
    where: { ...pageFilter(pageId), ...(onlyVisible ? { isVisible: true } : {}) },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
}

export async function findById(id) {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw ApiError.notFound('Section not found');
  return section;
}

export async function create({ pageId = null, type, label, content, style, isVisible }) {
  return prisma.section.create({
    data: {
      pageId,
      type,
      label,
      content, // JSON columns accept plain objects
      style,
      isVisible,
      // New sections are appended at the end of the page.
      sortOrder: await nextSortOrder(prisma.section, pageFilter(pageId)),
    },
  });
}

export function update(id, { label, content, style, isVisible }) {
  // `undefined` fields are ignored by Prisma -> partial update.
  return prisma.section.update({ where: { id }, data: { label, content, style, isVisible } });
}

export async function duplicate(id) {
  const source = await findById(id);
  return create({ ...source, label: `${source.label} (copy)` });
}

export async function remove(id) {
  await prisma.section.delete({ where: { id } });
}

/** Persist a new order. `ids` is the full list of section ids in their new order. */
export const reorder = (ids) => reorderRows(prisma.section, ids);
