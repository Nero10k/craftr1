'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    
    // Calculate the start and end dates
    let startDate: Date
    let endDate: Date

    if (fromDate && toDate) {
      // Custom date range
      startDate = new Date(fromDate)
      endDate = new Date(toDate)

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return new NextResponse('Invalid date format', { status: 400 })
      }

      if (startDate > endDate) {
        return new NextResponse('Start date must be before end date', { status: 400 })
      }
    } else {
      // Preset timeframe
      endDate = new Date()
      startDate = new Date()
      const days = parseInt(timeframe?.replace('d', '') || '30')
      startDate.setDate(startDate.getDate() - days)
    }

    // Calculate the previous period for comparisons
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousPeriodStart = new Date(startDate.getTime() - periodLength)
    const previousPeriodEnd = new Date(startDate)

    // Calculate interval based on period length
    const periodInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const interval = periodInDays <= 30 ? 'day' : 'month'

    // Get subscription prices from config
    const { PLANS } = await import('@/lib/stripe/config')

    // Fetch all user data in one query
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          lte: endDate // Include all users up to end date for total count
        }
      },
      select: {
        id: true,
        createdAt: true,
        stripeSubscriptionStatus: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true
      }
    })

    // Calculate all metrics from the single dataset
    const totalUsersCount = users.length
    const newUsers = users.filter(user => 
      user.createdAt >= startDate && user.createdAt <= endDate
    ).length

    const activeSubscribers = users.filter(user => 
      user.stripeSubscriptionStatus === 'active' && 
      user.createdAt <= endDate
    ).length

    const freeUsers = totalUsersCount - activeSubscribers

    // Calculate MRR
    const activeSubs = users.filter(user => 
      user.stripeSubscriptionStatus === 'active' && 
      user.createdAt <= endDate
    )
    const mrr = activeSubs.reduce((total, user) => {
      const plan = Object.values(PLANS).find(p => p.priceId === user.stripePriceId)
      return total + (plan?.price || 0)
    }, 0)

    // Calculate previous period MRR
    const previousSubs = users.filter(user => 
      user.stripeSubscriptionStatus === 'active' && 
      user.createdAt >= previousPeriodStart &&
      user.createdAt < previousPeriodEnd
    )
    const previousMrr = previousSubs.reduce((total, user) => {
      const plan = Object.values(PLANS).find(p => p.priceId === user.stripePriceId)
      return total + (plan?.price || 0)
    }, 0)

    // Calculate conversion metrics
    const periodSignups = users.filter(user => 
      user.createdAt >= startDate && 
      user.createdAt <= endDate
    ).length

    const periodConversions = users.filter(user => 
      user.createdAt >= startDate && 
      user.createdAt <= endDate && 
      user.stripeSubscriptionStatus === 'active'
    ).length

    // Calculate churn
    const churned = users.filter(user => 
      user.stripeSubscriptionStatus === null &&
      user.createdAt >= startDate &&
      user.createdAt <= endDate &&
      (
        (user.stripeCurrentPeriodEnd && 
         user.stripeCurrentPeriodEnd >= startDate && 
         user.stripeCurrentPeriodEnd < endDate) ||
        !user.stripeCurrentPeriodEnd
      )
    ).length

    const totalPreviousSubscribers = users.filter(user => 
      user.createdAt <= endDate &&
      user.stripeSubscriptionStatus !== null
    ).length

    // Calculate rates
    const revenueGrowth = previousMrr ? ((mrr - previousMrr) / previousMrr) * 100 : 0
    const conversionRate = periodSignups ? (periodConversions / periodSignups) * 100 : 0
    const churnRate = totalPreviousSubscribers ? (churned / totalPreviousSubscribers) * 100 : 0

    // Calculate retention
    const periodUsers = users.filter(user => 
      user.createdAt >= startDate && 
      user.createdAt <= endDate
    )
    const retainedUsers = periodUsers.filter(user => 
      user.stripeSubscriptionStatus === 'active'
    ).length
    const retentionRate = periodUsers.length ? (retainedUsers / periodUsers.length) * 100 : 0

    // Initialize time series data
    const userGrowth: Record<string, number> = {}
    const revenueByMonth: Record<string, number> = {}

    // Initialize all dates in range with 0
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const key = interval === 'day' 
        ? currentDate.toISOString().slice(0, 10)
        : currentDate.toISOString().slice(0, 7)
      
      userGrowth[key] = 0
      revenueByMonth[key] = 0

      if (interval === 'day') {
        currentDate.setDate(currentDate.getDate() + 1)
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    // Fill in actual data
    users.filter(user => user.createdAt >= startDate && user.createdAt <= endDate)
      .forEach(user => {
        const date = user.createdAt
        const key = interval === 'day' 
          ? date.toISOString().slice(0, 10)
          : date.toISOString().slice(0, 7)
        
        userGrowth[key] = (userGrowth[key] || 0) + 1

        if (user.stripeSubscriptionStatus === 'active' && user.stripePriceId) {
          const plan = Object.values(PLANS).find(p => p.priceId === user.stripePriceId)
          revenueByMonth[key] = (revenueByMonth[key] || 0) + (plan?.price || 0)
        }
      })

    return NextResponse.json({
      totalUsers: totalUsersCount,
      newUsers,
      activeSubscribers,
      freeUsers,
      mrr,
      revenueGrowth: revenueGrowth || 0,
      conversionRate: conversionRate || 0,
      churnRate: churnRate || 0,
      retentionRate: retentionRate || 0,
      userGrowth,
      revenueByMonth,
      period: {
        start: startDate,
        end: endDate,
        interval
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Error fetching analytics' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 