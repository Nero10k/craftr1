import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from 'uuid'

// Initialize S3 Client only if credentials are provided
const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null

export async function uploadImageToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  // If S3 is not configured, return null
  if (!s3Client || !process.env.AWS_BUCKET_NAME) {
    console.log('S3 is not configured. Skipping upload.')
    return null
  }

  try {
    const fileExtension = fileName.split('.').pop() || 'jpg'
    const key = `uploads/${uuidv4()}.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    await s3Client.send(command)

    // Construct the URL (you might want to use a CDN URL if configured)
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    return null
  }
}

// Helper function to check if S3 is configured
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME
  )
} 