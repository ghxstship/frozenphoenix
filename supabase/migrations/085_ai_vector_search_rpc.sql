/* ═══════════════════════════════════════════════════════════════
   Migration 085 — AI Vector Search RPC + 084 Repair
   
   1. Repairs missing objects from 084 if they were not created
      (e.g. when pgvector was unavailable on the hosted project).
   2. Creates the match_document_chunks RPC + ivfflat index
      ONLY if pgvector is available.
   
   Safe to run on both local (all objects exist) and remote
   (objects may be missing). Uses IF NOT EXISTS / DO $$ guards.
   ═══════════════════════════════════════════════════════════════ */

-- ─── 1. Attempt to enable pgvector (no-op if already enabled or unavailable) ──
DO $$ BEGIN
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available on this project — vector features will be skipped';
END $$;

-- ─── 2. Repair missing enums from 084 ─────────────────────────────────────────
DO $$ BEGIN CREATE TYPE ai_provider_key AS ENUM (
    'anthropic', 'openai', 'google', 'ollama', 'mistral', 'groq'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE ai_message_role AS ENUM (
    'user', 'assistant', 'system', 'tool_call', 'tool_result'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE ai_document_source_type AS ENUM (
    'upload', 'sop', 'handbook', 'template', 'proposal', 'runsheet'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE ai_document_processing_status AS ENUM (
    'pending', 'chunking', 'embedding', 'ready', 'failed'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 3. Repair missing tables from 084 (IF NOT EXISTS) ────────────────────────

CREATE TABLE IF NOT EXISTS ai_providers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_key ai_provider_key NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT false,
    api_base_url TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_models (
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

CREATE TABLE IF NOT EXISTS ai_api_keys (
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

CREATE TABLE IF NOT EXISTS ai_conversations (
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

CREATE TABLE IF NOT EXISTS ai_messages (
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

CREATE TABLE IF NOT EXISTS ai_system_prompts (
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

CREATE TABLE IF NOT EXISTS ai_usage_logs (
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

CREATE TABLE IF NOT EXISTS ai_usage_limits (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id               TEXT,
    daily_token_limit     INTEGER NOT NULL DEFAULT 100000,
    monthly_token_limit   INTEGER NOT NULL DEFAULT 2000000,
    max_context_per_request INTEGER NOT NULL DEFAULT 50000,
    active                BOOLEAN NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_documents (
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

-- ai_document_chunks — vector column is conditional on pgvector availability
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        EXECUTE '
            CREATE TABLE IF NOT EXISTS ai_document_chunks (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                document_id   UUID NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
                chunk_index   INTEGER NOT NULL,
                content       TEXT NOT NULL,
                token_count   INTEGER NOT NULL DEFAULT 0,
                embedding     extensions.vector(1536),
                metadata      JSONB NOT NULL DEFAULT ''{}''::jsonb,
                created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
            )';
    ELSE
        -- Create without vector column when pgvector unavailable
        CREATE TABLE IF NOT EXISTS ai_document_chunks (
            id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id   UUID NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
            chunk_index   INTEGER NOT NULL,
            content       TEXT NOT NULL,
            token_count   INTEGER NOT NULL DEFAULT 0,
            metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        RAISE NOTICE 'ai_document_chunks created WITHOUT embedding column (pgvector unavailable)';
    END IF;
END $$;

-- ─── 4. Repair missing indexes from 084 ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_org_provider ON ai_api_keys(org_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, org_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_active ON ai_conversations(user_id, archived) WHERE archived = false;
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_role ON ai_messages(conversation_id, role);
CREATE INDEX IF NOT EXISTS idx_ai_system_prompts_org ON ai_system_prompts(org_id, workspace_context);
CREATE INDEX IF NOT EXISTS idx_ai_system_prompts_active ON ai_system_prompts(org_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_org ON ai_usage_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_limits_org ON ai_usage_limits(org_id, role_id);
CREATE INDEX IF NOT EXISTS idx_ai_documents_org ON ai_documents(org_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_ai_document_chunks_doc ON ai_document_chunks(document_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_ai_document_chunks_metadata ON ai_document_chunks USING GIN (metadata);

-- ─── 5. Repair missing triggers from 084 ──────────────────────────────────────
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ai_providers_updated_at') THEN
        CREATE TRIGGER ai_providers_updated_at
            BEFORE UPDATE ON ai_providers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ai_conversations_updated_at') THEN
        CREATE TRIGGER ai_conversations_updated_at
            BEFORE UPDATE ON ai_conversations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ai_system_prompts_updated_at') THEN
        CREATE TRIGGER ai_system_prompts_updated_at
            BEFORE UPDATE ON ai_system_prompts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ─── 6. Repair missing RLS from 084 ───────────────────────────────────────────
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

DO $$ BEGIN
    -- Policies are idempotent — create only if missing
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_providers_read') THEN
        CREATE POLICY ai_providers_read ON ai_providers FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_providers_manage') THEN
        CREATE POLICY ai_providers_manage ON ai_providers FOR ALL TO authenticated USING (is_exec());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_models_read') THEN
        CREATE POLICY ai_models_read ON ai_models FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_models_manage') THEN
        CREATE POLICY ai_models_manage ON ai_models FOR ALL TO authenticated USING (is_exec());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_api_keys_read') THEN
        CREATE POLICY ai_api_keys_read ON ai_api_keys FOR SELECT TO authenticated USING (org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_api_keys_manage') THEN
        CREATE POLICY ai_api_keys_manage ON ai_api_keys FOR ALL TO authenticated USING (org_id = ANY(get_user_org_ids()) AND is_exec());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_conversations_own') THEN
        CREATE POLICY ai_conversations_own ON ai_conversations FOR ALL TO authenticated USING (user_id = auth.uid() AND org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_messages_own') THEN
        CREATE POLICY ai_messages_own ON ai_messages FOR ALL TO authenticated USING (conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_system_prompts_read') THEN
        CREATE POLICY ai_system_prompts_read ON ai_system_prompts FOR SELECT TO authenticated USING (org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_system_prompts_manage') THEN
        CREATE POLICY ai_system_prompts_manage ON ai_system_prompts FOR ALL TO authenticated USING (org_id = ANY(get_user_org_ids()) AND is_exec());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_usage_logs_insert') THEN
        CREATE POLICY ai_usage_logs_insert ON ai_usage_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_usage_logs_read_own') THEN
        CREATE POLICY ai_usage_logs_read_own ON ai_usage_logs FOR SELECT TO authenticated USING (user_id = auth.uid() AND org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_usage_logs_read_admin') THEN
        CREATE POLICY ai_usage_logs_read_admin ON ai_usage_logs FOR SELECT TO authenticated USING (org_id = ANY(get_user_org_ids()) AND is_exec());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_usage_limits_read') THEN
        CREATE POLICY ai_usage_limits_read ON ai_usage_limits FOR SELECT TO authenticated USING (org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_usage_limits_manage') THEN
        CREATE POLICY ai_usage_limits_manage ON ai_usage_limits FOR ALL TO authenticated USING (org_id = ANY(get_user_org_ids()) AND is_exec());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_documents_read') THEN
        CREATE POLICY ai_documents_read ON ai_documents FOR SELECT TO authenticated USING (org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_documents_manage') THEN
        CREATE POLICY ai_documents_manage ON ai_documents FOR ALL TO authenticated USING (org_id = ANY(get_user_org_ids()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_document_chunks_read') THEN
        CREATE POLICY ai_document_chunks_read ON ai_document_chunks FOR SELECT TO authenticated USING (document_id IN (SELECT id FROM ai_documents WHERE org_id = ANY(get_user_org_ids())));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_document_chunks_manage') THEN
        CREATE POLICY ai_document_chunks_manage ON ai_document_chunks FOR ALL TO authenticated USING (document_id IN (SELECT id FROM ai_documents WHERE org_id = ANY(get_user_org_ids())));
    END IF;
END $$;

-- ─── 7. Repair missing seed data from 084 ─────────────────────────────────────
INSERT INTO ai_providers (provider_key, display_name, is_active, api_base_url) VALUES
    ('anthropic', 'Anthropic', true,  NULL),
    ('openai',    'OpenAI',    true,  NULL),
    ('google',    'Google AI', true,  NULL),
    ('ollama',    'Ollama (Local)', false, 'http://localhost:11434'),
    ('mistral',   'Mistral AI',     false, NULL),
    ('groq',      'Groq',           false, NULL)
ON CONFLICT (provider_key) DO NOTHING;

-- Anthropic models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_default)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output, v.is_default
FROM ai_providers p
CROSS JOIN (VALUES
    ('claude-sonnet-4-20250514',  'Claude Sonnet 4',  200000, 64000,  true,  true,  true,  true,  0.003000, 0.015000, true),
    ('claude-opus-4-20250514',    'Claude Opus 4',    200000, 32000,  true,  true,  true,  true,  0.015000, 0.075000, false),
    ('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 200000, 8192,   true,  true,  true,  true,  0.000800, 0.004000, false)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_default)
WHERE p.provider_key = 'anthropic'
ON CONFLICT (provider_id, model_key) DO NOTHING;

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
WHERE p.provider_key = 'openai'
ON CONFLICT (provider_id, model_key) DO NOTHING;

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
WHERE p.provider_key = 'google'
ON CONFLICT (provider_id, model_key) DO NOTHING;

-- Groq models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_active)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output, false
FROM ai_providers p
CROSS JOIN (VALUES
    ('llama-3.3-70b-versatile', 'Llama 3.3 70B (Groq)',      128000, 32768, false, true, true, true, 0.000590, 0.000790),
    ('llama-3.1-8b-instant',    'Llama 3.1 8B Instant (Groq)', 128000, 8192,  false, true, true, true, 0.000050, 0.000080),
    ('mixtral-8x7b-32768',      'Mixtral 8x7B (Groq)',         32768,  4096,  false, true, true, true, 0.000240, 0.000240)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
WHERE p.provider_key = 'groq'
ON CONFLICT (provider_id, model_key) DO NOTHING;

-- Mistral models
INSERT INTO ai_models (provider_id, model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output, is_active)
SELECT p.id, v.model_key, v.display_name, v.context_window, v.max_output_tokens, v.supports_vision, v.supports_tools, v.supports_streaming, v.supports_json_mode, v.cost_per_1k_input, v.cost_per_1k_output, false
FROM ai_providers p
CROSS JOIN (VALUES
    ('mistral-large-latest', 'Mistral Large', 128000, 8192, true,  true,  true,  true,  0.002000, 0.006000),
    ('mistral-small-latest', 'Mistral Small', 128000, 8192, false, true,  true,  true,  0.000200, 0.000600),
    ('mistral-embed',        'Mistral Embed', 8192,   0,    false, false, false, false, 0.000100, 0.000000)
) AS v(model_key, display_name, context_window, max_output_tokens, supports_vision, supports_tools, supports_streaming, supports_json_mode, cost_per_1k_input, cost_per_1k_output)
WHERE p.provider_key = 'mistral'
ON CONFLICT (provider_id, model_key) DO NOTHING;

-- ─── 8. Vector search RPC (conditional on pgvector) ───────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        -- Set search_path so vector type resolves
        SET LOCAL search_path = public, extensions;

        EXECUTE $fn$
            CREATE OR REPLACE FUNCTION match_document_chunks(
                query_embedding text,
                match_count integer DEFAULT 5,
                match_threshold float DEFAULT 0.3,
                filter_org_id uuid DEFAULT NULL,
                filter_source_types text[] DEFAULT NULL,
                filter_document_ids uuid[] DEFAULT NULL
            )
            RETURNS TABLE (
                chunk_id uuid,
                document_id uuid,
                chunk_index integer,
                content text,
                token_count integer,
                metadata jsonb,
                created_at timestamptz,
                document_title text,
                source_type text,
                similarity float
            )
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = public, extensions
            AS $inner$
            DECLARE
                embedding_vector vector(1536);
            BEGIN
                embedding_vector := query_embedding::vector(1536);

                RETURN QUERY
                SELECT
                    c.id AS chunk_id,
                    c.document_id,
                    c.chunk_index,
                    c.content,
                    c.token_count,
                    c.metadata,
                    c.created_at,
                    d.title AS document_title,
                    d.source_type::text,
                    1 - (c.embedding <=> embedding_vector) AS similarity
                FROM ai_document_chunks c
                JOIN ai_documents d ON d.id = c.document_id
                WHERE
                    d.processing_status = 'ready'
                    AND (filter_org_id IS NULL OR d.org_id = filter_org_id)
                    AND (filter_source_types IS NULL OR d.source_type::text = ANY(filter_source_types))
                    AND (filter_document_ids IS NULL OR c.document_id = ANY(filter_document_ids))
                    AND c.embedding IS NOT NULL
                    AND 1 - (c.embedding <=> embedding_vector) >= match_threshold
                ORDER BY c.embedding <=> embedding_vector
                LIMIT match_count;
            END;
            $inner$
        $fn$;

        GRANT EXECUTE ON FUNCTION match_document_chunks TO authenticated;
        GRANT EXECUTE ON FUNCTION match_document_chunks TO service_role;

        -- IVFFlat index for vector similarity search
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ai_document_chunks_embedding
            ON ai_document_chunks
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100)';

        RAISE NOTICE '✓ match_document_chunks RPC + ivfflat index created';
    ELSE
        RAISE NOTICE 'pgvector not available — skipping match_document_chunks RPC and vector index';
    END IF;
END $$;
