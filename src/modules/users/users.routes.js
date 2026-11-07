import { Router } from 'express';
import { authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/common-schemas.js';
import * as controller from './users.controller.js';
import { createUserSchema, updateUserSchema } from './users.schema.js';

export const adminUsersRouter = Router();

// Only admins can manage accounts.
adminUsersRouter.use(authorize('admin'));
adminUsersRouter.get('/', controller.list);
adminUsersRouter.post('/', validate({ body: createUserSchema }), controller.create);
adminUsersRouter.put(
  '/:id',
  validate({ params: idParams, body: updateUserSchema }),
  controller.update,
);
adminUsersRouter.delete('/:id', validate({ params: idParams }), controller.remove);
