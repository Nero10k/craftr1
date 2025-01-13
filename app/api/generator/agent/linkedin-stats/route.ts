import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error("[LINKEDIN_STATS_ERROR] No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        scheduledPosts: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              NOT: {
                linkedinAnalytics: null
              }
            }
          },
          include: {
            linkedinAnalytics: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      console.error("[LINKEDIN_STATS_ERROR] User not found:", session.user.email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate total metrics
    const totalViews = user.scheduledPosts.reduce((sum, post) => sum + (post.linkedinAnalytics?.views || 0), 0)
    const totalLikes = user.scheduledPosts.reduce((sum, post) => sum + (post.linkedinAnalytics?.likes || 0), 0)
    const totalComments = user.scheduledPosts.reduce((sum, post) => sum + (post.linkedinAnalytics?.comments || 0), 0)
    const totalShares = user.scheduledPosts.reduce((sum, post) => sum + (post.linkedinAnalytics?.shares || 0), 0)
    const totalImpressions = user.scheduledPosts.reduce((sum, post) => sum + (post.linkedinAnalytics?.impressions || 0), 0)

    // Calculate averages
    const postsWithAnalytics = user.scheduledPosts.filter(post => post.linkedinAnalytics)
    const postCount = postsWithAnalytics.length
    const avgEngagementRate = postCount > 0
      ? postsWithAnalytics.reduce((sum, post) => sum + (post.linkedinAnalytics?.engagementRate || 0), 0) / postCount
      : 0
    const avgClickThroughRate = postCount > 0
      ? postsWithAnalytics.reduce((sum, post) => sum + (post.linkedinAnalytics?.clickThroughRate || 0), 0) / postCount
      : 0

    // Calculate daily engagement distribution
    const dailyEngagement: Record<string, { views: number; likes: number; comments: number; shares: number }> = {}
    
    // Initialize all days in the last 30 days
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyEngagement[dateStr] = { views: 0, likes: 0, comments: 0, shares: 0 }
    }

    // Fill in actual engagement data
    user.scheduledPosts.forEach(post => {
      if (post.linkedinAnalytics) {
        const date = post.createdAt.toISOString().split('T')[0]
        if (dailyEngagement[date]) {
          dailyEngagement[date].views += post.linkedinAnalytics.views
          dailyEngagement[date].likes += post.linkedinAnalytics.likes
          dailyEngagement[date].comments += post.linkedinAnalytics.comments
          dailyEngagement[date].shares += post.linkedinAnalytics.shares
        }
      }
    })

    // Get top performing posts
    const topPosts = user.scheduledPosts
      .filter(post => post.linkedinAnalytics)
      .sort((a, b) => {
        const aEngagement = (a.linkedinAnalytics?.likes || 0) + (a.linkedinAnalytics?.comments || 0) * 2 + (a.linkedinAnalytics?.shares || 0) * 3
        const bEngagement = (b.linkedinAnalytics?.likes || 0) + (b.linkedinAnalytics?.comments || 0) * 2 + (b.linkedinAnalytics?.shares || 0) * 3
        return bEngagement - aEngagement
      })
      .slice(0, 5)
      .map(post => ({
        title: post.title,
        topic: post.topic,
        metrics: post.linkedinAnalytics
      }))

    const response = {
      overview: {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        totalImpressions,
        avgEngagementRate,
        avgClickThroughRate,
        postCount
      },
      dailyEngagement,
      topPosts
    }

    console.log("[LINKEDIN_STATS_SUCCESS] Stats generated for user:", session.user.email)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[LINKEDIN_STATS_ERROR] Detailed error:", error)
    return NextResponse.json(
      { error: "Something went wrong while fetching LinkedIn stats" },
      { status: 500 }
    )
  }
} 