/** @param {import('knex').Knex} knex */
export async function up(knex) {
  // Messages sent by visitors through the public contact form.
  await knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 160).notNullable();
    table.string('phone', 30);
    table.string('subject', 200);
    table.text('message').notNullable();
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Media library: every uploaded file is tracked here.
  await knex.schema.createTable('media', (table) => {
    table.increments('id').primary();
    table.string('filename').notNullable().unique();
    table.string('original_name').notNullable();
    table.string('mimetype', 100).notNullable();
    table.integer('size').notNullable();
    table.string('url').notNullable();
    table.string('alt', 200);
    table.integer('uploaded_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('media');
  await knex.schema.dropTableIfExists('messages');
}
