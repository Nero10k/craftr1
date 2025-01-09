import { UserRole } from "@prisma/client"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getRateLimiterByPath, getRateLimitIdentifier } from "@/lib/rate-limit"

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
  const path = request.nextUrl.pathname
  const isDevelopment = process.env.NODE_ENV === "development"

  // Apply rate limiting for API routes
  if (path.startsWith('/api/')) {
    try {
      const ip = getRateLimitIdentifier(request)
      const limiter = getRateLimiterByPath(path)
      const { success, limit, reset, remaining } = await limiter.limit(ip)

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        })
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue even if rate limiting fails
    }
  }

  // Allow unrestricted access to /admin and /admin/integrations in development
  if (isDevelopment && (path === "/admin" || path === "/admin/integrations")) {
    return NextResponse.next()
  }

  // For all other routes, proceed with normal auth checks
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

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
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedPath) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Check role-based access (skip in development for admin routes)
  if (requiredRoles && (!token?.role || !requiredRoles.includes(token.role))) {
    // If in development and it's an admin route, allow access
    if (isDevelopment && path.startsWith("/admin")) {
      return NextResponse.next()
    }
    // Otherwise redirect to home
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Block access to /admin/integrations in production
  if (process.env.NODE_ENV === "production" && request.nextUrl.pathname === "/admin/integrations") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|$).*)",
  ],
} 