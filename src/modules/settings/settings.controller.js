import { ApiError } from '../../utils/api-error.js';
import { SETTINGS_DEFAULTS } from './settings.defaults.js';
import { getSettingsSchema } from './settings.schema.js';
import * as settingsService from './settings.service.js';

export async function getAll(_req, res) {
  res.json({ data: await settingsService.getAll() });
}

export function getDefaults(_req, res) {
  res.json({ data: SETTINGS_DEFAULTS });
}

export async function update(req, res) {
  const { key } = req.validated.params;

  // The body schema depends on the URL param, so we validate here instead of in the router.
  const result = getSettingsSchema(key).safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    throw new ApiError(422, 'Validation failed', { details });
  }

  res.json({ data: await settingsService.update(key, result.data) });
}

export async function reset(req, res) {
  res.json({ data: await settingsService.reset(req.validated.params.key) });
}
