import { z } from 'zod';

const role = z.enum(['admin', 'editor']);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
  role: role.default('editor'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema
  .extend({ password: z.string().min(8).max(72).optional() })
  .partial();
