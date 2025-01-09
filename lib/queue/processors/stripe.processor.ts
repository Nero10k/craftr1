import { Job } from 'bull';
import { stripeWebhookQueue } from '../config';
import { prisma } from '@/lib/db';
import type { Stripe } from 'stripe';

interface StripeWebhookJobData {
  event: Stripe.Event;
}

// Process Stripe webhook jobs
stripeWebhookQueue.process(async (job: Job<StripeWebhookJobData>) => {
  try {
    const { event } = job.data;

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'customer.deleted':
        await handleCustomerDeleted(event);
        break;
      // Add more event types as needed
    }

    job.progress(100);
    return { success: true, message: 'Stripe webhook processed successfully' };
  } catch (error) {
    console.error('Error processing Stripe webhook job:', error);
    throw error;
  }
});

// Helper function to add Stripe webhook jobs to the queue
export const queueStripeWebhook = async (event: Stripe.Event) => {
  try {
    const job = await stripeWebhookQueue.add(
      { event },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      }
    );

    return job;
  } catch (error) {
    console.error('Error queuing Stripe webhook:', error);
    throw error;
  }
};

// Event handlers
async function handleSubscriptionChange(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;
  const status = subscription.status;

  // Update user's subscription status
  await prisma.user.update({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      stripePriceId: priceId,
      stripeSubscriptionStatus: status,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  } as any);

  console.log('Subscription updated:', {
    customerId,
    priceId,
    status,
    currentPeriodEnd: subscription.current_period_end,
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Remove user's subscription status
  await prisma.user.update({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      stripePriceId: null,
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
    },
  } as any);

  console.log('Subscription deleted:', { customerId });
}

async function handleCustomerDeleted(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  const customerId = customer.id;

  // Remove Stripe info from user
  await prisma.user.update({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      stripeCustomerId: null,
      stripePriceId: null,
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
    },
  } as any);

  console.log('Customer deleted:', { customerId });
} 