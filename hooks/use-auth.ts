'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Role } from "@/lib/auth/types"

export function useAuth(requiredRole?: Role) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
    } else if (requiredRole && session.user.role !== requiredRole) {
      router.push('/dashboard')
    }
  }, [session, status, router, requiredRole])

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    hasRequiredRole: !requiredRole || session?.user.role === requiredRole,
  }
} 