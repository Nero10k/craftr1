import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { topic, tone, ageGroup, customization, headline } = await req.json()

    // Get topic label from value
    const topicMap: { [key: string]: string } = {
      "digital-transformation": "Digital Transformation for MKBs",
      "ecommerce-benefits": "Benefits of E-commerce",
      "social-media": "Social Media Marketing Strategies",
      "tech-operations": "Streamlining Operations with Technology",
      "scaling-business": "Scaling with E-commerce",
      "case-studies": "Success Stories and Case Studies",
    }

    const topicLabel = topic.includes('-')
      ? topic.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : topicMap[topic] || topic

    const prompt = `Create engaging LinkedIn content using this headline: "${headline}"

Topic: ${topicLabel}
Target Audience: ${ageGroup}
Tone: ${tone}
${customization ? `Additional Requirements: ${customization}` : ''}

The content should:
1. Start with the provided headline
2. Have a compelling introduction
3. Include 3-4 key points or insights
4. Provide practical tips or actionable advice
5. End with a thought-provoking conclusion and call to action
6. Use bullet points for better readability
7. Keep each section concise and impactful
8. Include relevant hashtags

Format the content in a clear, structured way that's easy to read on LinkedIn.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0].message.content

    return NextResponse.json({ content })
  } catch (error) {
    console.error("[CONTENT_GENERATION_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 