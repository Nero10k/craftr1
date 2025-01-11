import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Allow access in development mode without authentication
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 })
    }

    const userId = (await params).userId
    const data = await request.json()

    // Validate input
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    // Validate role
    if (data.role && !Object.values(UserRole).includes(data.role)) {
      return new NextResponse("Invalid role", { status: 400 })
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Allow access in development mode without authentication
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 })
    }

    const userId = (await params).userId

    // Validate input
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Delete user's related data first (due to foreign key constraints)
    await prisma.$transaction([
      prisma.session.deleteMany({
        where: { userId },
      }),
      prisma.account.deleteMany({
        where: { userId },
      }),
      prisma.verificationToken.deleteMany({
        where: { userId },
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: userId },
      }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 