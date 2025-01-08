import { UpdateIcon } from "@radix-ui/react-icons"

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <UpdateIcon className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
} 