import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const globalForPrisma = globalThis;

function createPrisma() {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = prisma; // cache in all environments
