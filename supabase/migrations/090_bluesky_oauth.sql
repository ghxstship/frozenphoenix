-- ============================================================
-- 090: Bluesky AT Protocol OAuth Integration
-- Adds DID/handle columns to user_profiles and creates
-- state/session stores for @atproto/oauth-client-node.
-- ============================================================

-- ─── 1. Add atproto identity columns to user_profiles ────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS atproto_did    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bluesky_handle TEXT;

COMMENT ON COLUMN public.user_profiles.atproto_did IS 'AT Protocol Decentralized Identifier (did:plc:... or did:web:...)';
COMMENT ON COLUMN public.user_profiles.bluesky_handle IS 'Bluesky handle (e.g. user.bsky.social)';

CREATE INDEX IF NOT EXISTS idx_user_profiles_atproto_did
  ON public.user_profiles (atproto_did) WHERE atproto_did IS NOT NULL;

-- ─── 2. OAuth state store (ephemeral, used during auth flow) ─
CREATE TABLE IF NOT EXISTS public.bluesky_oauth_states (
  key         TEXT PRIMARY KEY,
  state       JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

COMMENT ON TABLE public.bluesky_oauth_states IS 'Ephemeral AT Protocol OAuth state during authorization flow';

-- Auto-cleanup expired states
CREATE INDEX IF NOT EXISTS idx_bluesky_oauth_states_expires
  ON public.bluesky_oauth_states (expires_at);

-- ─── 3. OAuth session store (persistent, keyed by DID) ───────
CREATE TABLE IF NOT EXISTS public.bluesky_oauth_sessions (
  key         TEXT PRIMARY KEY,
  session     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.bluesky_oauth_sessions IS 'Persistent AT Protocol OAuth sessions keyed by DID';

-- ─── 4. RLS ──────────────────────────────────────────────────
ALTER TABLE public.bluesky_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bluesky_oauth_sessions ENABLE ROW LEVEL SECURITY;

-- These tables are only accessed by the service role (server-side API routes).
-- No user-facing RLS policies needed — service_role bypasses RLS.

-- ─── 5. Cleanup function for expired states ──────────────────
CREATE OR REPLACE FUNCTION public.cleanup_expired_bluesky_oauth_states()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.bluesky_oauth_states WHERE expires_at < now();
$$;

COMMENT ON FUNCTION public.cleanup_expired_bluesky_oauth_states IS 'Removes expired AT Protocol OAuth state entries';
