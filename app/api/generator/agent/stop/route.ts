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

    // Update agent to inactive
    const agent = await prisma.agent.update({
      where: { userId: user.id },
      data: {
        isActive: false,
        nextRun: null,
      },
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error("[AGENT_STOP_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 