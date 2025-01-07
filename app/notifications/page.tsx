import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function NotificationsPage() {
  // This would come from your notifications state/context
  const notifications = [
    {
      id: 1,
      title: "Welcome to CRAFTR!",
      message: "Get started by exploring our features.",
      timestamp: "2 minutes ago",
      isRead: false,
    },
    {
      id: 2,
      title: "New feature available",
      message: "Check out our new notifications system!",
      timestamp: "5 minutes ago",
      isRead: false,
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </AppHeader>
        <main className="container max-w-[1000px] p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Manage your notifications and preferences
              </p>
            </div>
            <Button variant="outline" size="sm">
              Mark all as read
            </Button>
          </div>
          
          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[150px]">Time</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      {!notification.isRead && (
                        <span className="flex h-2 w-2 rounded-full bg-primary" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {notification.timestamp}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Dismiss notification</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 