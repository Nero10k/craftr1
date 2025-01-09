import OpenAI from 'openai';

// Initialize OpenAI client
let openai: OpenAI | undefined;

// Only initialize if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export function getOpenAIClient() {
  if (!openai) {
    throw new Error(
      'OpenAI is not configured. To use AI features, please add your OPENAI_API_KEY in the admin panel.'
    );
  }
  return openai;
}

/**
 * Check if OpenAI is configured
 * Use this to conditionally render AI features in your UI
 */
export function isOpenAIConfigured(): boolean {
  return !!openai;
}

/**
 * Safely execute an OpenAI operation
 * Returns null if OpenAI is not configured
 */
export async function withOpenAI<T>(
  operation: (client: OpenAI) => Promise<T>
): Promise<T | null> {
  if (!openai) {
    return null;
  }

  try {
    return await operation(openai);
  } catch (error) {
    console.error('OpenAI operation failed:', error);
    throw error;
  }
} 