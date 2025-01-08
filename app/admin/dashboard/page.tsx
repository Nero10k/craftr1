'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { Icons } from "@/components/icons"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Analytics {
  totalUsers: number
  newUsers: number
  activeSubscribers: number
  freeUsers: number
  mrr: number
  userGrowth: Record<string, number>
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div>
        <AppHeader hideNotifications>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </AppHeader>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div>
        <AppHeader hideNotifications>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </AppHeader>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Error loading dashboard data</p>
          </div>
        </div>
      </div>
    )
  }

  const growthData = Object.entries(analytics.userGrowth).map(([month, count]) => ({
    month,
    users: count,
  }))

  return (
    <div>
      <AppHeader hideNotifications>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </AppHeader>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.newUsers} in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.activeSubscribers / analytics.totalUsers) * 100).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Users</CardTitle>
              <Icons.users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.freeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.freeUsers / analytics.totalUsers) * 100).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <Icons.euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.mrr)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.mrr / analytics.activeSubscribers)} per user
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users per month over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 