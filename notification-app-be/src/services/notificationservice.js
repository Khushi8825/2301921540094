import {
  findUserNotificationsPaginated,
  findUnreadNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteUserNotification,
  upsertNotification,
  upsertUserNotification,
  findNotificationType,
  createNotificationType,
  createOutboxEvent,
  findStudentsWithPlacementLastNDays,
} from '../repositories/notificationrepository.js';
import { getCache, setCache, deleteCache, invalidatePattern } from '../cache/cacheService.js';
import { CacheKeys } from '../utils/cachekeys.js';
import { notificationQueue } from '../queues/notificationqueue.js';
import { fetchExternalNotifications } from './affordmedclient.js';
import { applyPriorityAlgorithm } from './priorityservice.js';
import { AppError } from '../utils/appError.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';
import env from '../config/Env.js';

const TYPE_PRIORITIES = { Placement: 3, Result: 2, Event: 1 };

async function ensureNotificationType(typeName) {
  let type = await findNotificationType(typeName);
  if (!type) {
    const priority = TYPE_PRIORITIES[typeName] ?? 0;
    type = await createNotificationType(typeName, priority);
  }
  return type;
}

async function getNotifications(userId, page, limit) {
  const cacheKey = CacheKeys.userNotifications(userId, page, limit);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await findUserNotificationsPaginated(userId, page, limit);

  await setCache(cacheKey, result, env.CACHE_TTL_NOTIFICATIONS);
  return result;
}

async function getUnreadNotifications(userId, page, limit) {
  const cacheKey = CacheKeys.userUnread(userId, page, limit);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await findUnreadNotifications(userId, page, limit);

  await setCache(cacheKey, result, env.CACHE_TTL_NOTIFICATIONS);
  return result;
}

async function getUnreadCount(userId) {
  const cacheKey = CacheKeys.userCount(userId);
  const cached = await getCache(cacheKey);
  if (cached !== null) return cached;

  const count = await countUnreadNotifications(userId);

  await setCache(cacheKey, count, env.CACHE_TTL_COUNT);
  return count;
}

async function markAsRead(userId, notificationId) {
  const result = await markNotificationRead(userId, notificationId);

  if (result.count === 0) {
    throw new AppError('Notification not found or already read', 404);
  }

  await invalidatePattern(CacheKeys.userPattern(userId));
  await deleteCache(CacheKeys.userCount(userId));

  await Log('backend', 'info', 'service', `Marked notification ${notificationId} read for user ${userId}`);

  return result;
}

async function markAllRead(userId, typeFilter) {
  const result = await markAllNotificationsRead(userId, typeFilter);

  await invalidatePattern(CacheKeys.userPattern(userId));
  await deleteCache(CacheKeys.userCount(userId));

  await Log('backend', 'info', 'service', `Marked all notifications read for user ${userId} count=${result.count}`);

  return result;
}

async function deleteNotification(userId, notificationId) {
  const result = await deleteUserNotification(userId, notificationId);

  if (result.count === 0) {
    throw new AppError('Notification not found', 404);
  }

  await invalidatePattern(CacheKeys.userPattern(userId));
  await deleteCache(CacheKeys.userCount(userId));

  return result;
}

async function syncAndQueueNotifications(userId) {
  await Log('backend', 'info', 'service', `Syncing notifications from AffordMed API for user ${userId}`);

  const rawNotifications = await fetchExternalNotifications();

  for (const raw of rawNotifications) {
    const typeName = raw.type || raw.notificationType || 'Event';
    const type = await ensureNotificationType(typeName);

    const notification = await upsertNotification(
      raw.id || raw._id || raw.externalId,
      type.id,
      raw.title,
      raw.message || raw.body || raw.description,
      raw.metadata || null
    );

    await upsertUserNotification(userId, notification.id);

    await createOutboxEvent('NOTIFICATION_CREATED', {
      userId,
      notificationId: notification.id,
      typeName,
    });

    await notificationQueue.add(
      'deliver-notification',
      { userId, notificationId: notification.id, typeName },
      {
        jobId: `${userId}-${notification.id}`,
        attempts: env.MAX_RETRIES,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    );
  }

  await invalidatePattern(CacheKeys.userPattern(userId));
  await deleteCache(CacheKeys.userCount(userId));

  await Log('backend', 'info', 'service', `Queued ${rawNotifications.length} notifications for user ${userId}`);

  return rawNotifications.length;
}

async function getPrioritizedTop10(userId) {
  const cacheKey = CacheKeys.prioritized(userId);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const raw = await fetchExternalNotifications();

  const enriched = raw.map((n) => ({
    ...n,
    type: { name: n.type || n.notificationType || 'Event' },
  }));

  const top10 = await applyPriorityAlgorithm(enriched, 10);

  await setCache(cacheKey, top10, env.CACHE_TTL_NOTIFICATIONS);

  return top10;
}

async function getStudentsWithPlacementNotifications(days = 7) {
  await Log('backend', 'info', 'service', `Fetching students with Placement notifications in last ${days} days`);
  return findStudentsWithPlacementLastNDays(days);
}

export {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  syncAndQueueNotifications,
  getPrioritizedTop10,
  getStudentsWithPlacementNotifications,
};