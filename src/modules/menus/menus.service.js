import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { nextSortOrder, reorderRows } from '../../utils/reorder.js';

const orderBy = [{ sortOrder: 'asc' }, { id: 'asc' }];

/** Turn a flat list into a tree: [{ ...item, children: [...] }]. */
function buildTree(items) {
  const byId = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
  const roots = [];
  for (const item of byId.values()) {
    const parent = item.parentId && byId.get(item.parentId);
    (parent ? parent.children : roots).push(item);
  }
  return roots;
}

/** Public: `{ header: Tree, footer: Tree }` */
export async function getMenus() {
  const items = await prisma.menuItem.findMany({ orderBy });
  return {
    header: buildTree(items.filter((item) => item.location === 'header')),
    footer: buildTree(items.filter((item) => item.location === 'footer')),
  };
}

export const list = () => prisma.menuItem.findMany({ orderBy });

export async function create(data) {
  if (data.parentId) await assertValidParent(data.parentId);
  const sortOrder = await nextSortOrder(prisma.menuItem, { location: data.location });
  return prisma.menuItem.create({ data: { ...data, sortOrder } });
}

export async function update(id, data) {
  if (data.parentId === id) throw ApiError.badRequest('A menu item cannot be its own parent');
  if (data.parentId) await assertValidParent(data.parentId);
  return prisma.menuItem.update({ where: { id }, data });
}

export async function remove(id) {
  // Children are removed too (onDelete: Cascade).
  await prisma.menuItem.delete({ where: { id } });
}

export const reorder = (ids) => reorderRows(prisma.menuItem, ids);

/** Only one level of nesting is supported (dropdown menus). */
async function assertValidParent(parentId) {
  const parent = await prisma.menuItem.findUnique({
    where: { id: parentId },
    select: { parentId: true },
  });
  if (!parent) throw ApiError.badRequest('Parent menu item not found');
  if (parent.parentId) throw ApiError.badRequest('Only one level of sub menu is supported');
}
