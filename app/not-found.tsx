import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <QuestionMarkCircledIcon className="h-12 w-12 text-muted-foreground" />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            The page you are looking for does not exist
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </div>
  )
} 