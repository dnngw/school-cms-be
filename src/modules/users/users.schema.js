import { z } from 'zod';

// Base fields WITHOUT defaults (see sections.schema.js for why this matters with `.partial()`).
const userFields = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
  role: z.enum(['admin', 'editor']),
  isActive: z.boolean(),
});

export const createUserSchema = userFields.extend({
  role: userFields.shape.role.default('editor'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = userFields.partial();
