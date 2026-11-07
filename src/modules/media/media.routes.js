import { Router } from 'express';
import { upload } from '../../middlewares/upload.js';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/common-schemas.js';
import * as controller from './media.controller.js';
import { mediaQuery, updateMediaSchema } from './media.schema.js';

export const adminMediaRouter = Router();
adminMediaRouter.get('/', validate({ query: mediaQuery }), controller.list);
adminMediaRouter.post('/', upload.single('file'), controller.upload);
adminMediaRouter.patch(
  '/:id',
  validate({ params: idParams, body: updateMediaSchema }),
  controller.update,
);
adminMediaRouter.delete('/:id', validate({ params: idParams }), controller.remove);
