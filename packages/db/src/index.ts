import dotenv from 'dotenv';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

// load env from the API app for local/dev
dotenv.config({ path: path.join(__dirname, '../../apps/api/.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

export { adapter };
export default prisma;
