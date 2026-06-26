import { Queue } from 'bullmq';
// import redis from '../config/redis.js';
import env from '../config/Env.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

const queueOptions = {
  
  defaultJobOptions: {
    attempts: env.MAX_RETRIES,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
};

const notificationQueue = new Queue(env.NOTIFICATION_QUEUE_NAME, queueOptions);

const dlq = new Queue(env.DLQ_NAME);

notificationQueue.on('error', async (err) => {
  await Log('backend', 'error', 'handler', `Notification queue error: ${err.message}`);
});

async function addToQueue(jobName, data, options = {}) {
  const job = await notificationQueue.add(jobName, data, {
    jobId: options.jobId,
    attempts: options.attempts || env.MAX_RETRIES,
    backoff: { type: 'exponential', delay: 2000 },
    ...options,
  });

  await Log('backend', 'info', 'service', `Job enqueued: ${jobName} id=${job.id}`);
  return job;
}

async function addToDLQ(jobData, reason) {
  await dlq.add('failed-notification', { ...jobData, failureReason: reason, failedAt: new Date().toISOString() });
  await Log('backend', 'warn', 'service', `Job moved to DLQ: ${JSON.stringify(jobData)} reason=${reason}`);
}

export { notificationQueue, dlq, addToQueue, addToDLQ };