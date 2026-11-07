/** @param {import('knex').Knex} knex */
export async function up(knex) {
  // Page builder blocks. `page_id = NULL` means the section belongs to the home page.
  await knex.schema.createTable('sections', (table) => {
    table.increments('id').primary();
    table.integer('page_id').references('id').inTable('pages').onDelete('CASCADE');
    table.string('type', 50).notNullable();
    table.string('label', 120).notNullable();
    table.jsonb('content').notNullable().defaultTo('{}');
    table.jsonb('style').notNullable().defaultTo('{}');
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_visible').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(['page_id', 'sort_order']);
  });

  // Navigation for the header and footer (supports one level of sub menu via parent_id).
  await knex.schema.createTable('menu_items', (table) => {
    table.increments('id').primary();
    table.enu('location', ['header', 'footer'], { useNative: true, enumName: 'menu_location' }).notNullable().defaultTo('header');
    table.string('label', 100).notNullable();
    table.string('url', 500).notNullable();
    table.integer('parent_id').references('id').inTable('menu_items').onDelete('CASCADE');
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('open_in_new_tab').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.index(['location', 'sort_order']);
  });

  for (const tableName of ['sections', 'menu_items']) {
    await knex.raw(
      `CREATE TRIGGER ${tableName}_updated_at BEFORE UPDATE ON ${tableName}
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
    );
  }
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('menu_items');
  await knex.schema.dropTableIfExists('sections');
  await knex.raw('DROP TYPE IF EXISTS menu_location');
}
