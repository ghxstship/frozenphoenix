# AI Copilot System — Migration Checklist

## Dependencies (package.json additions)

| Package                 | Version   | Purpose                                    |
| ----------------------- | --------- | ------------------------------------------ |
| `@anthropic-ai/sdk`     | `^0.39.0` | Claude adapter (default provider)          |
| `openai`                | `^4.78.0` | OpenAI/GPT adapter                         |
| `@google/generative-ai` | `^0.22.0` | Gemini adapter                             |
| `ollama`                | `^0.5.12` | Ollama local model adapter                 |
| `@mistralai/mistralai`  | `^1.5.0`  | Mistral adapter (stub)                     |
| `groq-sdk`              | `^0.9.0`  | Groq adapter (stub)                        |
| `tiktoken`              | `^1.0.18` | Token counting (context window management) |
| `pdf-parse`             | `^1.1.1`  | PDF text extraction (RAG ingestion)        |
| `mammoth`               | `^1.8.0`  | DOCX text extraction (RAG ingestion)       |
| `xlsx`                  | `^0.18.5` | XLSX text extraction (RAG ingestion)       |

## Environment Variables (.env.local additions)

```env
AI_ENCRYPTION_SECRET=         # AES-256-GCM key for API key encryption (required)
AI_DEFAULT_PROVIDER=anthropic
AI_DEFAULT_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=            # Optional: org-level fallback (per-org keys preferred)
OPENAI_API_KEY=               # Optional
GOOGLE_AI_API_KEY=            # Optional
OLLAMA_BASE_URL=              # Optional: defaults to http://localhost:11434
```

---

## Phase 1 — Provider Abstraction Layer

### New Files

| File                               | Purpose                                                                                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/ai/types.ts`              | `IModelProvider`, `ModelDefinition`, `ProviderCapabilities`, `ModerationResult`, `CopilotChunk`, `ChatMessage`, `CompletionOptions`, `EmbeddingResult` interfaces |
| `src/lib/ai/model-registry.ts`     | `ModelRegistry` singleton — adapter registration, lookup by provider/model key, default resolution                                                                |
| `src/lib/ai/encryption.ts`         | AES-256-GCM encrypt/decrypt for API keys using `AI_ENCRYPTION_SECRET`                                                                                             |
| `src/lib/ai/adapters/anthropic.ts` | `AnthropicAdapter` — full `IModelProvider` implementation (chat, complete, embed, moderate, streaming)                                                            |
| `src/lib/ai/adapters/openai.ts`    | `OpenAIAdapter` — full implementation                                                                                                                             |
| `src/lib/ai/adapters/google.ts`    | `GoogleAdapter` — full implementation                                                                                                                             |
| `src/lib/ai/adapters/ollama.ts`    | `OllamaAdapter` — full implementation for local/self-hosted                                                                                                       |
| `src/lib/ai/adapters/mistral.ts`   | `MistralAdapter` — stub with interface                                                                                                                            |
| `src/lib/ai/adapters/groq.ts`      | `GroqAdapter` — stub with interface                                                                                                                               |
| `src/lib/ai/adapters/index.ts`     | Barrel export                                                                                                                                                     |
| `src/lib/ai/index.ts`              | Barrel export for entire AI module                                                                                                                                |

---

## Phase 2 — Database Schema

### New Migration

| File                                                | Tables Created                                                                                                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/084_ai_copilot_foundation.sql` | `ai_providers`, `ai_models`, `ai_api_keys`, `ai_conversations`, `ai_messages`, `ai_system_prompts`, `ai_usage_logs`, `ai_usage_limits`, `ai_documents`, `ai_document_chunks` |

### Table DDL Summary

