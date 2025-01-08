import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/db'
import { absoluteUrl } from '@/lib/utils'

const billingUrl = absoluteUrl('/billing')

export async function POST(req: Request) {
  try {
    if (!stripe) {
      throw new Error('Stripe is not properly configured')
    }

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { priceId } = await req.json()

    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      // Create a new customer if one doesn't exist
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      })

      customerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${billingUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&price_id=${priceId}`,
      cancel_url: `${billingUrl}?canceled=true`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    })

    return new NextResponse(JSON.stringify({ url: checkoutSession.url }))
  } catch (error) {
    console.error('Error in checkout:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 