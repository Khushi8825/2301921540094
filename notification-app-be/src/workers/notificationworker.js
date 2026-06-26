import { Worker } from 'bullmq';
import 'dotenv/config';
import redis from '../config/redis.js';
import prisma from '../config/database.js';
import env from '../config/Env.js';
import { addToDLQ } from '../queues/notificationqueue.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function processNotificationJob(job) {
  const { userId, notificationId, typeName } = job.data;

  await Log('backend', 'info', 'service', `Worker processing job ${job.id}: user=${userId} notification=${notificationId}`);

  const existing = await prisma.notificationJob.findFirst({
    where: { notificationId, userId, status: 'completed' },
  });

  if (existing) {
    await Log('backend', 'info', 'service', `Job ${job.id} already completed (idempotent skip)`);
    return { skipped: true, reason: 'already-processed' };
  }

  const jobRecord = await prisma.notificationJob.upsert({
    where: { jobId: job.id },
    update: { attempts: { increment: 1 }, status: 'processing' },
    create: { jobId: job.id, notificationId, userId, status: 'processing', attempts: 1 },
  });

  try {
    await simulateEmailDelivery(userId, notificationId, typeName);

    await simulatePushDelivery(userId, notificationId, typeName);

    await prisma.notificationJob.update({
      where: { id: jobRecord.id },
      data: { status: 'completed' },
    });

    await prisma.outboxEvent.updateMany({
      where: {
        eventType: 'NOTIFICATION_CREATED',
        processed: false,
        payload: { path: ['notificationId'], equals: notificationId },
      },
      data: { processed: true, processedAt: new Date() },
    });

    await Log('backend', 'info', 'service', `Job ${job.id} completed successfully`);
    return { success: true };
  } catch (err) {
    await prisma.notificationJob.update({
      where: { id: jobRecord.id },
      data: { status: 'failed', lastError: err.message },
    });

    await Log('backend', 'error', 'service', `Job ${job.id} failed: ${err.message}`);
    throw err;
  }
}

async function simulateEmailDelivery(userId, notificationId, typeName) {
  await Log('backend', 'debug', 'service', `Email delivery: user=${userId} notification=${notificationId} type=${typeName}`);
}

async function simulatePushDelivery(userId, notificationId, typeName) {
  await Log('backend', 'debug', 'service', `Push delivery: user=${userId} notification=${notificationId} type=${typeName}`);
}

const worker = new Worker(
  env.NOTIFICATION_QUEUE_NAME,
  processNotificationJob,
  {
    connection: redis,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

worker.on('completed', async (job, result) => {
  await Log('backend', 'info', 'service', `Worker: job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  await Log('backend', 'error', 'service', `Worker: job ${job.id} failed attempt ${job.attemptsMade}/${env.MAX_RETRIES}: ${err.message}`);

  if (job.attemptsMade >= env.MAX_RETRIES) {
    await addToDLQ(job.data, err.message);
    await Log('backend', 'warn', 'service', `Job ${job.id} exhausted retries, moved to DLQ`);
  }
});

worker.on('error', async (err) => {
  await Log('backend', 'error', 'handler', `Worker error: ${err.message}`);
});

export { worker };