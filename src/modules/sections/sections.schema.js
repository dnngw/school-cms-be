import { z } from 'zod';
import { SECTION_TYPES } from './sections.constants.js';

const hexColor = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

/** Visual options shared by every section type. All optional — the frontend applies defaults. */
export const sectionStyleSchema = z.object({
  background: z
    .enum(['default', 'surface', 'primary', 'secondary', 'accent', 'dark', 'custom'])
    .optional(),
  backgroundColor: z.union([hexColor, z.literal('')]).optional(),
  backgroundImage: z.string().max(500).optional(),
  textColor: z.union([hexColor, z.literal('')]).optional(),
  paddingY: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  width: z.enum(['narrow', 'normal', 'wide', 'full']).optional(),
  align: z.enum(['left', 'center']).optional(),
  variant: z.string().max(40).optional(),
  // Decorative background layer behind the content.
  decoration: z.enum(['none', 'waves', 'blobs', 'dots', 'grid', 'glow']).optional(),
  // How the section appears when scrolled into view.
  animation: z.enum(['none', 'fade-up', 'fade', 'zoom', 'slide-left', 'slide-right']).optional(),
  anchorId: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Only lowercase letters, numbers and dashes')
    .max(60)
    .optional(),
});

const idParam = z.coerce.number().int().positive();

export const sectionIdParams = z.object({ id: idParam });

export const listSectionsQuery = z.object({
  // Omit (or "home") for home page sections, otherwise the id of a custom page.
  pageId: z
    .union([z.literal('home'), idParam])
    .optional()
    .default('home'),
});

// Base fields WITHOUT defaults. Note: in Zod 4 `.partial()` still applies `.default()` values,
// so defaults must only live in the create schema — otherwise a partial update such as
// `{ isVisible: false }` would silently reset `content` and `style` to `{}`.
const sectionFields = z.object({
  label: z.string().trim().min(1).max(120),
  content: z.record(z.string(), z.unknown()),
  style: sectionStyleSchema,
  isVisible: z.boolean(),
});

export const createSectionSchema = sectionFields.extend({
  pageId: idParam.nullable().optional(),
  type: z.enum(SECTION_TYPES),
  content: sectionFields.shape.content.default({}),
  style: sectionStyleSchema.default({}),
  isVisible: z.boolean().default(true),
});

export const updateSectionSchema = sectionFields.partial();

export const reorderSectionsSchema = z.object({
  ids: z.array(idParam).min(1),
});
