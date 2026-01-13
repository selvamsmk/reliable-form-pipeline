// Prisma config entrypoint for Migrate and runtime client options.
// This uses the Prisma v7 `defineConfig` helper so the CLI and tools
// can load the config (including `datasource.url`) from this file.

import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load environment variables from the API app's .env for local/dev contexts
dotenv.config({ path: path.join(__dirname, '../../apps/api/.env') });

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: `tsx ${path.join('prisma', 'seed.ts')}`,
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
