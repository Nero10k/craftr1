import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    // Allow access in development mode without authentication
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const limit = 10

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { firstName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { lastName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 