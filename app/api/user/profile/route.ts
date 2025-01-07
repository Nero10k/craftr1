import { requireAuthApi } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await requireAuthApi(req)
  if (session instanceof Response) return session // Handle unauthorized case

  // Get user's full profile from database with optimized field selection
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      // Only select fields that are actually used in the UI
      // Removed unused fields to optimize query performance
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
} 