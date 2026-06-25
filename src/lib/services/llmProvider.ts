import type { ProviderMode } from "../types";

// ============================================================================
// LLM provider abstraction.
//
// - If an OpenAI-compatible API key is configured via env vars, real calls are
//   made to `${OPENAI_BASE_URL}/chat/completions`.
// - Otherwise we fall back to the deterministic mock brain (no key required).
//
// Configure via .env.local:
//   OPENAI_API_KEY   = sk-...            (presence switches to LLM mode)
//   OPENAI_BASE_URL  = https://api.openai.com/v1   (optional, OpenAI-compatible)
//   OPENAI_MODEL     = gpt-4o-mini       (optional)
//   BOARDROOM_FORCE_MOCK = 1             (force demo mode even with a key)
// ============================================================================

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export interface Provider {
  mode: ProviderMode;
  model: string;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
}

export function isLLMConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  const forceMock = process.env.BOARDROOM_FORCE_MOCK === "1";
  return Boolean(key) && !forceMock;
}

class MockProviderClient implements Provider {
  readonly mode: ProviderMode = "mock";
  readonly model = "boardroom-mock-v1";
  async chat(): Promise<string> {
    return "";
  }
}

class OpenAICompatibleProvider implements Provider {
  readonly mode: ProviderMode = "llm";
  readonly model: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY!.trim();
    this.baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.maxTokens ?? 600,
          ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`LLM request failed (${res.status}): ${body.slice(0, 200)}`);
      }
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(timeout);
    }
  }
}

let cached: Provider | null = null;

export function getProvider(): Provider {
  if (cached) return cached;
  cached = isLLMConfigured() ? new OpenAICompatibleProvider() : new MockProviderClient();
  return cached;
}

/** For tests / hot-reload: drop the cached provider. */
export function resetProvider(): void {
  cached = null;
}
