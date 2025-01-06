import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { routes } from "@/lib/constants"

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      <div className="grid gap-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-sm" htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              className="rounded-lg"
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-sm" htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              className="rounded-lg"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            className="rounded-lg"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm" htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="rounded-lg"
            required
          />
        </div>
        <Button className="rounded-lg" type="submit">
          Sign Up
        </Button>
      </div>
      <div className="relative my-2 text-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
      <Button variant="outline" className="rounded-lg" type="button">
        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={routes.home}
          className="underline-offset-4 hover:text-primary hover:underline"
        >
          Sign In
        </Link>
      </div>
    </form>
  )
} 