/**
 * Persist the order of rows in a table that has a `sort_order` column.
 * @param {import('knex').Knex} db
 * @param {string} table
 * @param {number[]} ids ids in their new order
 */
export async function reorderRows(db, table, ids) {
  await db.transaction(async (trx) => {
    await Promise.all(
      ids.map((id, index) => trx(table).where({ id }).update({ sortOrder: index })),
    );
  });
}
