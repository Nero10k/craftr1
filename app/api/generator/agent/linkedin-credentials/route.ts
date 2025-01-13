import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const linkedinCredentialsSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  accessToken: z.string().min(1),
  organizationId: z.string().min(1),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        agent: {
          select: {
            linkedinClientId: true,
            linkedinClientSecret: true,
            linkedinAccessToken: true,
            linkedinOrganizationId: true,
          }
        }
      }
    })

    if (!user?.agent) {
      return NextResponse.json({ credentials: null })
    }

    return NextResponse.json({
      credentials: {
        clientId: user.agent.linkedinClientId || "",
        clientSecret: user.agent.linkedinClientSecret || "",
        accessToken: user.agent.linkedinAccessToken || "",
        organizationId: user.agent.linkedinOrganizationId || "",
      }
    })
  } catch (error) {
    console.error("[LINKEDIN_CREDENTIALS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch LinkedIn credentials" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = linkedinCredentialsSchema.parse(body)

    // Test the LinkedIn connection
    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/organizations/${validatedData.organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${validatedData.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Invalid LinkedIn credentials")
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to verify LinkedIn credentials" },
        { status: 400 }
      )
    }

    // Update or create agent with LinkedIn credentials
    await prisma.agent.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        linkedinClientId: validatedData.clientId,
        linkedinClientSecret: validatedData.clientSecret,
        linkedinAccessToken: validatedData.accessToken,
        linkedinOrganizationId: validatedData.organizationId,
        frequency: "daily", // Default values for required fields
        topics: [],
        tone: "professional",
        ageGroup: "adult",
        language: "en",
        guidelines: "",
      },
      update: {
        linkedinClientId: validatedData.clientId,
        linkedinClientSecret: validatedData.clientSecret,
        linkedinAccessToken: validatedData.accessToken,
        linkedinOrganizationId: validatedData.organizationId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LINKEDIN_CREDENTIALS_POST_ERROR]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to save LinkedIn credentials" },
      { status: 500 }
    )
  }
} 