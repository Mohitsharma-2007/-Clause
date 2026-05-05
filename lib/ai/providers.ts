/**
 * Multi-provider LLM router.
 *
 * Each provider speaks the OpenAI Chat Completions schema. We try them in order
 * and fall back to the next on failure. The first one with a configured key wins.
 *
 * To add keys, set any of these in .env.local:
 *   OPENROUTER_API_KEY        — https://openrouter.ai (many free models)
 *   GITHUB_MODELS_TOKEN       — https://github.com/marketplace/models (free tier, GitHub PAT)
 *   GROQ_API_KEY              — https://console.groq.com (fast free tier)
 *   TOGETHER_API_KEY          — https://api.together.xyz (free credits)
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type Provider = {
  name: string;
  isAvailable: () => boolean;
  call: (messages: ChatMessage[]) => Promise<string>;
};

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let hint = "";
    if (res.status === 401 || res.status === 403) {
      hint = " (API key invalid, revoked, or missing required scope — check your .env.local)";
    } else if (res.status === 429) {
      hint = " (rate limited or quota exhausted — try another provider)";
    } else if (res.status === 400) {
      hint = " (bad request — message schema or model name rejected)";
    }
    throw new Error(`${res.status}${hint}: ${text.slice(0, 200)}`);
  }

  const data: { choices?: { message?: { content?: string } }[] } = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from provider");
  return content;
}

export const providers: Provider[] = [
  {
    name: "openrouter",
    isAvailable: () => !!process.env.OPENROUTER_API_KEY,
    call: (messages) =>
      callOpenAICompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY!,
        process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free",
        messages,
        {
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          "X-Title": "Clause Compliance",
        },
      ),
  },
  {
    name: "github-models",
    isAvailable: () => !!process.env.GITHUB_MODELS_TOKEN,
    call: (messages) =>
      callOpenAICompatible(
        "https://models.inference.ai.azure.com/chat/completions",
        process.env.GITHUB_MODELS_TOKEN!,
        process.env.GITHUB_MODELS_MODEL ?? "gpt-4o-mini",
        messages,
      ),
  },
  {
    name: "groq",
    isAvailable: () => !!process.env.GROQ_API_KEY,
    call: (messages) =>
      callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        process.env.GROQ_API_KEY!,
        process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        messages,
      ),
  },
  {
    name: "together",
    isAvailable: () => !!process.env.TOGETHER_API_KEY,
    call: (messages) =>
      callOpenAICompatible(
        "https://api.together.xyz/v1/chat/completions",
        process.env.TOGETHER_API_KEY!,
        process.env.TOGETHER_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages,
      ),
  },
];

/** Run providers in order, returning the first successful response. */
export async function chat(messages: ChatMessage[]): Promise<{ provider: string; content: string }> {
  const available = providers.filter((p) => p.isAvailable());
  if (available.length === 0) {
    throw new Error(
      "No LLM provider configured. Set OPENROUTER_API_KEY (or GITHUB_MODELS_TOKEN / GROQ_API_KEY / TOGETHER_API_KEY) in .env.local.",
    );
  }

  const errors: string[] = [];
  for (const p of available) {
    try {
      const content = await p.call(messages);
      return { provider: p.name, content };
    } catch (err) {
      errors.push(`${p.name}: ${(err as Error).message}`);
    }
  }
  throw new Error(`All providers failed.\n${errors.join("\n")}`);
}

export const FINANCE_SYSTEM_PROMPT = `You are Clause, an AI compliance analyst built for finance and risk teams.

Domain expertise:
- Anti-Money Laundering (AML) and Know-Your-Customer (KYC) frameworks (FATF, BSA, FinCEN, EU AMLD)
- Financial regulations: SOX, MiFID II, Dodd-Frank, Basel III, PCI DSS, GDPR (financial data)
- Fraud detection, sanctions screening (OFAC, UN, EU), market-abuse rules
- SOC 2 Type II, ISO 27001, NIST CSF for financial services

Style:
- Be concise and precise. Cite the specific regulation, article, or section when known.
- If the user describes a transaction or scenario, reason step-by-step against applicable rules.
- If you are uncertain or the question requires firm-specific policy, say so plainly.
- Never invent regulation numbers. If you don't know the exact citation, describe the rule generically.
- Format with short paragraphs and bullet points. No long preambles.

You are not a replacement for licensed legal or compliance counsel. Add a one-line disclaimer only when the user asks for advice on a specific real transaction.`;
