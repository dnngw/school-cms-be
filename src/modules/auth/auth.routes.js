import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { strictLimiter } from '../../middlewares/rate-limit.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './auth.controller.js';
import { changePasswordSchema, loginSchema, updateProfileSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/login', strictLimiter, validate({ body: loginSchema }), controller.login);
authRouter.get('/me', authenticate, controller.me);
authRouter.patch('/me', authenticate, validate({ body: updateProfileSchema }), controller.updateMe);
authRouter.put(
  '/me/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  controller.changePassword,
);
