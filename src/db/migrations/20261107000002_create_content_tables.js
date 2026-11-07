const PUBLISH_STATUS = ['draft', 'published'];

/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('slug', 120).notNullable().unique();
    table.text('description');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('excerpt');
    table.text('content').notNullable().defaultTo('');
    table.string('cover_image');
    table.integer('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.integer('author_id').references('id').inTable('users').onDelete('SET NULL');
    table
      .enu('status', PUBLISH_STATUS, { useNative: true, enumName: 'publish_status' })
      .notNullable()
      .defaultTo('draft');
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.timestamp('published_at', { useTz: true });
    table.integer('views').notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(['status', 'published_at']);
  });

  await knex.schema.createTable('pages', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('content').notNullable().defaultTo('');
    table.string('cover_image');
    table.string('meta_description', 300);
    table
      .enu('status', null, { useNative: true, existingType: true, enumName: 'publish_status' })
      .notNullable()
      .defaultTo('draft');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.string('slug', 220).notNullable().unique();
    table.text('description').notNullable().defaultTo('');
    table.string('location', 200);
    table.timestamp('start_at', { useTz: true }).notNullable();
    table.timestamp('end_at', { useTz: true });
    table.string('cover_image');
    table.boolean('is_published').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(['is_published', 'start_at']);
  });

  for (const tableName of ['categories', 'posts', 'pages', 'events']) {
    await knex.raw(
      `CREATE TRIGGER ${tableName}_updated_at BEFORE UPDATE ON ${tableName}
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
    );
  }
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('pages');
  await knex.schema.dropTableIfExists('posts');
  await knex.schema.dropTableIfExists('categories');
  await knex.raw('DROP TYPE IF EXISTS publish_status');
}
