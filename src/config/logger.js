import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.isTest ? 'silent' : env.LOG_LEVEL,
  // Pretty logs in development, structured JSON in production (easier for log collectors).
  transport: env.isProduction || env.isTest ? undefined : { target: 'pino-pretty' },
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
});
