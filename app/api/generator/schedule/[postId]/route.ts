import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { scheduledFor } = await request.json()

    // Verify the post belongs to the user
    const post = await prisma.scheduledPost.findUnique({
      where: {
        id: params.postId,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the scheduled time
    const updatedPost = await prisma.scheduledPost.update({
      where: {
        id: params.postId,
      },
      data: {
        scheduledFor: new Date(scheduledFor),
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("[SCHEDULE_UPDATE_ERROR]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find post and verify ownership
    const post = await prisma.scheduledPost.findUnique({
      where: {
        id: params.postId,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the post
    await prisma.scheduledPost.delete({
      where: {
        id: params.postId,
      },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
} 