import { prisma } from "@/lib/db"
import { publishToLinkedIn, getPostAnalytics } from "@/lib/linkedin"

export async function processLinkedInQueue() {
  try {
    // Get all posts that are scheduled and not yet published to LinkedIn
    const posts = await prisma.scheduledPost.findMany({
      where: {
        scheduledFor: {
          lte: new Date(), // Posts scheduled for now or earlier
        },
        publishedToLinkedIn: false,
        linkedinPublishError: null,
      },
      include: {
        user: {
          include: {
            agent: true,
          }
        }
      }
    })

    for (const post of posts) {
      try {
        // Skip if user doesn't have LinkedIn credentials
        if (!post.user.agent?.linkedinAccessToken || !post.user.agent?.linkedinOrganizationId) {
          continue
        }

        // Publish to LinkedIn
        const linkedinPostId = await publishToLinkedIn(
          post.content,
          {
            accessToken: post.user.agent.linkedinAccessToken,
            organizationId: post.user.agent.linkedinOrganizationId,
          }
        )

        // Update post with LinkedIn ID
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            linkedinPostId,
            publishedToLinkedIn: true,
          }
        })

        // Wait a few seconds for LinkedIn to process the post
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Get initial analytics
        const analytics = await getPostAnalytics(linkedinPostId, {
          accessToken: post.user.agent.linkedinAccessToken,
          organizationId: post.user.agent.linkedinOrganizationId,
        })

        // Create analytics record
        await prisma.linkedinAnalytics.create({
          data: {
            postId: post.id,
            ...analytics,
          }
        })

      } catch (error) {
        console.error(`Failed to publish post ${post.id} to LinkedIn:`, error)
        
        // Update post with error
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            linkedinPublishError: error instanceof Error ? error.message : "Failed to publish to LinkedIn"
          }
        })
      }
    }
  } catch (error) {
    console.error("LinkedIn publisher job error:", error)
  }
}

export async function updateLinkedInAnalytics() {
  try {
    // Get all posts with LinkedIn IDs that were published in the last 30 days
    const posts = await prisma.scheduledPost.findMany({
      where: {
        publishedToLinkedIn: true,
        linkedinPostId: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        user: {
          include: {
            agent: true,
          }
        },
        linkedinAnalytics: true,
      }
    })

    for (const post of posts) {
      try {
        if (!post.linkedinPostId || !post.user.agent?.linkedinAccessToken || !post.user.agent?.linkedinOrganizationId) {
          continue
        }

        // Get updated analytics
        const analytics = await getPostAnalytics(post.linkedinPostId, {
          accessToken: post.user.agent.linkedinAccessToken,
          organizationId: post.user.agent.linkedinOrganizationId,
        })

        // Update analytics record
        await prisma.linkedinAnalytics.update({
          where: { postId: post.id },
          data: {
            ...analytics,
            lastUpdated: new Date(),
          }
        })

      } catch (error) {
        console.error(`Failed to update analytics for post ${post.id}:`, error)
      }
    }
  } catch (error) {
    console.error("LinkedIn analytics update job error:", error)
  }
} 