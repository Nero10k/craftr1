"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { AppHeader } from "@/components/app-header"

export default function IntegrationsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({})

  const getInputValue = (key: string) => {
    return envVariables[key] || ""
  }

  useEffect(() => {
    async function loadEnvVariables() {
      try {
        const response = await fetch("/api/admin/env")
        if (!response.ok) throw new Error("Failed to load")
        const data = await response.json()
        setEnvVariables(data.variables)
      } catch (error) {
        console.error("Failed to load env variables:", error)
        toast({
          title: "Error",
          description: "Failed to load environment variables",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEnvVariables()
  }, [])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(event.currentTarget)
      const variables: Record<string, string> = {}

      // Convert FormData to object
      formData.forEach((value, key) => {
        if (value) variables[key] = value.toString()
      })

      const response = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables }),
      })

      if (!response.ok) {
        if (response.status === 403) {
          redirect("/admin")
        }
        throw new Error("Failed to save")
      }

      const result = await response.json()

      // Update local state with new values
      setEnvVariables(variables)

      toast({
        title: result.created ? "Environment File Created" : "Settings saved",
        description: result.created 
          ? "A new .env file has been created with your settings. You may need to restart your development server."
          : "Environment variables have been updated. You may need to restart your development server.",
      })
    } catch (error) {
      console.error("Failed to save:", error)
      toast({
        title: "Error",
        description: "Failed to save environment variables",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <AppHeader hideNotifications>
          <h1 className="text-lg font-semibold">App Setup</h1>
        </AppHeader>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading environment variables...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHeader hideNotifications>
        <h1 className="text-lg font-semibold">App Setup</h1>
      </AppHeader>
      <div className="p-6 space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Integration settings are only available in development environment. In production, please manage these through your deployment platform.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSave}>
          <Tabs defaultValue="setup" className="space-y-4">
            <TabsList>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="billing">Stripe</TabsTrigger>
              <TabsTrigger value="notifications">Chats & Notifications</TabsTrigger>
              <TabsTrigger value="analytics">Pixels</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Essential Configuration</CardTitle>
                  <CardDescription>
                    Required settings for the application to function properly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="DATABASE_URL">Database URL</Label>
                    <Input
                      id="DATABASE_URL"
                      name="DATABASE_URL"
                      type="password"
                      placeholder="postgresql://user:password@localhost:5432/dbname"
                      defaultValue={getInputValue("DATABASE_URL")}
                    />
                    <p className="text-sm text-muted-foreground">
                      Your PostgreSQL connection string. For local development, you can use: postgresql://user:password@localhost:5432/dbname
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="UPSTASH_REDIS_REST_URL">Upstash Redis URL</Label>
                    <Input
                      id="UPSTASH_REDIS_REST_URL"
                      name="UPSTASH_REDIS_REST_URL"
                      type="password"
                      placeholder="https://your-url.upstash.io"
                      defaultValue={getInputValue("UPSTASH_REDIS_REST_URL")}
                    />
                    <p className="text-sm text-muted-foreground">
                      Your Upstash Redis REST URL for rate limiting and caching
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="UPSTASH_REDIS_REST_TOKEN">Upstash Redis Token</Label>
                    <Input
                      id="UPSTASH_REDIS_REST_TOKEN"
                      name="UPSTASH_REDIS_REST_TOKEN"
                      type="password"
                      placeholder="Your Upstash Redis REST token"
                      defaultValue={getInputValue("UPSTASH_REDIS_REST_TOKEN")}
                    />
                    <p className="text-sm text-muted-foreground">
                      Your Upstash Redis REST token for authentication
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="NEXTAUTH_SECRET">NextAuth Secret</Label>
                    <Input
                      id="NEXTAUTH_SECRET"
                      name="NEXTAUTH_SECRET"
                      type="password"
                      placeholder="Generate a random string"
                      defaultValue={getInputValue("NEXTAUTH_SECRET")}
                    />
                    <p className="text-sm text-muted-foreground">
                      A random string used to hash tokens and sign cookies. Generate one using: openssl rand -base64 32
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_APP_URL">App URL</Label>
                    <Input
                      id="NEXT_PUBLIC_APP_URL"
                      name="NEXT_PUBLIC_APP_URL"
                      placeholder="http://localhost:3000"
                      defaultValue={getInputValue("NEXT_PUBLIC_APP_URL")}
                    />
                    <p className="text-sm text-muted-foreground">
                      The base URL of your application. Use http://localhost:3000 for local development
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NEXTAUTH_URL">NextAuth URL</Label>
                    <Input
                      id="NEXTAUTH_URL"
                      name="NEXTAUTH_URL"
                      placeholder="http://localhost:3000"
                      defaultValue={getInputValue("NEXTAUTH_URL")}
                    />
                    <p className="text-sm text-muted-foreground">
                      The URL where your application is hosted. Should match APP_URL for local development
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Google OAuth</CardTitle>
                  <CardDescription>
                    Configure Google OAuth settings for social login
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="GOOGLE_CLIENT_ID">Client ID</Label>
                    <Input
                      id="GOOGLE_CLIENT_ID"
                      name="GOOGLE_CLIENT_ID"
                      placeholder="Google Client ID"
                      defaultValue={getInputValue("GOOGLE_CLIENT_ID")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="GOOGLE_CLIENT_SECRET">Client Secret</Label>
                    <Input
                      id="GOOGLE_CLIENT_SECRET"
                      name="GOOGLE_CLIENT_SECRET"
                      type="password"
                      placeholder="Google Client Secret"
                      defaultValue={getInputValue("GOOGLE_CLIENT_SECRET")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe Integration</CardTitle>
                  <CardDescription>
                    Configure Stripe payment integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="STRIPE_SECRET_KEY">Secret Key</Label>
                    <Input
                      id="STRIPE_SECRET_KEY"
                      name="STRIPE_SECRET_KEY"
                      type="password"
                      placeholder="Stripe Secret Key"
                      defaultValue={getInputValue("STRIPE_SECRET_KEY")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="STRIPE_WEBHOOK_SECRET">Webhook Secret</Label>
                    <Input
                      id="STRIPE_WEBHOOK_SECRET"
                      name="STRIPE_WEBHOOK_SECRET"
                      type="password"
                      placeholder="Stripe Webhook Secret"
                      defaultValue={getInputValue("STRIPE_WEBHOOK_SECRET")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="STRIPE_PRO_PRICE_ID">Pro Plan Price ID</Label>
                    <Input
                      id="STRIPE_PRO_PRICE_ID"
                      name="STRIPE_PRO_PRICE_ID"
                      placeholder="Stripe Price ID for Pro Plan"
                      defaultValue={getInputValue("STRIPE_PRO_PRICE_ID")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Telegram Integration</CardTitle>
                  <CardDescription>
                    Configure Telegram bot for notification delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="TELEGRAM_BOT_TOKEN">Bot Token</Label>
                    <Input
                      id="TELEGRAM_BOT_TOKEN"
                      name="TELEGRAM_BOT_TOKEN"
                      type="password"
                      placeholder="Telegram Bot Token"
                      defaultValue={getInputValue("TELEGRAM_BOT_TOKEN")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="TELEGRAM_CHAT_ID">Chat ID</Label>
                    <Input
                      id="TELEGRAM_CHAT_ID"
                      name="TELEGRAM_CHAT_ID"
                      placeholder="Telegram Chat ID"
                      defaultValue={getInputValue("TELEGRAM_CHAT_ID")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intercom Integration</CardTitle>
                  <CardDescription>
                    Configure Intercom for in-app customer support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_INTERCOM_APP_ID">App ID</Label>
                    <Input
                      id="NEXT_PUBLIC_INTERCOM_APP_ID"
                      name="NEXT_PUBLIC_INTERCOM_APP_ID"
                      placeholder="Intercom App ID"
                      defaultValue={getInputValue("NEXT_PUBLIC_INTERCOM_APP_ID")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Pixel</CardTitle>
                  <CardDescription>
                    Configure Meta Pixel tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_META_PIXEL_ID">Pixel ID</Label>
                    <Input
                      id="NEXT_PUBLIC_META_PIXEL_ID"
                      name="NEXT_PUBLIC_META_PIXEL_ID"
                      placeholder="Meta Pixel ID"
                      defaultValue={getInputValue("NEXT_PUBLIC_META_PIXEL_ID")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Google Analytics</CardTitle>
                  <CardDescription>
                    Configure Google Analytics 4 tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_GA_MEASUREMENT_ID">Measurement ID</Label>
                    <Input
                      id="NEXT_PUBLIC_GA_MEASUREMENT_ID"
                      name="NEXT_PUBLIC_GA_MEASUREMENT_ID"
                      placeholder="G-XXXXXXXXXX"
                      defaultValue={getInputValue("NEXT_PUBLIC_GA_MEASUREMENT_ID")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>TikTok Pixel</CardTitle>
                  <CardDescription>
                    Configure TikTok Pixel tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_TIKTOK_PIXEL_ID">Pixel ID</Label>
                    <Input
                      id="NEXT_PUBLIC_TIKTOK_PIXEL_ID"
                      name="NEXT_PUBLIC_TIKTOK_PIXEL_ID"
                      placeholder="TikTok Pixel ID"
                      defaultValue={getInputValue("NEXT_PUBLIC_TIKTOK_PIXEL_ID")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pinterest Tag</CardTitle>
                  <CardDescription>
                    Configure Pinterest Tag tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_PINTEREST_TAG_ID">Tag ID</Label>
                    <Input
                      id="NEXT_PUBLIC_PINTEREST_TAG_ID"
                      name="NEXT_PUBLIC_PINTEREST_TAG_ID"
                      placeholder="Pinterest Tag ID"
                      defaultValue={getInputValue("NEXT_PUBLIC_PINTEREST_TAG_ID")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Twitter Pixel</CardTitle>
                  <CardDescription>
                    Configure Twitter (X) Pixel tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_TWITTER_PIXEL_ID">Pixel ID</Label>
                    <Input
                      id="NEXT_PUBLIC_TWITTER_PIXEL_ID"
                      name="NEXT_PUBLIC_TWITTER_PIXEL_ID"
                      placeholder="Twitter Pixel ID"
                      defaultValue={getInputValue("NEXT_PUBLIC_TWITTER_PIXEL_ID")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>LinkedIn Insight Tag</CardTitle>
                  <CardDescription>
                    Configure LinkedIn Insight Tag tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_LINKEDIN_TAG_ID">Partner ID</Label>
                    <Input
                      id="NEXT_PUBLIC_LINKEDIN_TAG_ID"
                      name="NEXT_PUBLIC_LINKEDIN_TAG_ID"
                      placeholder="LinkedIn Partner ID"
                      defaultValue={getInputValue("NEXT_PUBLIC_LINKEDIN_TAG_ID")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pusher Integration</CardTitle>
                  <CardDescription>
                    Configure Pusher for real-time features and live updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="PUSHER_APP_ID">App ID</Label>
                    <Input
                      id="PUSHER_APP_ID"
                      name="PUSHER_APP_ID"
                      placeholder="Pusher App ID"
                      defaultValue={getInputValue("PUSHER_APP_ID")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_PUSHER_KEY">Key</Label>
                    <Input
                      id="NEXT_PUBLIC_PUSHER_KEY"
                      name="NEXT_PUBLIC_PUSHER_KEY"
                      placeholder="Pusher Key"
                      defaultValue={getInputValue("NEXT_PUBLIC_PUSHER_KEY")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="PUSHER_SECRET">Secret</Label>
                    <Input
                      id="PUSHER_SECRET"
                      name="PUSHER_SECRET"
                      type="password"
                      placeholder="Pusher Secret"
                      defaultValue={getInputValue("PUSHER_SECRET")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NEXT_PUBLIC_PUSHER_CLUSTER">Cluster</Label>
                    <Input
                      id="NEXT_PUBLIC_PUSHER_CLUSTER"
                      name="NEXT_PUBLIC_PUSHER_CLUSTER"
                      placeholder="Pusher Cluster"
                      defaultValue={getInputValue("NEXT_PUBLIC_PUSHER_CLUSTER")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 