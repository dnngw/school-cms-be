import slugifyLib from 'slugify';

/** Convert any text into a URL friendly slug, e.g. "Berita Terbaru!" -> "berita-terbaru". */
export function slugify(text) {
  return slugifyLib(String(text), { lower: true, strict: true, locale: 'id', trim: true });
}

/**
 * Generate a slug that is unique for a Prisma model with a `slug` column.
 * Appends -2, -3, ... when the slug is already taken.
 *
 * @param {{ findFirst: Function }} model e.g. `prisma.post`
 * @param {string} text
 * @param {number} [ignoreId] Row id to ignore (useful on update)
 */
export async function uniqueSlug(model, text, ignoreId) {
  const base = slugify(text) || 'item';
  let candidate = base;
  let counter = 2;

  for (;;) {
    const taken = await model.findFirst({
      where: { slug: candidate, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
      select: { id: true },
    });
    if (!taken) return candidate;
    candidate = `${base}-${counter++}`;
  }
}
