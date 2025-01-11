import { Suspense } from "react"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import { AuthLayout } from "@/components/layouts/auth-layout"

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  )
} 