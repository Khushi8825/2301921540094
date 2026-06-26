import { PrismaClient } from '@prisma/client';
import env from './Env.js';

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

export default prisma;