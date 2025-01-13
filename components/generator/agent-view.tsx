"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Bot } from "lucide-react"

const formSchema = z.object({
  frequency: z.string({
    required_error: "Please select a posting frequency.",
  }),
  topics: z.array(z.string()).min(1, {
    message: "Please select at least one topic.",
  }),
  tone: z.string({
    required_error: "Please select a tone.",
  }),
  ageGroup: z.string({
    required_error: "Please select a target age group.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
  guidelines: z.string().min(10, {
    message: "Guidelines must be at least 10 characters.",
  }),
})

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
]

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "empathetic", label: "Empathetic" },
]

const ageGroups = [
  { value: "18-24", label: "Young Professionals (18-24)" },
  { value: "25-34", label: "Early Career (25-34)" },
  { value: "35-44", label: "Mid-Career (35-44)" },
  { value: "45-54", label: "Established (45-54)" },
  { value: "55+", label: "Senior (55+)" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "nl", label: "Dutch" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
]

const topics = [
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "business-growth", label: "Business Growth" },
  { value: "innovation", label: "Innovation & Technology" },
  { value: "customer-experience", label: "Customer Experience" },
  { value: "market-trends", label: "Market Trends" },
]

interface AgentSettings {
  frequency: string
  topics: string[]
  tone: string
  ageGroup: string
  language: string
  guidelines: string
  isActive: boolean
  lastRun: string | null
  nextRun: string | null
}

export function AgentView() {
  const [isStarting, setIsStarting] = React.useState(false)
  const [isStopping, setIsStopping] = React.useState(false)
  const [isRunning, setIsRunning] = React.useState(false)
  const [settings, setSettings] = React.useState<AgentSettings | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topics: [],
    },
  })

  // Fetch agent status on mount
  React.useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/generator/agent/status")
        if (!response.ok) {
          throw new Error("Failed to fetch agent status")
        }
        const data = await response.json()
        setIsRunning(data.isRunning)
        if (data.settings) {
          setSettings(data.settings)
          form.reset(data.settings)
        }
      } catch (error) {
        console.error("Status fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to fetch agent status",
          variant: "destructive",
        })
      }
    }
    fetchStatus()
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsStarting(true)
      const response = await fetch("/api/generator/agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to start agent")
      }

      setIsRunning(true)
      setSettings(await response.json())
      toast({
        title: "Agent Started",
        description: "The content generation agent is now running with your settings.",
      })
    } catch (error) {
      console.error("Agent start error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error starting the agent.",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  async function stopAgent() {
    try {
      setIsStopping(true)
      const response = await fetch("/api/generator/agent/stop", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to stop agent")
      }

      setIsRunning(false)
      setSettings(null)
      form.reset({
        topics: [],
      })
      toast({
        title: "Agent Stopped",
        description: "The content generation agent has been stopped.",
      })
    } catch (error) {
      console.error("Agent stop error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error stopping the agent.",
        variant: "destructive",
      })
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-100">Content Generation Agent</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set up automated content generation based on your preferences and schedule.
        </p>
      </div>

      {isRunning ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium">Agent Status: Active</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The content generation agent is running with your specified settings.
                </p>
                {settings && (
                  <dl className="mt-4 space-y-2 text-sm">
                    <div>
                      <dt className="inline font-medium">Frequency:</dt>
                      <dd className="inline ml-1 text-slate-500 dark:text-slate-400">
                        {frequencies.find(f => f.value === settings.frequency)?.label}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Topics:</dt>
                      <dd className="inline ml-1 text-slate-500 dark:text-slate-400">
                        {settings.topics.map((topicValue: string) => 
                          topics.find(topic => topic.value === topicValue)?.label
                        ).join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Tone:</dt>
                      <dd className="inline ml-1 text-slate-500 dark:text-slate-400">
                        {tones.find(t => t.value === settings.tone)?.label}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Age Group:</dt>
                      <dd className="inline ml-1 text-slate-500 dark:text-slate-400">
                        {ageGroups.find(a => a.value === settings.ageGroup)?.label}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Language:</dt>
                      <dd className="inline ml-1 text-slate-500 dark:text-slate-400">
                        {languages.find(l => l.value === settings.language)?.label}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
              <Button
                variant="outline"
                onClick={stopAgent}
                disabled={isStopping}
                className="border-red-200 hover:bg-red-50 hover:text-red-900 dark:border-red-800 dark:hover:bg-red-950 dark:hover:text-red-100"
              >
                {isStopping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  "Stop Agent"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Posting Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencies.map((frequency) => (
                        <SelectItem key={frequency.value} value={frequency.value}>
                          {frequency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Topics</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange([...field.value || [], value])}
                    value={field.value?.[0]}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <SelectValue placeholder="Select topics" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selected topics: {field.value?.map(t => topics.find(topic => topic.value === t)?.label).join(", ")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Age Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ageGroups.map((age) => (
                          <SelectItem key={age.value} value={age.value}>
                            {age.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Content Guidelines</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any specific guidelines, keywords, or requirements for the content..."
                      className="min-h-[100px] resize-none bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These guidelines will be used by the agent to generate content that matches your requirements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isStarting || isRunning}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-900 transition-colors"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Agent...
                  </>
                ) : isRunning ? (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Agent Running
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Start Agent
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
} 