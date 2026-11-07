import { z } from 'zod';
import { idSchema } from '../../utils/common-schemas.js';

export const menuItemSchema = z.object({
  location: z.enum(['header', 'footer']).default('header'),
  label: z.string().trim().min(1).max(100),
  // Internal path ("/berita", "#kontak") or external URL ("https://...").
  url: z.string().trim().min(1).max(500),
  parentId: idSchema.nullish().transform((v) => v ?? null),
  openInNewTab: z.boolean().default(false),
});
