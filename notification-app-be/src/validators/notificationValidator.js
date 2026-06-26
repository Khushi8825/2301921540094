import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const markReadSchema = z.object({
  notificationId: z.string().uuid(),
});

const markAllReadSchema = z.object({
  typeFilter: z.enum(['Placement', 'Result', 'Event']).optional(),
});

export { paginationSchema, markReadSchema, markAllReadSchema };