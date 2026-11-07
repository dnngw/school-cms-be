import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import * as controller from './sections.controller.js';
import {
  createSectionSchema,
  listSectionsQuery,
  reorderSectionsSchema,
  sectionIdParams,
  updateSectionSchema,
} from './sections.schema.js';

export const publicSectionsRouter = Router();
publicSectionsRouter.get('/', controller.listPublic);

export const adminSectionsRouter = Router();
adminSectionsRouter.get('/', validate({ query: listSectionsQuery }), controller.list);
adminSectionsRouter.post('/', validate({ body: createSectionSchema }), controller.create);
// Static paths must be declared before "/:id" so they are not captured as an id.
adminSectionsRouter.put('/reorder', validate({ body: reorderSectionsSchema }), controller.reorder);
adminSectionsRouter.get('/:id', validate({ params: sectionIdParams }), controller.show);
adminSectionsRouter.put(
  '/:id',
  validate({ params: sectionIdParams, body: updateSectionSchema }),
  controller.update,
);
adminSectionsRouter.post(
  '/:id/duplicate',
  validate({ params: sectionIdParams }),
  controller.duplicate,
);
adminSectionsRouter.delete('/:id', validate({ params: sectionIdParams }), controller.remove);
