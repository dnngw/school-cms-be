import bcrypt from 'bcryptjs';

/**
 * Demo seed. ⚠️ It wipes all data — never run it on a production database
 * that already contains real content.
 * @param {import('knex').Knex} knex
 */
export async function seed(knex) {
  await knex.raw(`
    TRUNCATE users, settings, categories, posts, pages, events, sections, menu_items,
             staff, gallery_items, messages, media RESTART IDENTITY CASCADE
  `);

  const password = process.env.SEED_ADMIN_PASSWORD || 'admin12345';
  await knex('users').insert([
    {
      name: 'Administrator',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@sekolah.sch.id',
      password_hash: await bcrypt.hash(password, 12),
      role: 'admin',
    },
    {
      name: 'Editor Berita',
      email: 'editor@sekolah.sch.id',
      password_hash: await bcrypt.hash(password, 12),
      role: 'editor',
    },
  ]);
}
