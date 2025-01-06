import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { routes } from "@/lib/constants"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-sm" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="rounded-lg"
            required
          />
        </div>
        <Button className="rounded-lg" type="submit">
          Send reset link
        </Button>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href={routes.home}
          className="underline-offset-4 hover:text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  )
} 