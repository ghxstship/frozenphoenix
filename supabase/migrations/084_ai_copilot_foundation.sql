-- ═══════════════════════════════════════════════════════════════
-- Migration 084: AI Copilot Foundation
--
-- Creates all tables, enums, RLS policies, indexes, and seed data
-- for the platform-native AI copilot system.
--
-- Tables: ai_providers, ai_models, ai_api_keys, ai_conversations,
--         ai_messages, ai_system_prompts, ai_usage_logs,
--         ai_usage_limits, ai_documents, ai_document_chunks
--
-- Requires: pgvector extension for vector similarity search
-- ═══════════════════════════════════════════════════════════════

-- ─── Enable pgvector extension ───────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ─── Enums ───────────────────────────────────────────────────

CREATE TYPE ai_provider_key AS ENUM (
    'anthropic', 'openai', 'google', 'ollama', 'mistral', 'groq'
);

CREATE TYPE ai_message_role AS ENUM (
    'user', 'assistant', 'system', 'tool_call', 'tool_result'
);

CREATE TYPE ai_document_source_type AS ENUM (
    'upload', 'sop', 'handbook', 'template', 'proposal', 'runsheet'
);

CREATE TYPE ai_document_processing_status AS ENUM (
    'pending', 'chunking', 'embedding', 'ready', 'failed'
);

-- ─── ai_providers ────────────────────────────────────────────

CREATE TABLE ai_providers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_key ai_provider_key NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT false,
    api_base_url TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER ai_providers_updated_at
    BEFORE UPDATE ON ai_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ai_providers IS 'Registry of AI model providers (Anthropic, OpenAI, Google, Ollama, Mistral, Groq)';
COMMENT ON COLUMN ai_providers.api_base_url IS 'Custom endpoint URL for Ollama/self-hosted providers. NULL = use SDK default.';

-- ─── ai_models ───────────────────────────────────────────────

CREATE TABLE ai_models (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id         UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    model_key           TEXT NOT NULL,
    display_name        TEXT NOT NULL,
    context_window      INTEGER NOT NULL DEFAULT 128000,
    max_output_tokens   INTEGER NOT NULL DEFAULT 4096,
    supports_vision     BOOLEAN NOT NULL DEFAULT false,
    supports_tools      BOOLEAN NOT NULL DEFAULT false,
    supports_streaming  BOOLEAN NOT NULL DEFAULT true,
    supports_json_mode  BOOLEAN NOT NULL DEFAULT false,
    cost_per_1k_input   NUMERIC(10, 6) NOT NULL DEFAULT 0,
    cost_per_1k_output  NUMERIC(10, 6) NOT NULL DEFAULT 0,
    is_default          BOOLEAN NOT NULL DEFAULT false,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider_id, model_key)
);

CREATE INDEX idx_ai_models_provider ON ai_models(provider_id);
CREATE INDEX idx_ai_models_active ON ai_models(is_active) WHERE is_active = true;

COMMENT ON TABLE ai_models IS 'Available AI models per provider with capability flags and cost tracking';
COMMENT ON COLUMN ai_models.is_default IS 'Org-wide default model. Only one should be true at a time.';

-- ─── ai_api_keys ─────────────────────────────────────────────

CREATE TABLE ai_api_keys (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id      UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    encrypted_key    TEXT NOT NULL,
    key_hint         TEXT NOT NULL,
    org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by       UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    is_valid         BOOLEAN NOT NULL DEFAULT true,
    last_validated_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    rotated_at       TIMESTAMPTZ
);

CREATE INDEX idx_ai_api_keys_org_provider ON ai_api_keys(org_id, provider_id);

COMMENT ON TABLE ai_api_keys IS 'Encrypted API keys per provider per org. Keys are AES-256-GCM encrypted — NEVER plaintext.';
COMMENT ON COLUMN ai_api_keys.encrypted_key IS 'AES-256-GCM encrypted API key. Decrypted server-side only via AI_ENCRYPTION_SECRET.';
COMMENT ON COLUMN ai_api_keys.key_hint IS 'Last 4 characters of the key for UI display (e.g. "****ab1c").';

-- ─── ai_conversations ────────────────────────────────────────

CREATE TABLE ai_conversations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_context TEXT NOT NULL DEFAULT 'global',
    model_id          UUID REFERENCES ai_models(id) ON DELETE SET NULL,
    title             TEXT NOT NULL DEFAULT 'New Conversation',
    summary           TEXT,
    pinned            BOOLEAN NOT NULL DEFAULT false,
    archived          BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, org_id);
CREATE INDEX idx_ai_conversations_active ON ai_conversations(user_id, archived) WHERE archived = false;

