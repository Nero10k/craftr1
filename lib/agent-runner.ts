import { PrismaClient } from "@prisma/client"
import { publishToLinkedIn } from "@/lib/linkedin"

const prisma = new PrismaClient()

export async function runAgent() {
  try {
    // Get active agents with their settings
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true
      },
      include: {
        user: true
      }
    })

    for (const agent of agents) {
      // Generate content based on agent settings
      const content = await generateContent(agent)
      
      // Schedule the post
      const scheduledPost = await prisma.scheduledPost.create({
        data: {
          userId: agent.userId,
          title: content.title,
          content: content.body,
          topic: content.topic,
          scheduledFor: calculateNextPostTime(agent.frequency),
          publishedToLinkedIn: false
        }
      })

      // If LinkedIn is enabled, attempt to post
      const linkedinCredentials = await prisma.agent.findUnique({
        where: { id: agent.id },
        select: {
          linkedinClientId: true,
          linkedinClientSecret: true,
          linkedinAccessToken: true,
          linkedinOrganizationId: true
        }
      })

      if (linkedinCredentials?.linkedinAccessToken) {
        try {
          const linkedinPostId = await publishToLinkedIn({
            accessToken: linkedinCredentials.linkedinAccessToken,
            organizationId: linkedinCredentials.linkedinOrganizationId!,
            content: content.body,
            title: content.title
          })

          // Update post with LinkedIn status
          await prisma.scheduledPost.update({
            where: { id: scheduledPost.id },
            data: {
              publishedToLinkedIn: true,
              linkedinPostId
            }
          })
        } catch (error) {
          console.error("[LINKEDIN_PUBLISH_ERROR]", error)
          await prisma.scheduledPost.update({
            where: { id: scheduledPost.id },
            data: {
              linkedinPublishError: error instanceof Error ? error.message : "Failed to post to LinkedIn"
            }
          })
        }
      }

      // Update agent's last run time
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          lastRun: new Date(),
          nextRun: calculateNextRunTime(agent.frequency)
        }
      })
    }
  } catch (error) {
    console.error("[AGENT_RUN_ERROR]", error)
    throw error
  }
}

function calculateNextPostTime(frequency: string): Date {
  const now = new Date()
  switch (frequency) {
    case "daily":
      return new Date(now.setDate(now.getDate() + 1))
    case "weekly":
      return new Date(now.setDate(now.getDate() + 7))
    case "biweekly":
      return new Date(now.setDate(now.getDate() + 14))
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1))
    default:
      return new Date(now.setDate(now.getDate() + 1))
  }
}

function calculateNextRunTime(frequency: string): Date {
  return calculateNextPostTime(frequency)
}

async function generateContent(agent: any) {
  // Implement content generation logic based on agent settings
  // This would typically use OpenAI or another AI service
  return {
    title: "Sample Post Title",
    body: "Sample post content based on agent settings",
    topic: agent.topics[0]
  }
} 
} 