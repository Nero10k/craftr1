"use client"

import { AdminUsers } from "@/components/admin/users"
import { AppHeader } from "@/components/app-header"

export default function AdminPage() {
  return (
    <div>
      <AppHeader hideNotifications>
        <h1 className="text-lg font-semibold">Users</h1>
      </AppHeader>
      <div className="p-6">
        <AdminUsers />
      </div>
    </div>
  )
} 