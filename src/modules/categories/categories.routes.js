import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/common-schemas.js';
import * as controller from './categories.controller.js';
import { categorySchema } from './categories.schema.js';

export const publicCategoriesRouter = Router();
publicCategoriesRouter.get('/', controller.list);

export const adminCategoriesRouter = Router();
adminCategoriesRouter.get('/', controller.list);
adminCategoriesRouter.post('/', validate({ body: categorySchema }), controller.create);
adminCategoriesRouter.put(
  '/:id',
  validate({ params: idParams, body: categorySchema }),
  controller.update,
);
adminCategoriesRouter.delete('/:id', validate({ params: idParams }), controller.remove);
