import { z } from 'zod';
import { optionalUrl } from '../../utils/common-schemas.js';

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  position: z.string().trim().min(2).max(120),
  subject: z.string().trim().max(120).nullish(),
  photo: optionalUrl,
  bio: z.string().trim().max(2000).nullish(),
  isVisible: z.boolean().default(true),
});

export const publicStaffQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
