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

    const { topic, tone, ageGroup, customization } = await req.json()

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

    const prompt = `Generate 3 attention-grabbing headlines for a LinkedIn post about "${topicLabel}" targeted at small and medium business (MKB) owners.

Target Audience: ${ageGroup}
Tone: ${tone}
${customization ? `Additional Requirements: ${customization}` : ''}

The headlines should be:
1. Engaging and professional
2. Specific to the topic and audience
3. Compelling enough to make readers want to learn more

Format the response as exactly 3 headlines, one per line, without any numbering or additional text.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 200,
    })

    const content = completion.choices[0].message.content
    const headlines = content?.split('\n').filter(line => line.trim().length > 0) || []

    return NextResponse.json({ headlines })
  } catch (error) {
    console.error("[HEADLINES_GENERATION_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 