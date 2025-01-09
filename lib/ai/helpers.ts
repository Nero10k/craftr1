import { withOpenAI } from './config';

/**
 * Generate a completion using GPT-4o
 * Returns null if OpenAI is not configured
 */
export async function generateCompletion({
  prompt,
  model = 'gpt-4o',
  temperature = 0.7,
  max_tokens = 500,
}: {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  return withOpenAI(async (openai) => {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens,
    });

    return response.choices[0].message.content;
  });
}

/**
 * Generate embeddings for text
 * Returns null if OpenAI is not configured
 */
export async function generateEmbedding(text: string) {
  return withOpenAI(async (openai) => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  });
}

/**
 * Stream a chat completion
 * Returns null if OpenAI is not configured
 */
export async function streamCompletion({
  messages,
  model = 'gpt-4o',
  temperature = 0.7,
}: {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  model?: string;
  temperature?: number;
}) {
  return withOpenAI(async (openai) => {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      stream: true,
    });

    return stream;
  });
} 