import { z } from 'zod';

export const idSchema = z.coerce.number().int().positive();
export const idParams = z.object({ id: idSchema });
export const slugParams = z.object({ slug: z.string().trim().min(1).max(220) });
export const reorderSchema = z.object({ ids: z.array(idSchema).min(1) });

/** Optional image/link field: relative upload path ("/uploads/x.jpg") or absolute URL. */
export const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .transform((v) => v || null);
