import { prisma } from '../db/prisma.js';

/**
 * Persist the order of rows that have a `sortOrder` field, in one transaction.
 * @param {{ update: Function }} model e.g. `prisma.staff`
 * @param {number[]} ids ids in their new order
 */
export async function reorderRows(model, ids) {
  await prisma.$transaction(
    ids.map((id, index) => model.update({ where: { id }, data: { sortOrder: index } })),
  );
}

/** Next `sortOrder` value so new rows are appended at the end. */
export async function nextSortOrder(model, where = {}) {
  const { _max } = await model.aggregate({ where, _max: { sortOrder: true } });
  return (_max.sortOrder ?? -1) + 1;
}
