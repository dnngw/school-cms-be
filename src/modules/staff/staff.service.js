import { prisma } from '../../db/prisma.js';
import { nextSortOrder, reorderRows } from '../../utils/reorder.js';

const orderBy = [{ sortOrder: 'asc' }, { id: 'asc' }];

export const listVisible = ({ limit } = {}) =>
  prisma.staff.findMany({ where: { isVisible: true }, orderBy, take: limit });

export const list = () => prisma.staff.findMany({ orderBy });

export async function create(data) {
  return prisma.staff.create({ data: { ...data, sortOrder: await nextSortOrder(prisma.staff) } });
}

export const update = (id, data) => prisma.staff.update({ where: { id }, data });

export async function remove(id) {
  await prisma.staff.delete({ where: { id } });
}

export const reorder = (ids) => reorderRows(prisma.staff, ids);
