import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './db/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 API ready on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

/** Stop accepting requests, finish in-flight ones, then close the DB connection. */
async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit if something hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  process.exit(1);
});
