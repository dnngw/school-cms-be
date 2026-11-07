import { z } from 'zod';
import { optionalUrl } from '../../utils/common-schemas.js';
import { paginationQuery } from '../../utils/pagination.js';

export const eventSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    slug: z.string().trim().max(220).optional(),
    description: z.string().default(''),
    location: z.string().trim().max(200).nullish(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().nullish(),
    coverImage: optionalUrl,
    isPublished: z.boolean().default(true),
  })
  .refine((data) => !data.endAt || data.endAt >= data.startAt, {
    message: 'End date must be after start date',
    path: ['endAt'],
  });

export const publicEventsQuery = paginationQuery.extend({
  // upcoming=true -> only events that haven't finished yet
  upcoming: z.stringbool().optional(),
});