CREATE TRIGGER ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ai_conversations IS 'User copilot conversation threads with workspace context scoping';

-- ─── ai_messages ─────────────────────────────────────────────

CREATE TABLE ai_messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id   UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role              ai_message_role NOT NULL,
    content           TEXT NOT NULL DEFAULT '',
    attachments       JSONB DEFAULT '[]'::jsonb,
    token_count_input  INTEGER NOT NULL DEFAULT 0,
    token_count_output INTEGER NOT NULL DEFAULT 0,
    model_id          UUID REFERENCES ai_models(id) ON DELETE SET NULL,
    latency_ms        INTEGER NOT NULL DEFAULT 0,
    tool_calls        JSONB DEFAULT '[]'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);
CREATE INDEX idx_ai_messages_role ON ai_messages(conversation_id, role);

COMMENT ON TABLE ai_messages IS 'Individual messages within copilot conversations. Append-only pattern.';
COMMENT ON COLUMN ai_messages.attachments IS 'JSONB array of {type, url, base64, mime_type, filename} attachment refs';
COMMENT ON COLUMN ai_messages.tool_calls IS 'JSONB array of tool call records {id, name, arguments, result}';

-- ─── ai_system_prompts ───────────────────────────────────────

CREATE TABLE ai_system_prompts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_context TEXT NOT NULL DEFAULT 'global',
    role_id           TEXT,
    prompt_name       TEXT NOT NULL,
    prompt_text       TEXT NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    version           INTEGER NOT NULL DEFAULT 1,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_system_prompts_org ON ai_system_prompts(org_id, workspace_context);
CREATE INDEX idx_ai_system_prompts_active ON ai_system_prompts(org_id, is_active) WHERE is_active = true;

CREATE TRIGGER ai_system_prompts_updated_at
    BEFORE UPDATE ON ai_system_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ai_system_prompts IS 'Role-aware system prompts per workspace context. Version-tracked for audit.';
COMMENT ON COLUMN ai_system_prompts.role_id IS 'RBAC role this prompt targets (exec, director, pm, member, client, collaborator). NULL = all roles.';

-- ─── ai_usage_logs ───────────────────────────────────────────

