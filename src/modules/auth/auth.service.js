import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { comparePassword, hashPassword } from './password.js';
import { signToken } from './token.js';

/** Fields that are safe to send to the client (never the password hash). */
const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  lastLoginAt: true,
  createdAt: true,
};

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Same error for "unknown email" and "wrong password" so attackers can't enumerate accounts.
  const isValid = user && user.isActive && (await comparePassword(password, user.passwordHash));
  if (!isValid) throw ApiError.unauthorized('Invalid email or password');

  const safeUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: PUBLIC_USER_FIELDS,
  });

  return { token: signToken(user), user: safeUser };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_FIELDS });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export const updateProfile = (userId, data) =>
  prisma.user.update({ where: { id: userId }, data, select: PUBLIC_USER_FIELDS });

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!(await comparePassword(currentPassword, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
}
