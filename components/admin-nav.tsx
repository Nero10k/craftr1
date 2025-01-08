'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainNavItem {
  title: string
  href: string
}

interface SidebarNavItem {
  title: string
  href: string
  icon: string
}

const adminConfig: { mainNav: MainNavItem[]; sidebarNav: SidebarNavItem[] } = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Support",
      href: "/support",
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: "chart",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "users",
    },
    {
      title: "App Setup",
      href: "/admin/integrations",
      icon: "settings",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: "settings",
    },
  ],
}

interface AdminNavProps {
  items?: MainNavItem[]
}

export function AdminNav({ items = adminConfig.mainNav }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6">
      {items?.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 