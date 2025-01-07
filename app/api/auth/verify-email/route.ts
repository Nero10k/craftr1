import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    // Use a transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      const verificationToken = await tx.verificationToken.findUnique({
        where: { token },
        select: {
          identifier: true,
          expires: true,
        }
      })

      if (!verificationToken) {
        throw new Error("Invalid verification token")
      }

      if (new Date() > verificationToken.expires) {
        // Delete expired token
        await tx.verificationToken.delete({
          where: { token }
        })
        throw new Error("Verification token has expired")
      }

      // Update user and delete token atomically
      await tx.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() }
      })

      await tx.verificationToken.delete({
        where: { token }
      })

      return { success: true }
    })

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Error verifying email:", error)
    const message = error instanceof Error ? error.message : "Failed to verify email"
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes("token") ? 400 : 500 }
    )
  }
} 