- **ai_providers** — 7 cols, CHECK on `provider_key` enum, org_id FK, RLS
- **ai_models** — 14 cols, FK → ai_providers, unique (provider_id, model_key), RLS
- **ai_api_keys** — 10 cols, FK → ai_providers + organizations + user_profiles, encrypted_key TEXT, RLS
- **ai_conversations** — 10 cols, FK → user_profiles + ai_models, workspace_context enum, RLS
- **ai_messages** — 11 cols, FK → ai_conversations + ai_models, role enum, append-only pattern, RLS
- **ai_system_prompts** — 10 cols, workspace_context enum, role_id FK nullable, version tracking, RLS
- **ai_usage_logs** — 12 cols, append-only (no UPDATE/DELETE RLS), FK chain to providers/models/users/orgs, RLS
- **ai_usage_limits** — 8 cols, FK → organizations, nullable role_id for per-role limits, RLS
- **ai_documents** — 10 cols, FK → organizations, processing_status enum, RLS
- **ai_document_chunks** — 8 cols, FK → ai_documents, vector(1536) column, GIN index on metadata, RLS

### Requires: `pgvector` extension enabled in Supabase project

### Seed Data

- Pre-populate `ai_providers` with 6 providers (anthropic, openai, google, ollama, mistral, groq)
- Pre-populate `ai_models` with current model catalogs for Claude, GPT, Gemini

---

## Phase 3 — Copilot Engine

### New Files

| File                                         | Purpose                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/lib/ai/copilot/context-builder.ts`      | System prompt assembly, workspace context injection, conversation history truncation, token counting |
| `src/lib/ai/copilot/stream-manager.ts`       | Unified SSE streaming handler, normalizes provider chunks → `CopilotChunk`                           |
| `src/lib/ai/copilot/tool-orchestrator.ts`    | Routes model tool calls → internal platform actions (queryDatabase, searchEvents, etc.)              |
| `src/lib/ai/copilot/tool-definitions.ts`     | JSON Schema tool definitions for all platform tools                                                  |
| `src/lib/ai/copilot/conversation-manager.ts` | History persistence, title auto-generation, branching, context carryover                             |
| `src/lib/ai/copilot/rate-limiter.ts`         | Per-user/role/org token budget checks, pre-request validation                                        |
| `src/lib/ai/copilot/index.ts`                | Barrel export                                                                                        |

---

## Phase 4 — RAG Pipeline

### New Files

| File                           | Purpose                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `src/lib/ai/rag/chunker.ts`    | Fixed-size + section-aware chunking strategies                                       |
| `src/lib/ai/rag/embedder.ts`   | Embedding generation via IModelProvider abstraction                                  |
| `src/lib/ai/rag/retriever.ts`  | `retrieveContext(query, filters)` → `RankedChunk[]` with top-k, similarity threshold |
| `src/lib/ai/rag/ingestion.ts`  | Upload → extract → chunk → embed → store pipeline                                    |
| `src/lib/ai/rag/extractors.ts` | PDF/DOCX/XLSX text extraction                                                        |
| `src/lib/ai/rag/index.ts`      | Barrel export                                                                        |

---

## Phase 5 — Admin Settings UI

### New Files (Implemented)

| File                                       | Purpose                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `src/app/(dashboard)/settings/ai/page.tsx` | AI Settings hub — single page with inline tabbed panels (Providers, Models, Prompts, Usage, Knowledge Base, Limits) |

### Modified Files (Implemented)

| File                       | Change                                          |
| -------------------------- | ----------------------------------------------- |
| `src/config/navigation.ts` | Add AI Copilot nav item under Settings children |

---

## Phase 6 — Copilot UI Components (Implemented)

### New Files

| File                                               | Purpose                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/components/copilot/copilot-panel.tsx`         | Slide-out side panel via `SlidePanel`, SSE streaming chat, `CopilotButton` trigger          |
| `src/components/copilot/copilot-input.tsx`         | Auto-resizing textarea with send/stop buttons, keyboard shortcuts                           |
| `src/components/copilot/copilot-message.tsx`       | Markdown-lite renderer with streaming cursor, copy action, tool call display                |
| `src/components/copilot/copilot-tool-activity.tsx` | Inline tool invocation indicator with pending/done states                                   |
| `src/components/copilot/copilot-suggestions.tsx`   | Context-aware suggestion chips + `getDefaultSuggestions()` utility                          |
| `src/components/copilot/model-badge.tsx`           | Active model display with provider name                                                     |
| `src/components/copilot/index.ts`                  | Barrel export                                                                               |
| `src/hooks/use-copilot.ts`                         | Zustand store for panel state, messages, streaming, draft, model, suggestions, page context |