CREATE TABLE ai_usage_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider_id        UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    model_id           UUID REFERENCES ai_models(id) ON DELETE SET NULL,
    token_count_input  INTEGER NOT NULL DEFAULT 0,
    token_count_output INTEGER NOT NULL DEFAULT 0,
    estimated_cost     NUMERIC(12, 8) NOT NULL DEFAULT 0,
    endpoint_called    TEXT NOT NULL,
    response_status    INTEGER NOT NULL DEFAULT 200,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_logs_org ON ai_usage_logs(org_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_user ON ai_usage_logs(user_id, created_at DESC);
COMMENT ON TABLE ai_usage_logs IS 'Append-only token usage and cost log. No UPDATE or DELETE permitted.';

-- ─── ai_usage_limits ─────────────────────────────────────────

CREATE TABLE ai_usage_limits (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id               TEXT,
    daily_token_limit     INTEGER NOT NULL DEFAULT 100000,
    monthly_token_limit   INTEGER NOT NULL DEFAULT 2000000,
    max_context_per_request INTEGER NOT NULL DEFAULT 50000,
    active                BOOLEAN NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_limits_org ON ai_usage_limits(org_id, role_id);

COMMENT ON TABLE ai_usage_limits IS 'Token budgets per org and optionally per role. NULL role_id = org-wide default.';

-- ─── ai_documents (RAG) ──────────────────────────────────────

CREATE TABLE ai_documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type       ai_document_source_type NOT NULL DEFAULT 'upload',
    title             TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    storage_path      TEXT NOT NULL,
    processing_status ai_document_processing_status NOT NULL DEFAULT 'pending',
    chunk_count       INTEGER NOT NULL DEFAULT 0,
    total_tokens      INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_documents_org ON ai_documents(org_id, processing_status);

COMMENT ON TABLE ai_documents IS 'RAG knowledge base documents. Tracks ingestion pipeline status.';

-- ─── ai_document_chunks (RAG + pgvector) ─────────────────────

CREATE TABLE ai_document_chunks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id   UUID NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
    chunk_index   INTEGER NOT NULL,
    content       TEXT NOT NULL,
    token_count   INTEGER NOT NULL DEFAULT 0,
    embedding     extensions.vector(1536),
    metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_document_chunks_doc ON ai_document_chunks(document_id, chunk_index);
CREATE INDEX idx_ai_document_chunks_metadata ON ai_document_chunks USING GIN (metadata);

-- IVFFlat index for vector similarity search (requires > 0 rows to build; created as placeholder)
-- For production, run: CREATE INDEX CONCURRENTLY idx_ai_chunks_embedding ON ai_document_chunks
--   USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE ai_document_chunks IS 'Chunked document content with pgvector embeddings for RAG retrieval';
COMMENT ON COLUMN ai_document_chunks.embedding IS 'Vector(1536) embedding for cosine similarity search via pgvector';
COMMENT ON COLUMN ai_document_chunks.metadata IS 'JSONB: {page_number, section_header, source_context}';

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_chunks ENABLE ROW LEVEL SECURITY;

-- ai_providers: read by all authenticated, manage by exec/admin
CREATE POLICY ai_providers_read ON ai_providers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY ai_providers_manage ON ai_providers
    FOR ALL TO authenticated
    USING (is_exec());

-- ai_models: read by all authenticated, manage by exec/admin
CREATE POLICY ai_models_read ON ai_models
    FOR SELECT TO authenticated USING (true);

CREATE POLICY ai_models_manage ON ai_models
    FOR ALL TO authenticated
    USING (is_exec());

-- ai_api_keys: org-scoped, manage by exec/admin only
CREATE POLICY ai_api_keys_read ON ai_api_keys
    FOR SELECT TO authenticated
    USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY ai_api_keys_manage ON ai_api_keys
    FOR ALL TO authenticated
    USING (
        org_id = ANY(get_user_org_ids())
        AND is_exec()
    );

-- ai_conversations: user owns their own conversations
CREATE POLICY ai_conversations_own ON ai_conversations
    FOR ALL TO authenticated
    USING (user_id = auth.uid() AND org_id = ANY(get_user_org_ids()));

-- ai_messages: access through conversation ownership
CREATE POLICY ai_messages_own ON ai_messages
    FOR ALL TO authenticated
    USING (
        conversation_id IN (
            SELECT id FROM ai_conversations
            WHERE user_id = auth.uid()
        )
    );

-- ai_system_prompts: org-scoped read for all, manage by exec/admin
CREATE POLICY ai_system_prompts_read ON ai_system_prompts
    FOR SELECT TO authenticated
    USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY ai_system_prompts_manage ON ai_system_prompts
    FOR ALL TO authenticated
    USING (
        org_id = ANY(get_user_org_ids())
        AND is_exec()
    );

-- ai_usage_logs: append-only, users see own, exec sees all in org
CREATE POLICY ai_usage_logs_insert ON ai_usage_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() AND org_id = ANY(get_user_org_ids()));

CREATE POLICY ai_usage_logs_read_own ON ai_usage_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() AND org_id = ANY(get_user_org_ids()));

CREATE POLICY ai_usage_logs_read_admin ON ai_usage_logs
    FOR SELECT TO authenticated
    USING (
        org_id = ANY(get_user_org_ids())
        AND is_exec()
    );

-- No UPDATE or DELETE policies on ai_usage_logs — immutable ledger

-- ai_usage_limits: org-scoped, manage by exec/admin
CREATE POLICY ai_usage_limits_read ON ai_usage_limits
    FOR SELECT TO authenticated
    USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY ai_usage_limits_manage ON ai_usage_limits
    FOR ALL TO authenticated
    USING (
        org_id = ANY(get_user_org_ids())
        AND is_exec()
    );

-- ai_documents: org-scoped
CREATE POLICY ai_documents_read ON ai_documents
    FOR SELECT TO authenticated
    USING (org_id = ANY(get_user_org_ids()));

CREATE POLICY ai_documents_manage ON ai_documents
    FOR ALL TO authenticated
    USING (org_id = ANY(get_user_org_ids()));

-- ai_document_chunks: access through document org ownership
CREATE POLICY ai_document_chunks_read ON ai_document_chunks
    FOR SELECT TO authenticated
    USING (
        document_id IN (
            SELECT id FROM ai_documents
            WHERE org_id = ANY(get_user_org_ids())
        )
    );

CREATE POLICY ai_document_chunks_manage ON ai_document_chunks
    FOR ALL TO authenticated
    USING (
        document_id IN (
            SELECT id FROM ai_documents
            WHERE org_id = ANY(get_user_org_ids())
        )
    );

-- ═══════════════════════════════════════════════════════════════
-- Seed Data — Pre-populate providers and model catalogs
-- ═══════════════════════════════════════════════════════════════

INSERT INTO ai_providers (provider_key, display_name, is_active, api_base_url) VALUES
    ('anthropic', 'Anthropic', true,  NULL),
    ('openai',    'OpenAI',    true,  NULL),
    ('google',    'Google AI', true,  NULL),
    ('ollama',    'Ollama (Local)', false, 'http://localhost:11434'),
    ('mistral',   'Mistral AI',     false, NULL),
    ('groq',      'Groq',           false, NULL);

