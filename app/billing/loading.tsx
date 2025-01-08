import { CardSkeleton, StatsSkeleton } from "@/components/skeletons"

export default function BillingLoading() {
  return (
    <div className="space-y-8">
      <StatsSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
} 