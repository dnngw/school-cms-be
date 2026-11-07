/** @param {import('knex').Knex} knex */
export async function up(knex) {
  // Teachers & staff directory.
  await knex.schema.createTable('staff', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('position', 120).notNullable();
    table.string('subject', 120);
    table.string('photo');
    table.text('bio');
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_visible').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('gallery_items', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.text('description');
    table.string('image').notNullable();
    table.string('album', 100);
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_visible').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(['album']);
  });

  for (const tableName of ['staff', 'gallery_items']) {
    await knex.raw(
      `CREATE TRIGGER ${tableName}_updated_at BEFORE UPDATE ON ${tableName}
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
    );
  }
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('gallery_items');
  await knex.schema.dropTableIfExists('staff');
}
