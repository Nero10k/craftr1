"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function NotFoundContent() {
  return (
    <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-muted-foreground">
          Page not found. Please check the URL in the address bar and try again.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Button asChild>
          <Link href="/home">Home</Link>
        </Button>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense>
      <NotFoundContent />
    </Suspense>
  )
} 