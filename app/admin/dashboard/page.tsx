'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { Icons } from "@/components/icons"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PresetPeriod = '7d' | '30d' | '90d' | '180d' | '365d' | 'custom'

interface Analytics {
  totalUsers: number
  newUsers: number
  activeSubscribers: number
  freeUsers: number
  mrr: number
  revenueGrowth: number
  conversionRate: number
  churnRate: number
  retentionRate: number
  userGrowth: Record<string, number>
  revenueByMonth: Record<string, number>
  period: {
    start: string
    end: string
    interval: 'day' | 'month'
  }
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<PresetPeriod>('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)

        let url = '/api/admin/analytics'
        if (period === 'custom') {
          // Only fetch if both dates are selected
          if (!dateRange?.from || !dateRange?.to) {
            setAnalytics(null)
            setError('Please select both start and end dates')
            setIsLoading(false)
            return
          }
          url += `?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
        } else {
          url += `?timeframe=${period}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch analytics')
        }
        
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch analytics')
        toast.error('Error loading analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [period, dateRange?.from && dateRange?.to]) // Only trigger when both dates are selected

  const handlePeriodChange = (newPeriod: PresetPeriod) => {
    setPeriod(newPeriod)
    if (newPeriod !== 'custom') {
      // Reset date range when switching to preset periods
      setDateRange(undefined)
    } else {
      // When switching to custom, initialize with no dates selected
      setDateRange(undefined)
      setAnalytics(null)
      setError('Please select both start and end dates')
    }
  }

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
    // Don't trigger analytics fetch here - it will be triggered by the useEffect when both dates are set
  }

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

  return (
    <div>
      <AppHeader hideNotifications>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="180d">Last 180 days</SelectItem>
                <SelectItem value="365d">Last 365 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            {period === 'custom' && (
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </AppHeader>

      <div className="p-6 space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : analytics ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Icons.users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.newUsers} in selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <Icons.euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics?.mrr)}</div>
                  <p className={cn(
                    "text-xs",
                    analytics?.revenueGrowth > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {analytics?.revenueGrowth > 0 ? "+" : ""}{analytics?.revenueGrowth.toFixed(1)}% from previous period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Icons.percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Of signups in selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <Icons.minusCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.churnRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    For selected period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <Icons.users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.activeSubscribers}</div>
                  <p className="text-xs text-muted-foreground">
                    {((analytics?.activeSubscribers / analytics?.totalUsers) * 100).toFixed(1)}% of total users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                  <Icons.users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.freeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {((analytics?.freeUsers / analytics?.totalUsers) * 100).toFixed(1)}% of total users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Retention</CardTitle>
                  <Icons.userCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.retentionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Retention rate for period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    {period === 'custom' && dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                      : `Last ${period.replace('d', ' days')}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {Object.keys(analytics.userGrowth).length === 0 ? (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No data available for this period
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Object.entries(analytics.userGrowth).map(([month, users]) => ({
                          month,
                          users,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month"
                            tickFormatter={(value) => {
                              const date = new Date(value)
                              return analytics.period.interval === 'day'
                                ? format(date, "MMM d")
                                : format(date, "MMM yy")
                            }}
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip 
                            labelFormatter={(value) => {
                              const date = new Date(value)
                              return format(date, "MMMM d, yyyy")
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>
                    {period === 'custom' && dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                      : `Last ${period.replace('d', ' days')}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {Object.keys(analytics.revenueByMonth).length === 0 ? (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No revenue data available for this period
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Object.entries(analytics.revenueByMonth).map(([month, revenue]) => ({
                          month,
                          revenue,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month"
                            tickFormatter={(value) => {
                              const date = new Date(value)
                              return analytics.period.interval === 'day'
                                ? format(date, "MMM d")
                                : format(date, "MMM yy")
                            }}
                          />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip 
                            labelFormatter={(value) => {
                              const date = new Date(value)
                              return format(date, "MMMM d, yyyy")
                            }}
                            formatter={(value) => formatCurrency(value as number)}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#4CAF50"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
} 