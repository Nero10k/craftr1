import { AppSidebar } from "@/components/app-sidebar"
import { AppHeaderSkeleton } from "@/components/skeletons"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Loading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderSkeleton />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-8 w-[200px] rounded-md bg-muted" />
                <div className="h-4 w-[300px] rounded-md bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded-md bg-muted" />
                <div className="h-4 w-[90%] rounded-md bg-muted" />
                <div className="h-4 w-[80%] rounded-md bg-muted" />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 