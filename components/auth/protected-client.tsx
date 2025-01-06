'use client'

import { Role } from "@/lib/auth/types"
import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedClientProps {
  children: React.ReactNode
  requiredRole?: Role
  loadingComponent?: React.ReactNode
}

export function ProtectedClient({
  children,
  requiredRole,
  loadingComponent = <div className="flex h-screen items-center justify-center"><Spinner /></div>,
}: ProtectedClientProps) {
  const { isLoading, isAuthenticated, hasRequiredRole } = useAuth(requiredRole)

  if (isLoading) {
    return loadingComponent
  }

  if (!isAuthenticated || !hasRequiredRole) {
    return null
  }

  return <>{children}</>
} 