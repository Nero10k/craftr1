import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
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

    const { scheduledFor } = await req.json()

    // Verify the post belongs to the user
    const post = await prisma.scheduledPost.findUnique({
      where: {
        id: params.postId,
      },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    if (post.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
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
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Find post and verify ownership
    const post = await prisma.scheduledPost.findUnique({
      where: {
        id: params.postId,
      },
    })

    if (!post) {
      return new Response("Post not found", { status: 404 })
    }

    if (post.userId !== user.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Delete the post
    await prisma.scheduledPost.delete({
      where: {
        id: params.postId,
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE_POST_ERROR]", error)
    return new Response("Internal Error", { status: 500 })
  }
} 