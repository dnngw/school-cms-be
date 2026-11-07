import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { apiLimiter } from './middlewares/rate-limit.js';
import { uploadDir } from './middlewares/upload.js';
import { apiRouter } from './routes/index.js';

/**
 * Build the Express application.
 * Kept separate from `server.js` so tests can import the app without opening a port.
 */
export function createApp() {
  const app = express();

  // Behind a reverse proxy (nginx, Railway, Render...) so req.ip is the real client IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // --- Security & parsing -------------------------------------------------
  app.use(
    helmet({
      // Allow the frontend (another origin) to display uploaded images.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp({ logger, autoLogging: !env.isTest }));

  // --- Static uploads -----------------------------------------------------
  app.use(
    '/uploads',
    express.static(uploadDir, {
      maxAge: '30d',
      setHeaders: (res) => {
        // Uploaded files (e.g. SVG) must never be able to run scripts.
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        );
      },
    }),
  );

  // --- Routes -------------------------------------------------------------
  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
  app.use('/api/v1', apiLimiter, apiRouter);

  // --- Errors (must be registered last) -------------------------------------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
