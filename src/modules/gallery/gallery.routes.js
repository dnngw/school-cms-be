import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams } from '../../utils/common-schemas.js';
import * as controller from './gallery.controller.js';
import { galleryItemSchema, galleryQuery } from './gallery.schema.js';

export const publicGalleryRouter = Router();
publicGalleryRouter.get('/', validate({ query: galleryQuery }), controller.listVisible);
publicGalleryRouter.get('/albums', controller.listAlbums);

export const adminGalleryRouter = Router();
adminGalleryRouter.get('/', validate({ query: galleryQuery }), controller.list);
adminGalleryRouter.post('/', validate({ body: galleryItemSchema }), controller.create);
adminGalleryRouter.put(
  '/:id',
  validate({ params: idParams, body: galleryItemSchema }),
  controller.update,
);
adminGalleryRouter.delete('/:id', validate({ params: idParams }), controller.remove);
