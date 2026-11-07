import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { hashPassword } from '../auth/password.js';

const FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export const list = () => prisma.user.findMany({ select: FIELDS, orderBy: { id: 'asc' } });

export async function create({ password, ...data }) {
  return prisma.user.create({
    data: { ...data, passwordHash: await hashPassword(password) },
    select: FIELDS,
  });
}

export async function update(id, { password, ...data }) {
  if (password) data.passwordHash = await hashPassword(password);
  // Throws P2025 when the user doesn't exist -> 404 via the error handler.
  return prisma.user.update({ where: { id }, data, select: FIELDS });
}

export async function remove(id, currentUserId) {
  if (id === currentUserId) throw ApiError.badRequest('You cannot delete your own account');
  await prisma.user.delete({ where: { id } });
}
