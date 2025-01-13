import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error("[AGENT_STATS_ERROR] No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        agent: true,
        scheduledPosts: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!user) {
      console.error("[AGENT_STATS_ERROR] User not found:", session.user.email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate agent metrics
    const totalPosts = user.scheduledPosts.length
    const postsPerDay = totalPosts / 30

    // Get agent status and settings
    const agentStatus = {
      isActive: user.agent?.isActive || false,
      lastRun: user.agent?.lastRun || null,
      nextRun: user.agent?.nextRun || null,
      frequency: user.agent?.frequency || null,
      topics: user.agent?.topics || [],
    }

    // Calculate topics distribution
    const topicsDistribution = user.scheduledPosts.reduce((acc: Record<string, number>, post) => {
      const topic = post.topic || 'Uncategorized'
      acc[topic] = (acc[topic] || 0) + 1
      return acc
    }, {})

    // Calculate daily post distribution
    const dailyDistribution: Record<string, number> = {}
    
    // Initialize all days in the last 30 days
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyDistribution[dateStr] = 0
    }

    // Fill in actual post counts
    user.scheduledPosts.forEach(post => {
      const date = post.createdAt.toISOString().split('T')[0]
      if (dailyDistribution.hasOwnProperty(date)) {
        dailyDistribution[date]++
      }
    })

    const response = {
      agentStatus,
      metrics: {
        totalPosts,
        postsPerDay,
        topicsDistribution,
        dailyDistribution
      }
    }

    console.log("[AGENT_STATS_SUCCESS] Stats generated for user:", session.user.email)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[AGENT_STATS_ERROR] Detailed error:", error)
    return NextResponse.json(
      { error: "Something went wrong while fetching agent stats" },
      { status: 500 }
    )
  }
} 