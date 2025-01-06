import { requireAuthApi } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await requireAuthApi(req)
  if (session instanceof Response) return session // Handle unauthorized case

  // Get user's full profile from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user })
} 