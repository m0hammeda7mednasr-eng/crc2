import { PrismaClient } from '@prisma/client';

// Singleton instance to avoid multiple PrismaClient instances
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
