import { NextResponse } from "next/server"
import { processLinkedInQueue, updateLinkedInAnalytics } from "@/lib/jobs/linkedin-publisher"

// This endpoint should be called by a cron job service (e.g., Vercel Cron)
export async function GET(req: Request) {
  try {
    // Verify the request is from our cron service
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Process the LinkedIn queue (publish pending posts)
    await processLinkedInQueue()
    
    // Update analytics for existing posts
    await updateLinkedInAnalytics()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LINKEDIN_CRON_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to process LinkedIn tasks" },
      { status: 500 }
    )
  }
} 