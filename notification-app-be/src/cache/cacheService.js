// import redis from '../config/redis.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function getCache(key) {
  try {
    const value = await redis.get(key);
    if (value) {
      await Log('backend', 'debug', 'cache', `Cache HIT: ${key}`);
      return JSON.parse(value);
    }
    await Log('backend', 'debug', 'cache', `Cache MISS: ${key}`);
    return null;
  } catch (err) {
    await Log('backend', 'warn', 'cache', `Cache get error for ${key}: ${err.message}`);
    return null;
  }
}

async function setCache(key, value, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    await Log('backend', 'debug', 'cache', `Cache SET: ${key} TTL=${ttlSeconds}s`);
  } catch (err) {
    await Log('backend', 'warn', 'cache', `Cache set error for ${key}: ${err.message}`);
  }
}

async function deleteCache(key) {
  try {
    await redis.del(key);
    await Log('backend', 'debug', 'cache', `Cache DEL: ${key}`);
  } catch (err) {
    await Log('backend', 'warn', 'cache', `Cache delete error for ${key}: ${err.message}`);
  }
}

async function invalidatePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      await Log('backend', 'info', 'cache', `Cache invalidated ${keys.length} keys matching: ${pattern}`);
    }
  } catch (err) {
    await Log('backend', 'warn', 'cache', `Cache pattern invalidation error for ${pattern}: ${err.message}`);
  }
}

export { getCache, setCache, deleteCache, invalidatePattern };