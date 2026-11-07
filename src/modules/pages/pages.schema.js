import { z } from 'zod';
import { optionalUrl } from '../../utils/common-schemas.js';

export const pageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(220).optional(),
  content: z.string().default(''),
  coverImage: optionalUrl,
  metaDescription: z.string().trim().max(300).nullish(),
  status: z.enum(['draft', 'published']).default('draft'),
});
