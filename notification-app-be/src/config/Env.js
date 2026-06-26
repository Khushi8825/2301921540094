import 'dotenv/config';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  DATABASE_URL: process.env.DATABASE_URL,

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  AFFORDMED_ACCESS_TOKEN: process.env.AFFORDMED_ACCESS_TOKEN,
  AFFORDMED_NOTIFICATION_API: process.env.AFFORDMED_NOTIFICATION_API,

  CACHE_TTL_NOTIFICATIONS: parseInt(process.env.CACHE_TTL_NOTIFICATIONS || '300', 10),
  CACHE_TTL_COUNT: parseInt(process.env.CACHE_TTL_COUNT || '60', 10),

  NOTIFICATION_QUEUE_NAME: process.env.NOTIFICATION_QUEUE_NAME || 'notification-delivery',
  DLQ_NAME: process.env.DLQ_NAME || 'notification-dlq',
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
};

const required = ['DATABASE_URL', 'JWT_SECRET', 'AFFORDMED_ACCESS_TOKEN', 'AFFORDMED_NOTIFICATION_API'];

for (const key of required) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default env;