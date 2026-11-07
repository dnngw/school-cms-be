import { db } from '../../db/knex.js';
import { ApiError } from '../../utils/api-error.js';
import { reorderRows } from '../../utils/reorder.js';

const ordered = () => db('menu_items').orderBy([{ column: 'sortOrder' }, { column: 'id' }]);

/** Turn a flat list into a tree: [{ ...item, children: [...] }]. */
function buildTree(items) {
  const byId = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
  const roots = [];
  for (const item of byId.values()) {
    const parent = item.parentId && byId.get(item.parentId);
    (parent ? parent.children : roots).push(item);
  }
  return roots;
}

/** Public: `{ header: Tree, footer: Tree }` */
export async function getMenus() {
  const items = await ordered();
  return {
    header: buildTree(items.filter((item) => item.location === 'header')),
    footer: buildTree(items.filter((item) => item.location === 'footer')),
  };
}

export const list = () => ordered();

export async function create(data) {
  if (data.parentId) await assertValidParent(data.parentId);
  const { max } = await db('menu_items')
    .where({ location: data.location })
    .max({ max: 'sortOrder' })
    .first();
  const [row] = await db('menu_items')
    .insert({ ...data, sortOrder: (max ?? -1) + 1 })
    .returning('*');
  return row;
}

export async function update(id, data) {
  if (data.parentId === id) throw ApiError.badRequest('A menu item cannot be its own parent');
  if (data.parentId) await assertValidParent(data.parentId);
  const [row] = await db('menu_items').where({ id }).update(data).returning('*');
  if (!row) throw ApiError.notFound('Menu item not found');
  return row;
}

export async function remove(id) {
  const deleted = await db('menu_items').where({ id }).delete();
  if (!deleted) throw ApiError.notFound('Menu item not found');
}

export const reorder = (ids) => reorderRows(db, 'menu_items', ids);

/** Only one level of nesting is supported (dropdown menus). */
async function assertValidParent(parentId) {
  const parent = await db('menu_items').where({ id: parentId }).first('id', 'parentId');
  if (!parent) throw ApiError.badRequest('Parent menu item not found');
  if (parent.parentId) throw ApiError.badRequest('Only one level of sub menu is supported');
}
