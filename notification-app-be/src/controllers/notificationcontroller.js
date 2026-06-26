import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  syncAndQueueNotifications,
  getPrioritizedTop10,
  getStudentsWithPlacementNotifications,
} from '../services/notificationservice.js';
import { sendSuccess, buildPaginationMeta } from '../utils/response.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function listNotificationsController(req, res, next) {
  try {
    const { page, limit } = req.query;
    const userId = req.user.userId;
    const { data, total } = await getNotifications(userId, page, limit);
    await Log('backend', 'info', 'controller', `Listed notifications for user ${userId} page=${page}`);
    return sendSuccess(res, data, 200, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

async function unreadNotificationsController(req, res, next) {
  try {
    const { page, limit } = req.query;
    const userId = req.user.userId;
    const { data, total } = await getUnreadNotifications(userId, page, limit);
    await Log('backend', 'info', 'controller', `Fetched unread for user ${userId}`);
    return sendSuccess(res, data, 200, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

async function unreadCountController(req, res, next) {
  try {
    const userId = req.user.userId;
    const count = await getUnreadCount(userId);
    return sendSuccess(res, { count });
  } catch (err) {
    next(err);
  }
}

async function markReadController(req, res, next) {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;
    await markAsRead(userId, notificationId);
    await Log('backend', 'info', 'controller', `Marked read: ${notificationId} user=${userId}`);
    return sendSuccess(res, { message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markAllReadController(req, res, next) {
  try {
    const userId = req.user.userId;
    const { typeFilter } = req.query;
    const result = await markAllRead(userId, typeFilter);
    await Log('backend', 'info', 'controller', `Marked all read for user ${userId} count=${result.count}`);
    return sendSuccess(res, { message: `${result.count} notifications marked as read` });
  } catch (err) {
    next(err);
  }
}

async function deleteNotificationController(req, res, next) {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;
    await deleteNotification(userId, notificationId);
    await Log('backend', 'info', 'controller', `Deleted notification ${notificationId} for user ${userId}`);
    return sendSuccess(res, { message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
}

async function syncNotificationsController(req, res, next) {
  try {
    const userId = req.user.userId;
    const count = await syncAndQueueNotifications(userId);
    await Log('backend', 'info', 'controller', `Sync triggered for user ${userId}: ${count} notifications`);
    return sendSuccess(res, { message: `${count} notifications synced and queued` });
  } catch (err) {
    next(err);
  }
}

async function prioritizedTop10Controller(req, res, next) {
  try {
    const userId = req.user.userId;
    const top10 = await getPrioritizedTop10(userId);
    await Log('backend', 'info', 'controller', `Prioritized top10 fetched for user ${userId}`);
    return sendSuccess(res, top10);
  } catch (err) {
    next(err);
  }
}

async function placementStudentsController(req, res, next) {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const students = await getStudentsWithPlacementNotifications(days);
    await Log('backend', 'info', 'controller', `Placement students query: ${students.length} results last ${days} days`);
    return sendSuccess(res, students);
  } catch (err) {
    next(err);
  }
}

export {
  listNotificationsController,
  unreadNotificationsController,
  unreadCountController,
  markReadController,
  markAllReadController,
  deleteNotificationController,
  syncNotificationsController,
  prioritizedTop10Controller,
  placementStudentsController,
};