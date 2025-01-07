import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateStripeWebhookRequest } from '@/lib/stripe'
import { stripe } from '@/lib/stripe/config'
import type { Stripe } from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  try {
    const event = validateStripeWebhookRequest(body, signature)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0].price.id
        const status = subscription.status

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
        } as any)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

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
        } as any)
        break
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer
        const customerId = customer.id

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
        } as any)
        break
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
} 