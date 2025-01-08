"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Something went wrong!</h1>
        <p className="text-lg text-muted-foreground">
          An error occurred. Please try again.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
} 