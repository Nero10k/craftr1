import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateStripeWebhookRequest } from '@/lib/stripe'
import { queueStripeWebhook } from '@/lib/queue/processors'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  try {
    const event = validateStripeWebhookRequest(body, signature)

    // Queue the webhook event for processing
    await queueStripeWebhook(event)

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
} 