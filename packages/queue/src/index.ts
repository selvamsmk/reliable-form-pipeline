import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import type { SubmissionJob } from './types';

// Resolve Redis URL:
// 1) Use explicit REDIS_URL env if present
// 2) If running inside Docker Compose (COMPOSE_PROJECT_NAME present), default to the compose service hostname
// 3) Otherwise default to localhost
const defaultRedis = process.env.COMPOSE_PROJECT_NAME ? 'redis:6379' : '127.0.0.1:6379';
const REDIS_URL = process.env.REDIS_URL ?? `redis://${defaultRedis}`;

const connection = new IORedis(REDIS_URL);

export const submissionQueueName = 'submissionQueue';

export const submissionQueue = new Queue<SubmissionJob>(submissionQueueName, { connection });

export async function enqueueSubmission(job: SubmissionJob) {
  return submissionQueue.add('submission', job, { removeOnComplete: true, removeOnFail: false });
}

export type SubmissionProcessor = (job: Job<SubmissionJob>) => Promise<void> | void;

export function processSubmission(processor: SubmissionProcessor, concurrency = 1) {
  // Worker will process jobs and keep running
  const worker = new Worker<SubmissionJob>(submissionQueueName, async (job) => {
    return processor(job as Job<SubmissionJob>);
  }, { connection, concurrency });

  worker.on('error', (err) => console.error('Queue worker error', err));

  return worker;
}

export default {
  submissionQueue,
  enqueueSubmission,
  processSubmission,
};
console.log('queue package: loaded');
