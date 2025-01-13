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
import { Loader2, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Tabs } from "@/components/ui/tabs"

const formSchema = z.object({
  topic: z.string({
    required_error: "Please select a topic.",
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
  customization: z.string().min(10, {
    message: "Customization must be at least 10 characters.",
  }).optional(),
})

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

const initialTopics = [
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "business-growth", label: "Business Growth" },
  { value: "innovation", label: "Innovation & Technology" },
  { value: "customer-experience", label: "Customer Experience" },
  { value: "market-trends", label: "Market Trends" },
]

// Function to get next available posting time
function getNextPostingTime() {
  const now = new Date()
  let nextDate = new Date(now)

  // Find next Tuesday, Wednesday, or Thursday
  while (![2, 3, 4].includes(nextDate.getDay())) {
    nextDate.setDate(nextDate.getDate() + 1)
  }

  // Set time to 9:00 AM
  nextDate.setHours(9, 0, 0, 0)

  // If it's past 11 AM today, move to next available day
  if (now.getHours() >= 11 && [2, 3, 4].includes(now.getDay())) {
    nextDate.setDate(nextDate.getDate() + 1)
    while (![2, 3, 4].includes(nextDate.getDay())) {
      nextDate.setDate(nextDate.getDate() + 1)
    }
  }

  return nextDate
}

export function GeneratorForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = React.useState(false)
  const [headlines, setHeadlines] = React.useState<string[]>([])
  const [selectedHeadline, setSelectedHeadline] = React.useState<string>("")
  const [generatedContent, setGeneratedContent] = React.useState<string>("")
  const [isScheduling, setIsScheduling] = React.useState(false)
  const [topics, setTopics] = React.useState(initialTopics)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // Update topics based on previous generations and content
  React.useEffect(() => {
    if (generatedContent) {
      const currentTopic = form.getValues("topic")
      
      // Extract key themes from generated content
      const contentLines = generatedContent.split('\n')
      const keyThemes = contentLines
        .filter(line => line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./))
        .map(line => line.replace(/^[•\-\d.]\s*/, '').trim())
        .filter(Boolean)
        .reduce((themes, line) => {
          // Extract main business themes from the content
          const themeWords = line.toLowerCase().match(/\b(strategy|growth|digital|innovation|customer|market|technology|business|experience|trends)\b/g) || []
          themeWords.forEach(word => themes.add(word))
          return themes
        }, new Set<string>())

      // Map themes to broader topic categories
      const themeToTopic = {
        'strategy': { value: 'business-growth', label: 'Business Growth' },
        'growth': { value: 'business-growth', label: 'Business Growth' },
        'digital': { value: 'digital-marketing', label: 'Digital Marketing' },
        'innovation': { value: 'innovation', label: 'Innovation & Technology' },
        'technology': { value: 'innovation', label: 'Innovation & Technology' },
        'customer': { value: 'customer-experience', label: 'Customer Experience' },
        'experience': { value: 'customer-experience', label: 'Customer Experience' },
        'market': { value: 'market-trends', label: 'Market Trends' },
        'trends': { value: 'market-trends', label: 'Market Trends' },
        'business': { value: 'business-growth', label: 'Business Growth' },
      }

      // Generate new topics based on themes, keeping the current topic
      const currentTopicObj = topics.find(t => t.value === currentTopic)
      const themeTopics = Array.from(keyThemes)
        .map(theme => themeToTopic[theme as keyof typeof themeToTopic])
        .filter((topic): topic is { value: string; label: string } => topic !== undefined)

      const newTopics = new Set([
        ...(currentTopicObj ? [currentTopicObj] : []),
        ...themeTopics
      ])

      // Ensure we only have 5 topics max, prioritizing the current topic and content-relevant topics
      const finalTopics = Array.from(newTopics).slice(0, 5)

      // If we have less than 5 topics, add from initial topics to reach 5
      if (finalTopics.length < 5) {
        const remainingCount = 5 - finalTopics.length
        const existingValues = new Set(finalTopics.map(t => t.value))
        const additionalTopics = initialTopics
          .filter(t => !existingValues.has(t.value))
          .slice(0, remainingCount)
        
        finalTopics.push(...additionalTopics)
      }

      setTopics(finalTopics)
    }
  }, [generatedContent, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch("/api/generator/headlines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to generate headlines")
      }

      const data = await response.json()
      setHeadlines(data.headlines)
      setSelectedHeadline("")
      setGeneratedContent("")
      toast({
        title: "Headlines Generated",
        description: "Please select a headline to generate the full content.",
      })
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error generating headlines.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function generateContent(headline: string) {
    try {
      setIsGeneratingContent(true)
      const response = await fetch("/api/generator/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form.getValues(),
          headline,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to generate content")
      }

      const data = await response.json()
      setSelectedHeadline(headline)
      setGeneratedContent(data.content)
      toast({
        title: "Content Generated",
        description: "Your content has been generated successfully.",
      })
    } catch (error) {
      console.error("Content generation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error generating content.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingContent(false)
    }
  }

  async function schedulePost() {
    if (!generatedContent) return

    try {
      setIsScheduling(true)

      // Extract title and content from the generated content
      const lines = generatedContent.split('\n').map(line => line.trim()).filter(Boolean)
      
      // Find the first non-empty line as title
      const title = lines[0].replace(/^#\s*/, '').trim()

      // Extract bullet points and key content
      const contentPoints = lines
        .filter(line => 
          line.startsWith('•') || 
          line.startsWith('-') || 
          line.startsWith('*') ||
          line.startsWith('1.') ||
          line.startsWith('2.') ||
          line.startsWith('3.') ||
          line.startsWith('4.')
        )
        .map(line => line.replace(/^[•\-*\d.]\s*/, '').trim())

      // Create a summarized version
      const contentSummary = contentPoints.length > 0
        ? contentPoints.join(' • ')
        : lines.slice(1, 4).join(' • ') // Fallback to first few lines if no bullet points

      const response = await fetch("/api/generator/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: contentSummary,
          topic: form.getValues("topic"),
          scheduledFor: getNextPostingTime(),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to schedule post")
      }

      const data = await response.json()
      toast({
        title: "Post Scheduled",
        description: `Your content has been scheduled for ${formatDate(new Date(data.scheduledFor))}.`,
      })

      // Refresh the schedule view
      router.refresh()
    } catch (error) {
      console.error("Scheduling error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error scheduling the post.",
        variant: "destructive",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  async function handleScheduleClick() {
    // Store the content and selected headline in localStorage for the schedule tab
    const contentToSchedule = {
      title: selectedHeadline,
      content: generatedContent,
      topic: form.getValues("topic")
    }
    localStorage.setItem("pendingSchedulePost", JSON.stringify(contentToSchedule))
    
    // Navigate to schedule tab
    const scheduleTab = document.querySelector('[role="tab"][data-value="schedule"]') as HTMLElement
    if (scheduleTab) {
      scheduleTab.click()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-100">Content Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Create and schedule content for your business audience.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <SelectValue placeholder="Select a topic" />
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
                  <FormMessage />
                </FormItem>
              )}
            />

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
            name="customization"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Customization</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any specific requirements or keywords..."
                    className="min-h-[100px] resize-none bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-900 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Headlines"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {headlines.length > 0 && !selectedHeadline && (
        <div className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Choose a Headline</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Select one of the generated headlines below.</p>
          </div>
          <div className="space-y-1">
            {headlines.slice(0, 3).map((headline, index) => (
              <button
                key={index}
                onClick={() => generateContent(headline)}
                disabled={isGeneratingContent}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                    {isGeneratingContent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="font-medium">{index + 1}.</span>
                    )}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                    {headline}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {generatedContent && (
        <div className="space-y-6 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Generated Content</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review and schedule your content.</p>
            </div>
            <Button
              onClick={handleScheduleClick}
              disabled={isScheduling}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-900 transition-colors"
            >
              {isScheduling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Post
                </>
              )}
            </Button>
          </div>
          <div className="prose prose-slate prose-sm max-w-none dark:prose-invert">
            {generatedContent.split('\n').map((line, index) => {
              if (!line.trim()) return null;
              
              if (line.startsWith('#')) {
                const level = Math.min(line.match(/^#+/)?.[0].length || 1, 6);
                const text = line.replace(/^#+\s*/, '');
                const sizes: Record<number, string> = {
                  1: 'text-xl font-medium text-slate-900 dark:text-slate-100',
                  2: 'text-lg font-medium text-slate-800 dark:text-slate-200',
                  3: 'text-base font-medium text-slate-800 dark:text-slate-200',
                  4: 'text-sm font-medium text-slate-700 dark:text-slate-300',
                  5: 'text-sm font-medium text-slate-700 dark:text-slate-300',
                  6: 'text-sm font-medium text-slate-700 dark:text-slate-300'
                };
                return (
                  <div key={index} className={`${sizes[level]} mt-6 first:mt-0`}>
                    {text}
                  </div>
                );
              }
              
              if (line.match(/^[•\-*]\s/)) {
                return (
                  <div key={index} className="flex items-start gap-3 my-2">
                    <span className="text-slate-400 dark:text-slate-500 mt-1">•</span>
                    <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">{line.replace(/^[•\-*]\s/, '')}</div>
                  </div>
                );
              }
              
              if (line.match(/^\d+\.\s/)) {
                const number = line.match(/^\d+/)?.[0] || '1';
                return (
                  <div key={index} className="flex items-start gap-3 my-2">
                    <span className="text-slate-400 dark:text-slate-500 mt-1">{number}.</span>
                    <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">{line.replace(/^\d+\.\s/, '')}</div>
                  </div>
                );
              }
              
              return (
                <div key={index} className="my-3 text-sm text-slate-700 dark:text-slate-300">
                  {line}
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      )}
    </div>
  )
} 