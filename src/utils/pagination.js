import { z } from 'zod';

/** Reusable query schema for paginated list endpoints. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

/**
 * Run a Knex query with pagination and return `{ data, meta }`.
 *
 * @param {import('knex').Knex.QueryBuilder} query base query (filters already applied)
 * @param {{ page: number, limit: number }} options
 */
export async function paginate(query, { page, limit }) {
  const countQuery = query.clone().clearSelect().clearOrder().count({ total: '*' }).first();
  const [rows, { total }] = await Promise.all([
    query.limit(limit).offset((page - 1) * limit),
    countQuery,
  ]);

  const totalItems = Number(total);
  return {
    data: rows,
    meta: { page, limit, total: totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
  };
}
