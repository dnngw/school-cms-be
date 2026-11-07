import { Router } from 'express';
import { authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './settings.controller.js';
import { settingsKeyParams } from './settings.schema.js';

/** GET /public/settings — used by the website to render identity & theme. */
export const publicSettingsRouter = Router();
publicSettingsRouter.get('/', controller.getAll);

/** /admin/settings — only admins can change site wide configuration. */
export const adminSettingsRouter = Router();
adminSettingsRouter.get('/', controller.getAll);
adminSettingsRouter.get('/defaults', controller.getDefaults);
adminSettingsRouter.put(
  '/:key',
  authorize('admin'),
  validate({ params: settingsKeyParams }),
  controller.update,
);
adminSettingsRouter.delete(
  '/:key',
  authorize('admin'),
  validate({ params: settingsKeyParams }),
  controller.reset,
);
