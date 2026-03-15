-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 087: Edge Function Hardening
-- Resolves FULLSTACK_AUDIT_REPORT_V6 §10 BUG-003 + BUG-004
--
-- 1. Atomic error count increment RPC for provider_connections
-- 2. Unique index on provider_connections(webhook_secret) for disambiguation
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Atomic increment RPC — eliminates race condition in concurrent webhooks
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_connection_error_count(
    p_connection_id UUID,
    p_error_threshold INTEGER DEFAULT 10
)
RETURNS INTEGER AS $$
DECLARE
    v_new_count INTEGER;
BEGIN
    UPDATE provider_connections
    SET error_count = error_count + 1,
        is_active = CASE
            WHEN error_count + 1 >= p_error_threshold THEN false
            ELSE is_active
        END
    WHERE id = p_connection_id
    RETURNING error_count INTO v_new_count;

    RETURN COALESCE(v_new_count, -1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Unique partial index on webhook_secret for active connections
--    Ensures webhook disambiguation: each active connection has a unique secret
--    so inbound webhooks can be matched to the correct org/connection.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_connections_webhook_secret_active
    ON provider_connections(webhook_secret)
    WHERE is_active = true AND webhook_secret IS NOT NULL AND webhook_secret != '';
