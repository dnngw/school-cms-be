import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, slugParams } from '../../utils/common-schemas.js';
import * as controller from './pages.controller.js';
import { pageSchema } from './pages.schema.js';

export const publicPagesRouter = Router();
publicPagesRouter.get('/:slug', validate({ params: slugParams }), controller.showPublished);

export const adminPagesRouter = Router();
adminPagesRouter.get('/', controller.list);
adminPagesRouter.post('/', validate({ body: pageSchema }), controller.create);
adminPagesRouter.get('/:id', validate({ params: idParams }), controller.show);
adminPagesRouter.put('/:id', validate({ params: idParams, body: pageSchema }), controller.update);
adminPagesRouter.delete('/:id', validate({ params: idParams }), controller.remove);
