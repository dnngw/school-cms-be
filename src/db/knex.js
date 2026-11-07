import knex from 'knex';
import { knexConfig } from './config.js';

/** Single shared database connection pool for the whole app. */
export const db = knex(knexConfig);
