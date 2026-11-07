import slugifyLib from 'slugify';

/** Convert any text into a URL friendly slug, e.g. "Berita Terbaru!" -> "berita-terbaru". */
export function slugify(text) {
  return slugifyLib(String(text), { lower: true, strict: true, locale: 'id', trim: true });
}

/**
 * Generate a slug that is unique inside `table.column`.
 * Appends -2, -3, ... when the slug is already taken.
 *
 * @param {import('knex').Knex} db
 * @param {string} table
 * @param {string} text
 * @param {number} [ignoreId] Row id to ignore (useful on update)
 */
export async function uniqueSlug(db, table, text, ignoreId) {
  const base = slugify(text) || 'item';
  let candidate = base;
  let counter = 2;

  for (;;) {
    const query = db(table).where({ slug: candidate }).first('id');
    if (ignoreId) query.whereNot({ id: ignoreId });
    if (!(await query)) return candidate;
    candidate = `${base}-${counter++}`;
  }
}
