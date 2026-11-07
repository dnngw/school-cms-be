import knex from 'knex';
import { knexConfig } from './config.js';

const toSnakeCase = (value) => value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
const toCamelCase = (value) => value.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());

const camelizeRow = (row) =>
  row && typeof row === 'object' && !Array.isArray(row) && !(row instanceof Date)
    ? Object.fromEntries(Object.entries(row).map(([key, value]) => [toCamelCase(key), value]))
    : row;

/**
 * Single shared database connection pool for the whole app.
 *
 * JavaScript uses camelCase while PostgreSQL uses snake_case. These two hooks translate
 * automatically, so services write `{ categoryId }` and get `{ createdAt }` back.
 * Only top-level column names are converted — JSONB values are left untouched.
 */
export const db = knex({
  ...knexConfig,
  wrapIdentifier: (value, origImpl) => origImpl(value === '*' ? value : toSnakeCase(value)),
  postProcessResponse: (result) =>
    Array.isArray(result) ? result.map(camelizeRow) : camelizeRow(result),
});
