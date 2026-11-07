import { env } from '../config/env.js';

/**
 * Shared Knex configuration, used by both the app and the Knex CLI (knexfile.js).
 * @type {import('knex').Knex.Config}
 */
export const knexConfig = {
  client: 'pg',
  connection: env.DATABASE_URL,
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './src/db/migrations',
    tableName: 'knex_migrations',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: './src/db/seeds',
    loadExtensions: ['.js'],
  },
};
