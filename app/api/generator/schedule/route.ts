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

    // Get user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get scheduled posts for user
    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("[SCHEDULE_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const { title, content, topic, scheduledFor } = await req.json()

    const post = await prisma.scheduledPost.create({
      data: {
        title,
        content,
        topic,
        scheduledFor,
        userId: user.id,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("[SCHEDULE_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 

