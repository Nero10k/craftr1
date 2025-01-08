"use client"

import { AppHeader } from "@/components/app-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AppHeader>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </AppHeader>
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 