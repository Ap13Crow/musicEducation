import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export type Provider = 'claude' | 'openai' | 'deepseek';

function preferredProvider(): Provider {
  if (process.env.CLAUDE_API_KEY) return 'claude';
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.OPENAI_API_KEY) return 'openai';
  throw new Error('No AI provider configured. Set CLAUDE_API_KEY, OPENAI_API_KEY, or DEEPSEEK_API_KEY.');
}

export async function chat(systemPrompt: string, userMessage: string): Promise<string> {
  const provider = preferredProvider();

  if (provider === 'claude') {
    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const block = msg.content[0];
    return block.type === 'text' ? block.text : '';
  }

  const openaiClient = new OpenAI(
    provider === 'deepseek'
      ? {
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com/v1',
        }
      : { apiKey: process.env.OPENAI_API_KEY },
  );

  const model = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
  const completion = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content ?? '';
}
