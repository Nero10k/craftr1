import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/db'
import { absoluteUrl } from '@/lib/utils'

const billingUrl = absoluteUrl('/billing')

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (!user.stripeCustomerId) {
      return new NextResponse('No billing history', { status: 400 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: billingUrl,
    })

    return new NextResponse(JSON.stringify({ url: portalSession.url }))
  } catch (error) {
    console.error('Error in billing portal:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 