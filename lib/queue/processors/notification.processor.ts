import { Job } from 'bull';
import { notificationQueue } from '../config';

interface NotificationJobData {
  userId: string;
  type: 'email' | 'push' | 'in_app';
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Process notification jobs
notificationQueue.process(async (job: Job<NotificationJobData>) => {
  try {
    const { userId, type, title, message, data } = job.data;

    // Handle different notification types
    switch (type) {
      case 'email':
        await handleEmailNotification(userId, title, message, data);
        break;
      case 'push':
        await handlePushNotification(userId, title, message, data);
        break;
      case 'in_app':
        await handleInAppNotification(userId, title, message, data);
        break;
    }

    job.progress(100);
    return { success: true, message: 'Notification processed successfully' };
  } catch (error) {
    console.error('Error processing notification job:', error);
    throw error;
  }
});

// Helper function to add notification jobs to the queue
export const queueNotification = async (notificationData: NotificationJobData) => {
  try {
    const job = await notificationQueue.add(notificationData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    });

    return job;
  } catch (error) {
    console.error('Error queuing notification:', error);
    throw error;
  }
};

// Notification handlers
async function handleEmailNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  console.log('Processing email notification:', {
    userId,
    title,
    message,
    data,
  });
  // Implement your email notification logic here
}

async function handlePushNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  console.log('Processing push notification:', {
    userId,
    title,
    message,
    data,
  });
  // Implement your push notification logic here (e.g., using web push or mobile push)
}

async function handleInAppNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  console.log('Processing in-app notification:', {
    userId,
    title,
    message,
    data,
  });
  // Implement your in-app notification logic here (e.g., storing in database)
} 