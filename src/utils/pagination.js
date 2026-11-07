import { z } from 'zod';

/** Reusable query schema for paginated list endpoints. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

/**
 * Run `findMany` + `count` for a Prisma model and return `{ data, meta }`.
 *
 * @example
 * paginate(prisma.post, { where, orderBy: { createdAt: 'desc' } }, { page: 1, limit: 10 })
 *
 * @param {{ findMany: Function, count: Function }} model e.g. `prisma.post`
 * @param {object} args findMany arguments (where, orderBy, select, include, ...)
 * @param {{ page: number, limit: number }} options
 */
export async function paginate(model, args, { page, limit }) {
  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip: (page - 1) * limit, take: limit }),
    model.count({ where: args.where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

/** Case-insensitive "contains" filter (PostgreSQL ILIKE). */
export const contains = (value) => ({ contains: value, mode: 'insensitive' });
