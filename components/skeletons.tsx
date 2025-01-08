import { Skeleton } from "@/components/ui/skeleton"

export function UserAvatarSkeleton() {
  return <Skeleton className="h-8 w-8 rounded-full" />
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Skeleton className="h-12 w-12" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-8 w-[60px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FormRowSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function ButtonSkeleton() {
  return <Skeleton className="h-10 w-[100px]" />
}

export function SearchBarSkeleton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-[100px]" />
    </div>
  )
}

export function NavSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function AppHeaderSkeleton() {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 dark:bg-background">
      <Skeleton className="h-6 w-6" />
      <div className="flex flex-1 items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
      </div>
    </header>
  )
} 