import { prisma } from '../../db/prisma.js';
import { contains, paginate } from '../../utils/pagination.js';

export function create({ website: _honeypot, ...data }) {
  return prisma.message.create({ data, select: { id: true, createdAt: true } });
}

export function list({ page, limit, search, isRead }) {
  const where = {
    ...(isRead !== undefined ? { isRead } : {}),
    ...(search
      ? {
          OR: [
            { name: contains(search) },
            { email: contains(search) },
            { subject: contains(search) },
          ],
        }
      : {}),
  };
  return paginate(prisma.message, { where, orderBy: { createdAt: 'desc' } }, { page, limit });
}

export const update = (id, { isRead }) =>
  prisma.message.update({ where: { id }, data: { isRead } });

export async function remove(id) {
  await prisma.message.delete({ where: { id } });
}
