import { z } from 'zod';
import { paginationQuery } from '../../utils/pagination.js';

export const mediaQuery = paginationQuery.extend({
  limit: z.coerce.number().int().min(1).max(100).default(24),
  type: z.enum(['image', 'document']).optional(),
});

export const updateMediaSchema = z.object({
  alt: z.string().trim().max(200).nullish(),
});
