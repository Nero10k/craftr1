import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { GeneratorForm } from "@/components/generator/generator-form"
import { ScheduleView } from "@/components/generator/schedule-view"
import { AgentView } from "@/components/generator/agent-view"
import { AgentStats } from "@/components/generator/agent-stats"
import { LinkedinIntegration } from "@/components/generator/linkedin-integration"

export default async function GeneratorPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/')
  }

  return (
    <SidebarProvider defaultOpen={true} variant="inset">
      <AppSidebar />
      <SidebarInset>
        <AppHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Content Generator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </AppHeader>
        <main className="container max-w-[1000px] p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Content Generator</h2>
              <p className="text-sm text-muted-foreground">
                Generate engaging content for your MKB business
              </p>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="space-y-8">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger
                  value="content"
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="agent"
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  Agent
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  Stats
                </TabsTrigger>
                <TabsTrigger
                  value="linkedin"
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  LinkedIn
                </TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="content" className="space-y-6">
                  <GeneratorForm />
                </TabsContent>
                <TabsContent value="schedule" className="space-y-6">
                  <ScheduleView />
                </TabsContent>
                <TabsContent value="agent" className="space-y-6">
                  <AgentView />
                </TabsContent>
                <TabsContent value="stats" className="space-y-6">
                  <AgentStats />
                </TabsContent>
                <TabsContent value="linkedin" className="space-y-6">
                  <LinkedinIntegration />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 