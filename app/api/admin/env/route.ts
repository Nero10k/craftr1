import { NextResponse } from "next/server"
import { writeFile, access, constants, readFile } from "fs/promises"
import { join } from "path"

async function fileExists(path: string) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function parseEnvFile(content: string) {
  const lines = content.split('\n')
  const variables: Record<string, string> = {}

  lines.forEach(line => {
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) return

    const [key, ...valueParts] = line.split('=')
    if (!key) return

    // Join value parts back together in case value contains = signs
    const value = valueParts.join('=')
    variables[key.trim()] = value.trim()
  })

  return variables
}

export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 })
    }

    const envPath = join(process.cwd(), ".env")
    const exists = await fileExists(envPath)

    if (!exists) {
      return NextResponse.json({ variables: {} })
    }

    const content = await readFile(envPath, 'utf-8')
    const variables = await parseEnvFile(content)

    return NextResponse.json({ variables })
  } catch (error) {
    console.error("[ENV_READ_ERROR]", error)
    return new NextResponse("Failed to read environment variables", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Only allow in development - using NODE_ENV instead of NEXT_PUBLIC_NODE_ENV
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 })
    }

    const data = await request.json()
    const { variables } = data

    // Format the environment variables
    const envContent = Object.entries(variables)
      .filter(([_, value]) => value) // Remove empty values
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    // Get the path to .env file
    const envPath = join(process.cwd(), ".env")

    // Check if .env file exists, if not we'll create it
    const exists = await fileExists(envPath)
    if (!exists) {
      console.log("[ENV_UPDATE] Creating new .env file")
    }

    // Write to .env file (this will create the file if it doesn't exist)
    await writeFile(envPath, envContent, "utf-8")

    return NextResponse.json({ 
      success: true,
      created: !exists 
    })
  } catch (error) {
    console.error("[ENV_UPDATE_ERROR]", error)
    return new NextResponse("Failed to update environment variables", { status: 500 })
  }
} 