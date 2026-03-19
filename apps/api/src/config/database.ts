import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString: process.env.DATABASE_URL }) as any;
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });