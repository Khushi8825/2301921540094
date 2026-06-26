import { Redis } from 'ioredis';
import env from './Env.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  Log('backend', 'info', 'cache', 'Redis connection established');
});

redis.on('error', (err) => {
  Log('backend', 'error', 'cache', `Redis connection error: ${err.message}`);
});

redis.on('reconnecting', () => {
  Log('backend', 'warn', 'cache', 'Redis reconnecting...');
});

// export default redis;