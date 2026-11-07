import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).nullish(),
});
