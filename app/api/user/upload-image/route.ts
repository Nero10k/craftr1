import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadImageToS3, isS3Configured } from "@/lib/s3-upload"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a unique file name
    const fileName = `${session.user.id}-${Date.now()}-${file.name}`

    // Upload to S3 if configured
    const imageUrl = await uploadImageToS3(buffer, fileName, file.type)

    // If S3 is not configured or upload failed, return error
    if (!imageUrl && isS3Configured()) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      )
    }

    // If S3 is not configured, we'll store the image URL as null
    // This allows the app to work without S3 configuration
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
      }
    })

    return NextResponse.json({ 
      imageUrl,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        image: updatedUser.image,
        name: updatedUser.name
      }
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
} 