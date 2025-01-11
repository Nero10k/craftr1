import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const settings = await prisma.appSettings.findFirst()
    return NextResponse.json(settings || { appName: "CRAFTR" })
  } catch (error) {
    console.error("[SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const data = await request.json()
    const { appName } = data

    if (!appName || typeof appName !== "string") {
      return new NextResponse("Invalid app name", { status: 400 })
    }

    const settings = await prisma.appSettings.findFirst()

    if (settings) {
      const updatedSettings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { appName }
      })
      return NextResponse.json(updatedSettings)
    } else {
      const newSettings = await prisma.appSettings.create({
        data: { appName }
      })
      return NextResponse.json(newSettings)
    }
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 