import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const body = await req.json()
    const { frequency, topics, tone, ageGroup, language, guidelines } = body

    // Create or update agent settings
    const agent = await prisma.agent.upsert({
      where: { userId: user.id },
      update: {
        frequency,
        topics,
        tone,
        ageGroup,
        language,
        guidelines,
        isActive: true,
        lastRun: null,
        nextRun: new Date(), // Will be updated by the agent runner
      },
      create: {
        userId: user.id,
        frequency,
        topics,
        tone,
        ageGroup,
        language,
        guidelines,
        isActive: true,
        lastRun: null,
        nextRun: new Date(),
      },
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error("[AGENT_START_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 