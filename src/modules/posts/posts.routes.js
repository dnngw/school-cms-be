import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParams, slugParams } from '../../utils/common-schemas.js';
import * as controller from './posts.controller.js';
import { adminPostsQuery, postSchema, publicPostsQuery } from './posts.schema.js';

export const publicPostsRouter = Router();
publicPostsRouter.get('/', validate({ query: publicPostsQuery }), controller.listPublished);
publicPostsRouter.get('/:slug', validate({ params: slugParams }), controller.showPublished);

export const adminPostsRouter = Router();
adminPostsRouter.get('/', validate({ query: adminPostsQuery }), controller.list);
adminPostsRouter.post('/', validate({ body: postSchema }), controller.create);
adminPostsRouter.get('/:id', validate({ params: idParams }), controller.show);
adminPostsRouter.put('/:id', validate({ params: idParams, body: postSchema }), controller.update);
adminPostsRouter.delete('/:id', validate({ params: idParams }), controller.remove);
