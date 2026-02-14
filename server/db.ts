import { PrismaClient } from '@/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    transactionOptions: {
      timeout: 10000,
      maxWait: 5000,
    },
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export { db };
