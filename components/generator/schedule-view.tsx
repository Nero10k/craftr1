"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Loader2, Linkedin } from "lucide-react"

interface ScheduledPost {
  id: string
  title: string
  content: string
  topic: string
  scheduledFor: string
  publishedToLinkedIn: boolean
  linkedinPublishError?: string
}

export function ScheduleView() {
  const [posts, setPosts] = React.useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [linkedinEnabled, setLinkedinEnabled] = React.useState(false)
  const [isCheckingLinkedin, setIsCheckingLinkedin] = React.useState(true)

  // Fetch scheduled posts and LinkedIn status
  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [postsResponse, linkedinResponse] = await Promise.all([
          fetch('/api/generator/scheduled-posts'),
          fetch('/api/generator/agent/linkedin-credentials')
        ])

        const postsData = await postsResponse.json()
        const linkedinData = await linkedinResponse.json()

        setPosts(postsData.posts || [])
        setLinkedinEnabled(!!linkedinData.credentials)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load scheduled posts')
      } finally {
        setIsLoading(false)
        setIsCheckingLinkedin(false)
      }
    }

    fetchData()
  }, [])

  const selectedDatePosts = posts.filter(post => {
    const postDate = new Date(post.scheduledFor)
    return selectedDate && 
      postDate.getDate() === selectedDate.getDate() &&
      postDate.getMonth() === selectedDate.getMonth() &&
      postDate.getFullYear() === selectedDate.getFullYear()
  })

  const handleLinkedinToggle = async () => {
    if (!linkedinEnabled) {
      // Redirect to LinkedIn integration page
      window.location.href = '/generator?tab=linkedin'
      return
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Select a date to view scheduled posts</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="linkedin">Post to LinkedIn</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically post content to your LinkedIn page
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isCheckingLinkedin ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    id="linkedin"
                    checked={linkedinEnabled}
                    onCheckedChange={handleLinkedinToggle}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
          <CardDescription>
            {selectedDatePosts.length} posts scheduled for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedDatePosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts scheduled for this date</p>
            ) : (
              selectedDatePosts.map((post) => (
                <div key={post.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">{post.topic}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(post.scheduledFor), 'h:mm a')}
                    </div>
                  </div>
                  {linkedinEnabled && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Linkedin className="h-4 w-4" />
                      {post.publishedToLinkedIn ? (
                        <span className="text-green-600">Posted to LinkedIn</span>
                      ) : post.linkedinPublishError ? (
                        <span className="text-red-600">Failed to post: {post.linkedinPublishError}</span>
                      ) : (
                        <span className="text-muted-foreground">Scheduled for LinkedIn</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 