/**
 * Base tables + a reusable trigger that keeps `updated_at` in sync automatically.
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 160).notNullable().unique();
    table.string('password_hash').notNullable();
    table.enu('role', ['admin', 'editor'], { useNative: true, enumName: 'user_role' }).notNullable().defaultTo('editor');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('last_login_at', { useTz: true });
    table.timestamps(true, true);
  });

  // Key-value store for site wide configuration (general, theme, contact, seo, ...).
  await knex.schema.createTable('settings', (table) => {
    table.string('key', 60).primary();
    table.jsonb('value').notNullable().defaultTo('{}');
    table.timestamps(true, true);
  });

  for (const tableName of ['users', 'settings']) {
    await knex.raw(
      `CREATE TRIGGER ${tableName}_updated_at BEFORE UPDATE ON ${tableName}
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
    );
  }
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_role');
  await knex.raw('DROP FUNCTION IF EXISTS set_updated_at');
}
