import { UserRole } from "@prisma/client"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configure which routes should be protected
const protectedPaths = [
  "/dashboard",
  "/settings",
  "/profile",
]

// Configure routes that require specific roles
const roleBasedPaths: Record<string, UserRole[]> = {
  "/admin": [UserRole.ADMIN],
  "/admin/users": [UserRole.ADMIN],
  "/admin/settings": [UserRole.ADMIN],
  "/support": [UserRole.SUPPORT, UserRole.ADMIN],
  "/support/tickets": [UserRole.SUPPORT, UserRole.ADMIN],
  "/dashboard/analytics": [UserRole.SUPPORT, UserRole.ADMIN],
}

// Configure which routes should be accessible only to non-authenticated users
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
]

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const path = request.nextUrl.pathname

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`))

  // Check if the path requires specific roles
  const requiredRoles = Object.entries(roleBasedPaths).find(([prefix]) =>
    path === prefix || path.startsWith(`${prefix}/`))?.[1]

  // Check if the path is an auth route (login, register, etc.)
  const isAuthPath = authRoutes.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`))

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedPath) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Check role-based access
  if (requiredRoles && (!token?.role || !requiredRoles.includes(token.role))) {
    // If user doesn't have the required role, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)",
  ],
} 