### Modified Files

| File                             | Change                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| `src/app/(dashboard)/layout.tsx` | Add `<CopilotPanel />` and `useCopilotContext()` alongside MessagingPanel |

---

## Phase 7 — Platform Context Awareness (Implemented)

### New Files

| File                               | Purpose                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/hooks/use-copilot-context.ts` | Reactive hook — detects entity type/ID from URL path + route params, injects into copilot store |

### Integrated Into

- `src/app/(dashboard)/layout.tsx` — `useCopilotContext()` called at dashboard root
- `src/lib/ai/copilot/context-builder.ts` — consumes `pageContext` for system prompt shaping
- `src/components/copilot/copilot-suggestions.tsx` — `getDefaultSuggestions(pageContext)` for context-aware chips

---

## Phase 8 — API Endpoints (Implemented)

### New Files

| File                                               | Purpose                                                                                                          |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/app/api/ai/chat/route.ts`                     | POST — primary streaming chat (SSE), auth, rate limiting, context build, conversation persistence, usage logging |
| `src/app/api/ai/providers/route.ts`                | GET — list providers with API key status (admin only)                                                            |
| `src/app/api/ai/models/route.ts`                   | GET — list models with provider join                                                                             |
| `src/app/api/ai/prompts/route.ts`                  | GET — list org system prompts (admin only)                                                                       |
| `src/app/api/ai/usage/route.ts`                    | GET — aggregated usage by day with period filter (admin only)                                                    |
| `src/app/api/ai/documents/route.ts`                | GET — list knowledge base documents (admin only)                                                                 |
| `src/app/api/ai/documents/upload/route.ts`         | POST — multipart file upload → RAG ingestion pipeline                                                            |
| `src/app/api/ai/limits/route.ts`                   | GET — list usage limits per role (admin only)                                                                    |
| `src/app/api/ai/health/route.ts`                   | GET — AI subsystem health (DB, providers, encryption, vector search)                                             |
| `supabase/migrations/085_ai_vector_search_rpc.sql` | `match_document_chunks` RPC function + IVFFlat index for pgvector                                                |

---

## Phase 9 — DevEx & Infrastructure (Implemented)

### New Files

| File                  | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `docs/AI_ENV_VARS.md` | Complete env var documentation for the AI subsystem |

### Modified Files

| File                       | Change                                          |
| -------------------------- | ----------------------------------------------- |
| `src/config/navigation.ts` | Add AI Copilot nav item under Settings children |

### Notes

- All AI SDK dependencies were already present in `package.json` (added during Phase 1)
- Provider failover, seed script, and usage-logger are handled inline in existing files (rate-limiter, migration seed data, chat route)
- Encryption is implemented in `src/lib/ai/encryption.ts` (Phase 1)

---

## Total File Count (Actual)

| Category             | New Files | Modified Files |
| -------------------- | --------- | -------------- |
| Provider Abstraction | 11        | 0              |
| Database Migrations  | 2         | 0              |
| Copilot Engine       | 7         | 0              |
| RAG Pipeline         | 6         | 0              |
| Admin Settings UI    | 1         | 1              |
| Copilot UI           | 8         | 1              |
| Context Awareness    | 1         | 0              |
| API Endpoints        | 9         | 0              |
| Documentation        | 2         | 0              |
| **Total**            | **47**    | **2**          |

---

## Zero-Breaking-Change Guarantees

1. All new tables — no existing table modifications
2. RBAC additions are additive (new resources, no permission removals)
3. Navigation additions only (new nav item in Admin)
4. Layout addition only (CopilotPanel alongside existing MessagingPanel)
5. All copilot tool calls enforce existing RLS + RBAC gates
6. No direct DB writes from copilot in Phase 1 — read-only + doc generation
7. API keys encrypted at rest, never exposed to client, never logged
