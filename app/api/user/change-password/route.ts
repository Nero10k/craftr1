import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { compare, hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 }
      )
    }

    const isValid = await compare(currentPassword, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
} 