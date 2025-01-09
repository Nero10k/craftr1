import Queue from 'bull';

// Redis connection configuration from Upstash
const redisConfig = {
  redis: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
};

// Define queue names as constants
export const QUEUE_NAMES = {
  EMAIL: 'email',
  STRIPE_WEBHOOK: 'stripe-webhook',
  NOTIFICATION: 'notification',
} as const;

// Create queues
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, redisConfig);
export const stripeWebhookQueue = new Queue(QUEUE_NAMES.STRIPE_WEBHOOK, redisConfig);
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, redisConfig);

// Global error handlers for all queues
const queues = [emailQueue, stripeWebhookQueue, notificationQueue];

queues.forEach((queue) => {
  queue.on('error', (error) => {
    console.error(`Queue ${queue.name} error:`, error);
  });

  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} in ${queue.name} failed:`, error);
  });
});

export const getQueues = () => queues; 