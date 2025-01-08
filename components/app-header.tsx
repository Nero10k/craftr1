"use client"

import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface AppHeaderProps {
  children?: React.ReactNode
  hideNotifications?: boolean
}

export function AppHeader({ children, hideNotifications }: AppHeaderProps) {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 dark:bg-background">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-2">
        {children}
      </div>
      <div className="flex items-center gap-4">
        {!hideNotifications && <NotificationsDropdown />}
      </div>
    </header>
  )
} 