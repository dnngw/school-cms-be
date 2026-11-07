import { prisma } from '../../db/prisma.js';
import { deepMerge } from '../../utils/deep-merge.js';
import { SETTINGS_DEFAULTS } from './settings.defaults.js';

/** Return every settings group, stored values merged on top of the defaults. */
export async function getAll() {
  const rows = await prisma.setting.findMany({ select: { key: true, value: true } });
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return Object.fromEntries(
    Object.entries(SETTINGS_DEFAULTS).map(([key, defaults]) => [
      key,
      deepMerge(defaults, stored[key]),
    ]),
  );
}

export async function get(key) {
  const row = await prisma.setting.findUnique({ where: { key }, select: { value: true } });
  return deepMerge(SETTINGS_DEFAULTS[key], row?.value);
}

/** Insert or update a settings group (UPSERT). */
export async function update(key, value) {
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  return get(key);
}

/** Remove the stored value so the group falls back to the defaults. */
export async function reset(key) {
  await prisma.setting.deleteMany({ where: { key } });
  return get(key);
}
