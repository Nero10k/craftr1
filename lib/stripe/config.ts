import Stripe from 'stripe'

// Make sure we're using the correct environment variable
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Only initialize Stripe on the server side
let stripe: Stripe | undefined
if (typeof window === 'undefined' && stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  })
}

interface Plan {
  name: string
  description: string
  price: number
  features: string[]
  priceId?: string
}

export const PLANS: Record<'FREE' | 'PRO', Plan> = {
  FREE: {
    name: 'Free',
    description: 'Get started with basic features',
    price: 0,
    features: [
      'Explore the app',
      'Basic features',
      'Community access',
    ],
  },
  PRO: {
    name: 'Pro',
    description: 'Unlock all premium features',
    price: 59.95,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Access to all pro features',
      'Priority support',
      'No limitations',
    ],
  },
}

export function validateStripeWebhookRequest(body: string, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  if (!stripe) {
    throw new Error('Stripe is not properly initialized')
  }

  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}

// Export the initialized stripe instance
export { stripe } 