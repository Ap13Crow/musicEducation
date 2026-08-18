import OpenAI from 'openai';

type AiProvider = 'deepseek' | 'openai';

// DeepSeek preferred (the platform's primary provider going forward), then
// OpenAI as a fallback if only that key is configured. Both are OpenAI
// wire-compatible, so one client class covers both via baseURL. Claude is
// intentionally not wired here - packages/mcp-server has its own separate
// three-provider chat() for MCP tool use; this is a small, GraphQL-resolver-
// only helper for advisory text (assessment reports, event classification),
// per CLAUDE.md: AI never mutates payment/entitlement/progress/XP state -
// those stay deterministic; AI only ever produces narrative/classification
// text that callers must treat as optional.
function preferredProvider(): AiProvider | null {
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

export function aiConfigured(): boolean {
  return preferredProvider() !== null;
}

/**
 * Returns the model's reply, or null when no provider is configured or the
 * call failed - every caller must have a sane fallback rather than let an
 * optional AI feature break a user-facing mutation or query.
 */
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
      max_tokens: 600,
    });
    return completion.choices[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
