"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { format } from "date-fns"
import { AlertCircle, Eye, Heart, MessageCircle, Share2, Zap } from "lucide-react"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LinkedInStats {
  overview: {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalShares: number
    totalImpressions: number
    avgEngagementRate: number
    avgClickThroughRate: number
    postCount: number
  }
  dailyEngagement: Record<string, {
    views: number
    likes: number
    comments: number
    shares: number
  }>
  topPosts: Array<{
    title: string
    topic: string
    metrics: {
      views: number
      likes: number
      comments: number
      shares: number
      engagementRate: number
      clickThroughRate: number
    }
  }>
}

export function LinkedInStats() {
  const [stats, setStats] = React.useState<LinkedInStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/generator/agent/linkedin-stats")
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch LinkedIn stats")
        }
        
        setStats(data)
      } catch (error) {
        console.error("LinkedIn stats fetch error:", error)
        const message = error instanceof Error ? error.message : "Failed to fetch stats"
        setError(message)
        toast.error("Failed to fetch LinkedIn stats", {
          description: message
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

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

  const dailyData = Object.entries(stats.dailyEngagement)
    .map(([date, data]) => ({
      date,
      ...data
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.overview.totalLikes + stats.overview.totalComments + stats.overview.totalShares).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Likes, Comments & Shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.overview.avgEngagementRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average per post
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.overview.avgClickThroughRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average per post
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Engagement</CardTitle>
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
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    name="Views"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="likes" 
                    name="Likes"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="comments" 
                    name="Comments"
                    stroke="#ffc658"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Posts Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topPosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title"
                    tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + "..." : value}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="metrics.views" name="Views" fill="#8884d8" />
                  <Bar dataKey="metrics.likes" name="Likes" fill="#82ca9d" />
                  <Bar dataKey="metrics.comments" name="Comments" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topPosts.map((post, index) => (
              <div key={index} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div>
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">{post.topic}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.metrics.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.metrics.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.metrics.comments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="h-4 w-4" />
                    <span>{post.metrics.shares.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 