import OpenAI from 'openai';

type AiProvider = 'deepseek' | 'openai';

// Same provider-preference contract as apps/api/src/lib/ai.ts (DeepSeek
// first, OpenAI fallback) - a separate copy because the worker and API are
// independently deployable services, not because the logic differs.
function preferredProvider(): AiProvider | null {
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

export function aiConfigured(): boolean {
  return preferredProvider() !== null;
}

/** Returns the model's reply, or null when no provider is configured or the call failed. */
export async function aiChat(systemPrompt: string, userMessage: string): Promise<string | null> {
  const provider = preferredProvider();
  if (!provider) return null;

  const client = new OpenAI(
    provider === 'deepseek'
      ? { apiKey: process.env.DEEPSEEK_API_KEY, baseURL: process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com/v1' }
      : { apiKey: process.env.OPENAI_API_KEY },
  );
  const model = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });
    return completion.choices[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
