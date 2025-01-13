"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from "date-fns"
import { AlertCircle, BarChart, Calendar, Clock, FileText } from "lucide-react"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AgentStats {
  agentStatus: {
    isActive: boolean
    lastRun: string | null
    nextRun: string | null
    frequency: string | null
    topics: string[]
  }
  metrics: {
    totalPosts: number
    postsPerDay: number
    topicsDistribution: Record<string, number>
    dailyDistribution: Record<string, number>
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4CAF50']

export function AgentStats() {
  const [stats, setStats] = React.useState<AgentStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/generator/agent/stats")
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch agent stats")
        }
        
        setStats(data)
      } catch (error) {
        console.error("Stats fetch error:", error)
        const message = error instanceof Error ? error.message : "Failed to fetch stats"
        setError(message)
        toast.error("Failed to fetch agent stats", {
          description: message
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every minute if agent is active
    const interval = setInterval(() => {
      if (stats?.agentStatus.isActive) {
        fetchStats()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [stats?.agentStatus.isActive])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <h3 className="font-medium text-red-600">Error</h3>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  const topicsData = Object.entries(stats.metrics.topicsDistribution)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value)

  const dailyData = Object.entries(stats.metrics.dailyDistribution)
    .map(([date, count]) => ({
      date,
      posts: count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts per Day</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.postsPerDay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Average over 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.agentStatus.lastRun 
                ? format(new Date(stats.agentStatus.lastRun), "MMM d, HH:mm")
                : "Never"}
            </div>
            <p className={cn(
              "text-xs",
              stats.agentStatus.isActive ? "text-green-500" : "text-slate-500"
            )}>
              {stats.agentStatus.isActive ? "Agent Active" : "Agent Inactive"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.agentStatus.nextRun && stats.agentStatus.isActive
                ? format(new Date(stats.agentStatus.nextRun), "MMM d, HH:mm")
                : "Not Scheduled"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.agentStatus.frequency || "No frequency set"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Posts Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="posts" 
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topics Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topicsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 