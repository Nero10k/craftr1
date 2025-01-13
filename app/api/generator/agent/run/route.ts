import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { runAgent } from "@/lib/agent-runner"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Run the agent
    await runAgent()

    return new NextResponse("Agent run completed", { status: 200 })
  } catch (error) {
    console.error("[AGENT_RUN_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 