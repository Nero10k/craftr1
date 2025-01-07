import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UploadClient, UploadcareFile } from "@uploadcare/upload-client"

// Initialize the Uploadcare client
const uploadClient = new UploadClient({ publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '' })

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

    // Convert File to Buffer for Uploadcare
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a unique file name
    const fileName = `${session.user.id}-${Date.now()}-${file.name}`

    // Upload to Uploadcare using base upload
    const result = await uploadClient.uploadFile(buffer, {
      fileName,
      contentType: file.type,
      baseURL: 'https://upload.uploadcare.com',
      metadata: {
        userId: session.user.id,
      },
      store: true,
    }) as UploadcareFile

    if (!result?.cdnUrl) {
      throw new Error('Failed to upload image')
    }

    // Get the UUID from the CDN URL
    const uuid = result.uuid

    // Construct the final image URL with transformations
    const imageUrl = `https://ucarecdn.com/${uuid}/-/preview/-/quality/smart/-/format/auto/`

    // Update user's image in database with the CDN URL
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