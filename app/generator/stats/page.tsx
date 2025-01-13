import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AgentStats } from "@/components/generator/agent-stats"

export const metadata = {
  title: "Agent Statistics",
  description: "View performance metrics and statistics for your content generation agent.",
}

export default async function AgentStatsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agent Statistics</h1>
        <p className="text-muted-foreground">
          Monitor your content generation agent's performance and activity metrics.
        </p>
      </div>
      <AgentStats />
    </div>
  )
} 