# AI Copilot — Environment Variables

All AI-related environment variables required to run the copilot subsystem.

## Required

| Variable                    | Description                                                                                                                       | Example                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for RLS-bypassed admin operations (conversations, usage logging, tool execution). Already used by the platform.  | `eyJhbGciOiJIUzI1NiIs...`        |
| `AI_ENCRYPTION_SECRET`      | 32-byte hex string for AES-256-GCM encryption of provider API keys stored in `ai_api_keys`. Generate with `openssl rand -hex 32`. | `a1b2c3d4e5f6...` (64 hex chars) |

## Provider API Keys (stored encrypted in DB)

Provider API keys are **not** stored as env vars. They are entered via the Admin Settings UI (`/settings/ai`), encrypted with `AI_ENCRYPTION_SECRET`, and stored in the `ai_api_keys` table.

Supported providers:

- **OpenAI** — `sk-...`
- **Anthropic** — `sk-ant-...`
- **Google (Gemini)** — `AIza...`
- **Mistral** — `...`
- **Groq** — `gsk_...`
- **Ollama** — No API key needed (self-hosted)

## Optional

| Variable                         | Description                                                       | Default                    |
| -------------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `OLLAMA_BASE_URL`                | Base URL for self-hosted Ollama instance                          | `http://localhost:11434`   |
| `AI_DEFAULT_PROVIDER`            | Provider key to use when no org-level default is set              | `anthropic`                |
| `AI_DEFAULT_MODEL`               | Model key to use when no org-level default is set                 | `claude-sonnet-4-20250514` |
| `AI_MAX_CONTEXT_TOKENS`          | Maximum tokens for context window (system prompt + history + RAG) | `100000`                   |
| `AI_RATE_LIMIT_FALLBACK_DAILY`   | Fallback daily token limit if no `ai_usage_limits` row exists     | `500000`                   |
| `AI_RATE_LIMIT_FALLBACK_MONTHLY` | Fallback monthly token limit                                      | `10000000`                 |

## Local Development

```bash
# .env.local
AI_ENCRYPTION_SECRET=your_64_hex_char_secret_here

# Optional for local Ollama
OLLAMA_BASE_URL=http://localhost:11434
```

## Migrations

Run the following migrations in order:

1. `084_ai_copilot_foundation.sql` — 10 AI tables + pgvector extension + seed data
2. `085_ai_vector_search_rpc.sql` — Vector similarity search function + IVFFlat index
