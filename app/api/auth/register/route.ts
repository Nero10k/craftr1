import { registerUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user = await registerUser({ email, password, firstName, lastName })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
} 