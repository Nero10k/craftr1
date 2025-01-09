import { Job } from 'bull';
import { emailQueue } from '../config';

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Process email jobs
emailQueue.process(async (job: Job<EmailJobData>) => {
  try {
    const { to, subject, html, text } = job.data;
    
    // Here you would integrate with your email service (e.g., Resend, SendGrid, etc.)
    // For now, we'll just log the email data
    console.log('Processing email job:', {
      to,
      subject,
      html,
      text,
    });

    // Example of how to handle progress
    job.progress(100);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error processing email job:', error);
    throw error;
  }
});

// Helper function to add email jobs to the queue
export const queueEmail = async (emailData: EmailJobData) => {
  try {
    const job = await emailQueue.add(emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    });

    return job;
  } catch (error) {
    console.error('Error queuing email:', error);
    throw error;
  }
}; 