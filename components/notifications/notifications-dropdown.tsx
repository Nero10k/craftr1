"use client"

import * as React from "react"
import { Bell, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = React.useState(false)
  const unreadCount: number = 2 // This would come from your notifications state/context

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "relative h-9 w-9",
            "hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0",
            "data-[state=open]:bg-muted/50",
            isOpen ? "bg-muted/50" : "hover:bg-muted/50"
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium leading-none text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[380px]" 
        align="end" 
        sideOffset={8}
        alignOffset={0}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount === 0 ? 'No unread notifications' : 
                `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              }
            </p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto h-8 text-xs font-medium">
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          <div className="flex flex-col gap-1 p-1">
            {/* Sample notifications - developers can replace these with real data */}
            <div className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50">
              <span className="mt-1.5 flex h-1.5 w-1.5 rounded-full bg-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none">
                  <span className="font-medium">Welcome to CRAFTR!</span> Get started by exploring our features.
                </p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Dismiss notification</span>
              </Button>
            </div>
            <div className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50">
              <span className="mt-1.5 flex h-1.5 w-1.5 rounded-full bg-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none">
                  <span className="font-medium">New feature available:</span> Check out our new notifications system!
                </p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Dismiss notification</span>
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 