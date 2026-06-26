import prisma from '../config/database.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function findUserNotificationsPaginated(userId, page, limit) {
  const skip = (page - 1) * limit;

  await Log('backend', 'debug', 'repository', `Fetching notifications for user ${userId} page=${page}`);

  const [data, total] = await prisma.$transaction([
    prisma.userNotification.findMany({
      where: { userId },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
            externalId: true,
            type: { select: { name: true, priority: true } },
          },
        },
      },
      orderBy: { deliveredAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userNotification.count({ where: { userId } }),
  ]);

  return { data, total };
}

async function findUnreadNotifications(userId, page, limit) {
  const skip = (page - 1) * limit;

  await Log('backend', 'debug', 'repository', `Fetching unread notifications for user ${userId}`);

  const [data, total] = await prisma.$transaction([
    prisma.userNotification.findMany({
      where: { userId, isRead: false },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
            type: { select: { name: true, priority: true } },
          },
        },
      },
      orderBy: { deliveredAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userNotification.count({ where: { userId, isRead: false } }),
  ]);

  return { data, total };
}

async function countUnreadNotifications(userId) {
  await Log('backend', 'debug', 'repository', `Counting unread for user ${userId}`);
  return prisma.userNotification.count({ where: { userId, isRead: false } });
}

async function markNotificationRead(userId, notificationId) {
  await Log('backend', 'info', 'repository', `Marking notification ${notificationId} read for user ${userId}`);

  return prisma.userNotification.updateMany({
    where: { userId, notificationId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

async function markAllNotificationsRead(userId, typeFilter) {
  await Log('backend', 'info', 'repository', `Marking all notifications read for user ${userId} type=${typeFilter || 'all'}`);

  const where = { userId, isRead: false };

  if (typeFilter) {
    where.notification = { type: { name: typeFilter } };
  }

  return prisma.userNotification.updateMany({
    where,
    data: { isRead: true, readAt: new Date() },
  });
}

async function deleteUserNotification(userId, notificationId) {
  await Log('backend', 'info', 'repository', `Deleting notification ${notificationId} for user ${userId}`);

  return prisma.userNotification.deleteMany({
    where: { userId, notificationId },
  });
}

async function upsertNotification(externalId, typeId, title, message, metadata) {
  await Log('backend', 'debug', 'repository', `Upserting notification externalId=${externalId}`);

  return prisma.notification.upsert({
    where: { externalId },
    update: {},
    create: { externalId, typeId, title, message, metadata },
  });
}

async function upsertUserNotification(userId, notificationId) {
  return prisma.userNotification.upsert({
    where: { userId_notificationId: { userId, notificationId } },
    update: {},
    create: { userId, notificationId },
  });
}

async function findNotificationType(name) {
  return prisma.notificationType.findUnique({ where: { name } });
}

async function createNotificationType(name, priority) {
  return prisma.notificationType.upsert({
    where: { name },
    update: {},
    create: { name, priority },
  });
}

async function createOutboxEvent(eventType, payload) {
  await Log('backend', 'debug', 'repository', `Creating outbox event: ${eventType}`);
  return prisma.outboxEvent.create({
    data: { eventType, payload },
  });
}

async function findStudentsWithPlacementLastNDays(days) {
  await Log('backend', 'info', 'repository', `Finding students with Placement notifications in last ${days} days`);

  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.$queryRaw`
    SELECT DISTINCT
      u.id,
      u.name,
      u.email,
      u.roll_no,
      MIN(un.delivered_at) AS first_received_at
    FROM users u
    INNER JOIN user_notifications un ON un.user_id = u.id
    INNER JOIN notifications n ON n.id = un.notification_id
    INNER JOIN notification_types nt ON nt.id = n.type_id
    WHERE nt.name = 'Placement'
      AND un.delivered_at >= ${since}
    GROUP BY u.id, u.name, u.email, u.roll_no
    ORDER BY first_received_at DESC
  `;
}

export {
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
};