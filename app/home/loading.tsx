import { AppSidebar } from "@/components/app-sidebar"
import { AppHeaderSkeleton, CardSkeleton, StatsSkeleton } from "@/components/skeletons"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function HomeLoading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderSkeleton />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl space-y-8">
            <StatsSkeleton />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <CardSkeleton />
              </div>
              <div className="col-span-3">
                <CardSkeleton />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 