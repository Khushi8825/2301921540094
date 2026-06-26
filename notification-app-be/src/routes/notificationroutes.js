import { Router } from 'express';
import {
  listNotificationsController,
  unreadNotificationsController,
  unreadCountController,
  markReadController,
  markAllReadController,
  deleteNotificationController,
  syncNotificationsController,
  prioritizedTop10Controller,
  placementStudentsController,
} from '../controllers/notificationcontroller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationSchema, markAllReadSchema } from '../validators/notificationValidator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(paginationSchema, 'query'), listNotificationsController);

router.get('/unread', validate(paginationSchema, 'query'), unreadNotificationsController);

router.get('/count', unreadCountController);

router.get('/top10', prioritizedTop10Controller);

router.post('/sync', syncNotificationsController);

router.patch('/:notificationId/read', markReadController);

router.patch('/read-all', validate(markAllReadSchema, 'query'), markAllReadController);

router.delete('/:notificationId', deleteNotificationController);

router.get('/admin/placement-students', placementStudentsController);

export default router;