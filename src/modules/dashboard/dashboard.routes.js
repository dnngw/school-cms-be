import { Router } from 'express';
import * as dashboardService from './dashboard.service.js';

export const adminDashboardRouter = Router();

adminDashboardRouter.get('/', async (_req, res) => {
  res.json({ data: await dashboardService.getSummary() });
});
