import { Router } from 'express';
import { strictLimiter } from '../../middlewares/rate-limit.js';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/common-schemas.js';
import * as controller from './messages.controller.js';
import { createMessageSchema, messagesQuery, updateMessageSchema } from './messages.schema.js';

export const publicMessagesRouter = Router();
publicMessagesRouter.post(
  '/',
  strictLimiter,
  validate({ body: createMessageSchema }),
  controller.create,
);

export const adminMessagesRouter = Router();
adminMessagesRouter.get('/', validate({ query: messagesQuery }), controller.list);
adminMessagesRouter.patch(
  '/:id',
  validate({ params: idParams, body: updateMessageSchema }),
  controller.update,
);
adminMessagesRouter.delete('/:id', validate({ params: idParams }), controller.remove);
