"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { LinkedinGuide } from "@/components/generator/linkedin-guide"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const linkedinFormSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  accessToken: z.string().min(1, "Access Token is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
})

type LinkedinFormValues = z.infer<typeof linkedinFormSchema>

export function LinkedinIntegration() {
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<'disconnected' | 'connected' | 'error'>('disconnected')
  const [isLoading, setIsLoading] = React.useState(true)

  const form = useForm<LinkedinFormValues>({
    resolver: zodResolver(linkedinFormSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
      accessToken: "",
      organizationId: "",
    },
  })

  // Fetch existing credentials on mount
  React.useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await fetch('/api/generator/agent/linkedin-credentials')
        const data = await response.json()
        
        if (response.ok && data.credentials) {
          form.reset(data.credentials)
          setConnectionStatus('connected')
        }
      } catch (error) {
        console.error('Failed to fetch LinkedIn credentials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [form])

  async function onSubmit(data: LinkedinFormValues) {
    try {
      setIsConnecting(true)
      const response = await fetch('/api/generator/agent/linkedin-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save credentials')
      }

      setConnectionStatus('connected')
      toast.success('LinkedIn credentials saved successfully', {
        description: 'Your LinkedIn account is now connected'
      })
    } catch (error) {
      console.error('LinkedIn connection error:', error)
      setConnectionStatus('error')
      toast.error('Failed to connect LinkedIn account', {
        description: error instanceof Error ? error.message : 'Please check your credentials and try again'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="setup" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="setup">Setup</TabsTrigger>
        <TabsTrigger value="guide">Integration Guide</TabsTrigger>
      </TabsList>
      <TabsContent value="setup">
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Integration</CardTitle>
            <CardDescription>
              Connect your LinkedIn account to enable analytics tracking and post scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Connected to LinkedIn</span>
                  </>
                ) : connectionStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-500">Connection error</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">Not connected</span>
                  </>
                )}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your LinkedIn Client ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        Found in your LinkedIn Developer Portal under Application Credentials
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your LinkedIn Client Secret" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your application's secret key from LinkedIn Developer Portal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your LinkedIn Access Token" {...field} />
                      </FormControl>
                      <FormDescription>
                        Generate this token with r_organization_social and rw_organization_social scopes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your LinkedIn Organization ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        Found in your LinkedIn Company Page URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isConnecting}>
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {connectionStatus === 'connected' ? 'Update Connection' : 'Connect LinkedIn'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-muted/50 text-sm text-muted-foreground">
            <p>
              Need help? Switch to the Integration Guide tab for step-by-step instructions.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="guide">
        <LinkedinGuide />
      </TabsContent>
    </Tabs>
  )
} 