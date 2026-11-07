import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(72),
});
