import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

// Use this in server components to get the session
export async function getSession() {
  return await getServerSession()
}

// Use this to protect server components
export async function requireAuth() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect("/login")
  }

  return session
}

// Use this to protect API routes
export async function requireAuthApi(req: NextRequest) {
  const session = await getSession()
  
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  return session
} 