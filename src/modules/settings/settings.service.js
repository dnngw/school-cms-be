import { db } from '../../db/knex.js';
import { deepMerge } from '../../utils/deep-merge.js';
import { SETTINGS_DEFAULTS } from './settings.defaults.js';

/** Return every settings group, stored values merged on top of the defaults. */
export async function getAll() {
  const rows = await db('settings').select('key', 'value');
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return Object.fromEntries(
    Object.entries(SETTINGS_DEFAULTS).map(([key, defaults]) => [
      key,
      deepMerge(defaults, stored[key]),
    ]),
  );
}

export async function get(key) {
  const row = await db('settings').where({ key }).first('value');
  return deepMerge(SETTINGS_DEFAULTS[key], row?.value);
}

/** Insert or update a settings group (UPSERT). */
export async function update(key, value) {
  await db('settings')
    .insert({ key, value: JSON.stringify(value) })
    .onConflict('key')
    .merge({ value: JSON.stringify(value) });
  return get(key);
}

/** Remove the stored value so the group falls back to the defaults. */
export async function reset(key) {
  await db('settings').where({ key }).delete();
  return get(key);
}
