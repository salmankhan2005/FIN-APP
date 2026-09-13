/**
 * Prisma Client Singleton
 * 
 * CRITICAL: Never create `new PrismaClient()` in individual route files.
 * Each instance opens its own connection pool, quickly exhausting Neon's
 * connection limit and causing severe slowdowns.
 * 
 * All routes must import from this file instead.
 */

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

const prisma = globalForPrisma.__prisma;

module.exports = prisma;
