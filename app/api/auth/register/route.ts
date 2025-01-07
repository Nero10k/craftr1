import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 })
    }

    const exists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (exists) {
      return new NextResponse("User already exists", { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    })

    // Create verification token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return new NextResponse("User created successfully", { status: 201 })
  } catch (error) {
    console.error("Error in register:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 