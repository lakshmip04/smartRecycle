import { PrismaClient } from '@prisma/client';

// This solution prevents creating a new PrismaClient instance on every hot reload
// in development, which can exhaust the database connection limit.

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
