'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get users who registered in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Get active paying users (with active subscription)
    const activeSubscribers = await prisma.user.count({
      where: {
        stripeSubscriptionStatus: 'active'
      }
    })

    // Get free users (no subscription or cancelled)
    const freeUsers = totalUsers - activeSubscribers

    // Calculate MRR from active subscriptions
    const activeSubscriptions = await prisma.user.findMany({
      where: {
        stripeSubscriptionStatus: 'active'
      },
      select: {
        stripePriceId: true
      }
    })

    // Get subscription prices from config
    const { PLANS } = await import('@/lib/stripe/config')
    
    const mrr = activeSubscriptions.reduce((total, user) => {
      const plan = Object.values(PLANS).find(p => p.priceId === user.stripePriceId)
      return total + (plan?.price || 0)
    }, 0)

    // Get user growth by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    // Get all users created in last 6 months
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group users by month manually
    const userGrowth = users.reduce((acc, user) => {
      const month = user.createdAt.toISOString().slice(0, 7) // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalUsers,
      newUsers,
      activeSubscribers,
      freeUsers,
      mrr,
      userGrowth,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return new NextResponse('Error fetching analytics', { status: 500 })
  }
} 