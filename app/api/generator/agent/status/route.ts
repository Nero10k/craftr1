import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        agent: true,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json({
      isRunning: user.agent?.isActive || false,
      settings: user.agent || null,
    })
  } catch (error) {
    console.error("[AGENT_STATUS_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 