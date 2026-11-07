import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, reorderSchema } from '../../utils/common-schemas.js';
import * as controller from './menus.controller.js';
import { menuItemSchema } from './menus.schema.js';

export const publicMenusRouter = Router();
publicMenusRouter.get('/', controller.getMenus);

export const adminMenusRouter = Router();
adminMenusRouter.get('/', controller.list);
adminMenusRouter.post('/', validate({ body: menuItemSchema }), controller.create);
adminMenusRouter.put('/reorder', validate({ body: reorderSchema }), controller.reorder);
adminMenusRouter.put(
  '/:id',
  validate({ params: idParams, body: menuItemSchema }),
  controller.update,
);
adminMenusRouter.delete('/:id', validate({ params: idParams }), controller.remove);
