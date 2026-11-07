import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import {
  adminCategoriesRouter,
  publicCategoriesRouter,
} from '../modules/categories/categories.routes.js';
import { adminDashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { adminEventsRouter, publicEventsRouter } from '../modules/events/events.routes.js';
import { adminGalleryRouter, publicGalleryRouter } from '../modules/gallery/gallery.routes.js';
import { adminMediaRouter } from '../modules/media/media.routes.js';
import { adminMenusRouter, publicMenusRouter } from '../modules/menus/menus.routes.js';
import { adminMessagesRouter, publicMessagesRouter } from '../modules/messages/messages.routes.js';
import { adminPagesRouter, publicPagesRouter } from '../modules/pages/pages.routes.js';
import { adminPostsRouter, publicPostsRouter } from '../modules/posts/posts.routes.js';
import { adminSectionsRouter, publicSectionsRouter } from '../modules/sections/sections.routes.js';
import { adminSettingsRouter, publicSettingsRouter } from '../modules/settings/settings.routes.js';
import { adminStaffRouter, publicStaffRouter } from '../modules/staff/staff.routes.js';
import { adminUsersRouter } from '../modules/users/users.routes.js';

/**
 * API surface:
 *   /api/v1/auth/*    login & profile
 *   /api/v1/public/*  read-only content for the website (no auth)
 *   /api/v1/admin/*   CMS management (JWT required)
 */
export const apiRouter = Router();

apiRouter.use('/auth', authRouter);

// --- Public website --------------------------------------------------------
const publicRouter = Router();
publicRouter.use('/settings', publicSettingsRouter);
publicRouter.use('/menus', publicMenusRouter);
publicRouter.use('/sections', publicSectionsRouter);
publicRouter.use('/posts', publicPostsRouter);
publicRouter.use('/categories', publicCategoriesRouter);
publicRouter.use('/pages', publicPagesRouter);
publicRouter.use('/events', publicEventsRouter);
publicRouter.use('/staff', publicStaffRouter);
publicRouter.use('/gallery', publicGalleryRouter);
publicRouter.use('/messages', publicMessagesRouter);
apiRouter.use('/public', publicRouter);

// --- Admin CMS (every route below requires a valid token) ------------------
const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use('/dashboard', adminDashboardRouter);
adminRouter.use('/settings', adminSettingsRouter);
adminRouter.use('/menus', adminMenusRouter);
adminRouter.use('/sections', adminSectionsRouter);
adminRouter.use('/posts', adminPostsRouter);
adminRouter.use('/categories', adminCategoriesRouter);
adminRouter.use('/pages', adminPagesRouter);
adminRouter.use('/events', adminEventsRouter);
adminRouter.use('/staff', adminStaffRouter);
adminRouter.use('/gallery', adminGalleryRouter);
adminRouter.use('/messages', adminMessagesRouter);
adminRouter.use('/media', adminMediaRouter);
adminRouter.use('/users', adminUsersRouter);
apiRouter.use('/admin', adminRouter);
