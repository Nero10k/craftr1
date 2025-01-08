import { AppSidebar } from "@/components/app-sidebar"
import { AppHeaderSkeleton, TableRowSkeleton } from "@/components/skeletons"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function NotificationsLoading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderSkeleton />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 