// Configuration for the Prisma CLI (migrate, generate, studio, seed).
// Docs: https://pris.ly/prisma-config
import { defineConfig } from 'prisma/config';

// Load .env with Node's built-in loader (no dotenv dependency needed).
try {
  process.loadEnvFile();
} catch {
  // No .env file — use real environment variables (Docker / CI).
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
