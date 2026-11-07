import { z } from 'zod';
import { idSchema, optionalUrl } from '../../utils/common-schemas.js';
import { paginationQuery } from '../../utils/pagination.js';

export const postSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(220).optional(),
  excerpt: z.string().trim().max(500).nullish(),
  content: z.string().default(''),
  coverImage: optionalUrl,
  categoryId: idSchema.nullish(),
  status: z.enum(['draft', 'published']).default('draft'),
  isFeatured: z.boolean().default(false),
  publishedAt: z.coerce.date().nullish(),
});

export const publicPostsQuery = paginationQuery.extend({
  category: z.string().trim().optional(), // category slug
  featured: z.stringbool().optional(),
});

export const adminPostsQuery = paginationQuery.extend({
  status: z.enum(['draft', 'published']).optional(),
  categoryId: idSchema.optional(),
});
