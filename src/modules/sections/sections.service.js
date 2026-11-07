import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { reorderRows } from '../../utils/reorder.js';

const TABLE = 'sections';

const scopeToPage = (query, pageId) =>
  pageId === 'home' || pageId === null || pageId === undefined
    ? query.whereNull('pageId')
    : query.where({ pageId });

export async function list({ pageId = 'home', onlyVisible = false } = {}) {
  const query = scopeToPage(db(TABLE), pageId).orderBy([{ column: 'sortOrder' }, { column: 'id' }]);
  if (onlyVisible) query.where({ isVisible: true });
  return query;
}

export async function findById(id) {
  const row = await db(TABLE).where({ id }).first();
  if (!row) throw ApiError.notFound('Section not found');
  return row;
}

export async function create({ pageId = null, type, label, content, style, isVisible }) {
  // New sections are appended at the end of the page.
  const { max } = await scopeToPage(db(TABLE), pageId).max({ max: 'sortOrder' }).first();

  const [row] = await db(TABLE)
    .insert({
      pageId,
      type,
      label,
      content: JSON.stringify(content),
      style: JSON.stringify(style),
      isVisible,
      sortOrder: (max ?? -1) + 1,
    })
    .returning('*');
  return row;
}

export async function update(id, data) {
  const changes = {};
  if (data.label !== undefined) changes.label = data.label;
  if (data.content !== undefined) changes.content = JSON.stringify(data.content);
  if (data.style !== undefined) changes.style = JSON.stringify(data.style);
  if (data.isVisible !== undefined) changes.isVisible = data.isVisible;

  const [row] = await db(TABLE).where({ id }).update(changes).returning('*');
  if (!row) throw ApiError.notFound('Section not found');
  return row;
}

export async function duplicate(id) {
  const source = await findById(id);
  return create({ ...source, label: `${source.label} (copy)` });
}

export async function remove(id) {
  const deleted = await db(TABLE).where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Section not found');
}

/** Persist a new order. `ids` is the full list of section ids in their new order. */
export const reorder = (ids) => reorderRows(db, TABLE, ids);
