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

// Define variable categories and their headers
const variableCategories: Record<string, { header: string, variables: string[] }> = {
  app: {
    header: "# App",
    variables: ["NEXT_PUBLIC_APP_URL"]
  },
  database: {
    header: "# Database",
    variables: ["DATABASE_URL"]
  },
  auth: {
    header: "# Auth",
    variables: ["NEXTAUTH_URL", "NEXTAUTH_SECRET"]
  },
  google: {
    header: "# Google OAuth",
    variables: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
  },
  stripe: {
    header: "# Stripe",
    variables: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRO_PRICE_ID"]
  },
  intercom: {
    header: "# Optional: Intercom Integration",
    variables: ["NEXT_PUBLIC_INTERCOM_APP_ID"]
  },
  metaPixel: {
    header: "# Optional: Meta Pixel Tracking",
    variables: ["NEXT_PUBLIC_META_PIXEL_ID"]
  },
  telegram: {
    header: "# Optional: Telegram Notifications",
    variables: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]
  },
  pusher: {
    header: "# Optional: Pusher (Real-time)",
    variables: ["PUSHER_APP_ID", "PUSHER_SECRET", "NEXT_PUBLIC_PUSHER_KEY", "NEXT_PUBLIC_PUSHER_CLUSTER"]
  }
}

async function parseEnvFile(content: string) {
  const lines = content.split('\n')
  const variables: Record<string, string> = {}
  const comments: Record<string, string> = {}
  let lastComment = ''

  lines.forEach(line => {
    // Store comments
    if (line.startsWith('#')) {
      lastComment = line
      return
    }

    // Skip empty lines
    if (!line) {
      lastComment = ''
      return
    }

    const [key, ...valueParts] = line.split('=')
    if (!key) return

    // Join value parts back together in case value contains = signs
    const value = valueParts.join('=')
    variables[key.trim()] = value.trim()
    if (lastComment) {
      comments[key.trim()] = lastComment
      lastComment = ''
    }
  })

  return { variables, comments }
}

function getCategoryForVariable(variable: string): string | null {
  for (const [category, config] of Object.entries(variableCategories)) {
    if (config.variables.includes(variable)) {
      return category
    }
  }
  return null
}

function organizeVariables(variables: Record<string, string>): Record<string, Record<string, string>> {
  const organized: Record<string, Record<string, string>> = {}
  
  // Initialize categories
  Object.keys(variableCategories).forEach(category => {
    organized[category] = {}
  })
  organized.other = {} // For variables that don't match any category

  // Sort variables into categories
  Object.entries(variables).forEach(([key, value]) => {
    const category = getCategoryForVariable(key) || 'other'
    organized[category][key] = value
  })

  return organized
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
    const { variables } = await parseEnvFile(content)

    return NextResponse.json({ variables })
  } catch (error) {
    console.error("[ENV_READ_ERROR]", error)
    return new NextResponse("Failed to read environment variables", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 })
    }

    const data = await request.json()
    const { variables: newVariables } = data

    // Get the path to .env file
    const envPath = join(process.cwd(), ".env")

    // Check if .env file exists
    const exists = await fileExists(envPath)
    let existingContent = ''
    let existingVariables: Record<string, string> = {}
    let comments: Record<string, string> = {}

    if (exists) {
      existingContent = await readFile(envPath, 'utf-8')
      const parsed = await parseEnvFile(existingContent)
      existingVariables = parsed.variables
      comments = parsed.comments
    }

    // Merge existing variables with new ones
    const mergedVariables = {
      ...existingVariables,
      ...newVariables
    }

    let envContent = ''

    if (exists) {
      const lines = existingContent.split('\n')
      const processedKeys = new Set()
      let currentCategory = ''

      // First pass: preserve existing structure and update values
      lines.forEach(line => {
        if (line.startsWith('#')) {
          // Update current category based on the header
          Object.entries(variableCategories).forEach(([category, config]) => {
            if (line.includes(config.header)) {
              currentCategory = category
            }
          })
          envContent += line + '\n'
          return
        }

        if (!line.trim()) {
          envContent += '\n'
          return
        }

        const [key] = line.split('=')
        if (!key) return

        const trimmedKey = key.trim()
        if (mergedVariables[trimmedKey] !== undefined) {
          envContent += `${trimmedKey}=${mergedVariables[trimmedKey]}\n`
          processedKeys.add(trimmedKey)
        } else {
          envContent += line + '\n'
        }
      })

      // Second pass: add new variables in their appropriate categories
      const organizedNewVars = organizeVariables(mergedVariables)
      let addedCategories = new Set()

      Object.entries(organizedNewVars).forEach(([category, vars]) => {
        const newVarsInCategory = Object.entries(vars).filter(([key]) => !processedKeys.has(key))
        
        if (newVarsInCategory.length > 0) {
          // Only add category header if we have new variables and category isn't already in file
          const categoryConfig = variableCategories[category]
          if (categoryConfig && !addedCategories.has(category)) {
            envContent += `\n${categoryConfig.header}\n`
            addedCategories.add(category)
          }

          newVarsInCategory.forEach(([key, value]) => {
            envContent += `${key}=${value}\n`
          })
        }
      })
    } else {
      // If file doesn't exist, create it with organized structure
      const organizedVars = organizeVariables(mergedVariables)
      
      Object.entries(variableCategories).forEach(([category, config]) => {
        const varsInCategory = organizedVars[category]
        if (Object.keys(varsInCategory).length > 0) {
          envContent += `\n${config.header}\n`
          Object.entries(varsInCategory).forEach(([key, value]) => {
            envContent += `${key}=${value}\n`
          })
        }
      })

      // Add any uncategorized variables at the end
      const otherVars = organizedVars.other
      if (Object.keys(otherVars).length > 0) {
        envContent += '\n# Other\n'
        Object.entries(otherVars).forEach(([key, value]) => {
          envContent += `${key}=${value}\n`
        })
      }
    }

    // Write to .env file
    await writeFile(envPath, envContent.trim() + '\n', 'utf-8')

    return NextResponse.json({ 
      success: true,
      created: !exists 
    })
  } catch (error) {
    console.error("[ENV_UPDATE_ERROR]", error)
    return new NextResponse("Failed to update environment variables", { status: 500 })
  }
} 