import { z } from 'zod';

// Load variables from `.env` when the file exists (Node >= 20.12 built-in, no dotenv needed).
try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on real environment variables (e.g. in Docker / CI).
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(5),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: the app must not boot with an invalid configuration.
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:\n', z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = Object.freeze({
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
});