-- Anthropic models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_default)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output, v.is_default
FROM ai_providers p
CROSS JOIN (VALUES
    ('claude-sonnet-4-20250514',  'Claude Sonnet 4',  200000, 64000,  true,  true,  true,  true,  0.003000, 0.015000, true),
    ('claude-opus-4-20250514',    'Claude Opus 4',    200000, 32000,  true,  true,  true,  true,  0.015000, 0.075000, false),
    ('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 200000, 8192,   true,  true,  true,  true,  0.000800, 0.004000, false)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_default)
WHERE p.provider_key = 'anthropic';

-- OpenAI models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output
FROM ai_providers p
CROSS JOIN (VALUES
    ('gpt-4o',                    'GPT-4o',               128000, 16384,  true,  true,  true,  true,  0.002500, 0.010000),
    ('gpt-4o-mini',               'GPT-4o Mini',          128000, 16384,  true,  true,  true,  true,  0.000150, 0.000600),
    ('o3',                        'o3',                   200000, 100000, true,  true,  true,  true,  0.010000, 0.040000),
    ('o3-mini',                   'o3 Mini',              200000, 100000, false, true,  true,  true,  0.001100, 0.004400),
    ('text-embedding-3-small',    'Embedding 3 Small',    8191,   0,      false, false, false, false, 0.000020, 0.000000),
    ('text-embedding-3-large',    'Embedding 3 Large',    8191,   0,      false, false, false, false, 0.000130, 0.000000)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
WHERE p.provider_key = 'openai';

-- Google models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output
FROM ai_providers p
CROSS JOIN (VALUES
    ('gemini-2.5-pro',        'Gemini 2.5 Pro',        1048576, 65536, true,  true,  true,  true,  0.001250, 0.010000),
    ('gemini-2.5-flash',      'Gemini 2.5 Flash',      1048576, 65536, true,  true,  true,  true,  0.000150, 0.000600),
    ('gemini-2.0-flash',      'Gemini 2.0 Flash',      1048576, 8192,  true,  true,  true,  true,  0.000100, 0.000400),
    ('text-embedding-004',    'Text Embedding 004',    2048,    0,     false, false, false, false, 0.000004, 0.000000)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
WHERE p.provider_key = 'google';

-- Groq models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_active)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output, false
FROM ai_providers p
CROSS JOIN (VALUES
    ('llama-3.3-70b-versatile', 'Llama 3.3 70B (Groq)',      128000, 32768, false, true, true, true, 0.000590, 0.000790),
    ('llama-3.1-8b-instant',    'Llama 3.1 8B Instant (Groq)', 128000, 8192,  false, true, true, true, 0.000050, 0.000080),
    ('mixtral-8x7b-32768',      'Mixtral 8x7B (Groq)',         32768,  4096,  false, true, true, true, 0.000240, 0.000240)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
WHERE p.provider_key = 'groq';

-- Mistral models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_active)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output, false
FROM ai_providers p
CROSS JOIN (VALUES
    ('mistral-large-latest', 'Mistral Large', 128000, 8192, true,  true,  true,  true,  0.002000, 0.006000),
    ('mistral-small-latest', 'Mistral Small', 128000, 8192, false, true,  true,  true,  0.000200, 0.000600),
    ('mistral-embed',        'Mistral Embed', 8192,   0,    false, false, false, false, 0.000100, 0.000000)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
WHERE p.provider_key = 'mistral';

-- ═══════════════════════════════════════════════════════════════
-- Validation assertions
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- Verify all 10 tables exist
    ASSERT (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'ai_%') >= 10,
        'Expected at least 10 ai_* tables';

    -- Verify providers seeded
    ASSERT (SELECT count(*) FROM ai_providers) = 6,
        'Expected 6 AI providers seeded';

    -- Verify models seeded
    ASSERT (SELECT count(*) FROM ai_models) >= 18,
        'Expected at least 18 AI models seeded';

    -- Verify default model exists
    ASSERT (SELECT count(*) FROM ai_models WHERE is_default = true) >= 1,
        'Expected at least 1 default AI model';

    -- Verify RLS enabled on all tables
    ASSERT (SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'ai_%' AND rowsecurity = true) >= 10,
        'Expected RLS enabled on all ai_* tables';

    -- Verify pgvector extension
    ASSERT (SELECT count(*) FROM pg_extension WHERE extname = 'vector') = 1,
        'Expected pgvector extension to be enabled';

    RAISE NOTICE '✓ Migration 084 validation passed — all AI copilot tables, RLS, and seed data verified';
END $$;
