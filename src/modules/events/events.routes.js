import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, slugParams } from '../../utils/common-schemas.js';
import { paginationQuery } from '../../utils/pagination.js';
import * as controller from './events.controller.js';
import { eventSchema, publicEventsQuery } from './events.schema.js';

export const publicEventsRouter = Router();
publicEventsRouter.get('/', validate({ query: publicEventsQuery }), controller.listPublished);
publicEventsRouter.get('/:slug', validate({ params: slugParams }), controller.showPublished);

export const adminEventsRouter = Router();
adminEventsRouter.get('/', validate({ query: paginationQuery }), controller.list);
adminEventsRouter.post('/', validate({ body: eventSchema }), controller.create);
adminEventsRouter.get('/:id', validate({ params: idParams }), controller.show);
adminEventsRouter.put('/:id', validate({ params: idParams, body: eventSchema }), controller.update);
adminEventsRouter.delete('/:id', validate({ params: idParams }), controller.remove);
