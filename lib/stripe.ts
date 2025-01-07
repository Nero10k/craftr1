import { Stripe, loadStripe } from '@stripe/stripe-js'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/config'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export const createCheckoutSession = async ({
  priceId,
  successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
  cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=false`,
}: {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    })

    return { sessionId: session.id }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const createBillingPortalSession = async (customerId: string) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw error
  }
}

export const stripe_webhook_secret = process.env.STRIPE_WEBHOOK_SECRET!

export const validateStripeWebhookRequest = (
  body: string,
  signature: string,
) => {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      stripe_webhook_secret,
    )
  } catch (error) {
    console.error('Error validating webhook:', error)
    throw error
  }
} 