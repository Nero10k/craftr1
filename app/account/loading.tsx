import { CardSkeleton, FormRowSkeleton } from "@/components/skeletons"

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FormRowSkeleton />
      </div>
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
} 