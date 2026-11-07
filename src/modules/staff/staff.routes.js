import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, reorderSchema } from '../../utils/common-schemas.js';
import * as controller from './staff.controller.js';
import { publicStaffQuery, staffSchema } from './staff.schema.js';

export const publicStaffRouter = Router();
publicStaffRouter.get('/', validate({ query: publicStaffQuery }), controller.listVisible);

export const adminStaffRouter = Router();
adminStaffRouter.get('/', controller.list);
adminStaffRouter.post('/', validate({ body: staffSchema }), controller.create);
adminStaffRouter.put('/reorder', validate({ body: reorderSchema }), controller.reorder);
adminStaffRouter.put('/:id', validate({ params: idParams, body: staffSchema }), controller.update);
adminStaffRouter.delete('/:id', validate({ params: idParams }), controller.remove);
