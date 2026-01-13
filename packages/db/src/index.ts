import dotenv from 'dotenv';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

// Load env from the API app for local/dev. The file sits three levels up from this file:
// packages/db/src -> ../../.. -> repo root -> apps/api/.env
const envPath = path.resolve(__dirname, '../../../apps/api/.env');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
	console.warn(
		`packages/db: DATABASE_URL not set (looked in ${envPath}). Ensure environment is loaded or set DATABASE_URL.`
	);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

export { adapter };
export default prisma;

// Re-export types from generated client for other packages to import
export type { Submission, SubmissionStatus } from './generated/client';
