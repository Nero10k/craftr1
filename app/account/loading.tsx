import { AppSidebar } from "@/components/app-sidebar"
import { AppHeaderSkeleton, CardSkeleton, FormRowSkeleton } from "@/components/skeletons"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AccountLoading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderSkeleton />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <FormRowSkeleton />
              </div>
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 