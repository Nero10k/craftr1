'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

export function VerifyEmailForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      if (!token) {
        toast({
          title: "Error",
          description: "Invalid verification link",
          variant: "destructive",
        })
        router.push(routes.home)
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to verify email')
        }

        toast({
          title: "Success",
          description: "Your email has been verified. You can now sign in.",
        })
        router.push(routes.home)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to verify email",
          variant: "destructive",
        })
        router.push(routes.home)
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [router, searchParams, toast])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Verifying your email address..." : "Redirecting..."}
        </p>
      </div>
      <Button className="rounded-lg" disabled>
        {isLoading ? "Verifying..." : "Verified"}
      </Button>
    </div>
  )
} 