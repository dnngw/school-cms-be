import { z } from 'zod';
import { paginationQuery } from '../../utils/pagination.js';

export const galleryItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullish(),
  image: z.string().trim().min(1, 'Image is required').max(500),
  album: z
    .string()
    .trim()
    .max(100)
    .nullish()
    .transform((v) => v || null),
  isVisible: z.boolean().default(true),
});

export const galleryQuery = paginationQuery.extend({
  limit: z.coerce.number().int().min(1).max(100).default(24),
  album: z.string().trim().optional(),
});
