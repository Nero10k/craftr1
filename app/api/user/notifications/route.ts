import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const emailNotifications = Boolean(body.emailNotifications)
    const marketingEmails = Boolean(body.marketingEmails)
    const securityAlerts = Boolean(body.securityAlerts)

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        emailNotifications,
        marketingEmails,
        securityAlerts,
      },
    })

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
        marketingEmails: updatedUser.marketingEmails,
        securityAlerts: updatedUser.securityAlerts,
      },
    })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    )
  }
} 