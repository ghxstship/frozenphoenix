-- ═══════════════════════════════════════════════════════════════
-- USERNAMES & PUBLIC PROFILES
-- Adds social-media-style handles for user + org discovery/sharing
-- ═══════════════════════════════════════════════════════════════

-- ─── Reserved usernames (system routes, brands, common words) ──
CREATE TABLE reserved_usernames (
    username TEXT PRIMARY KEY,
    reason TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO reserved_usernames (username, reason) VALUES
    ('admin', 'system'), ('api', 'system'), ('app', 'system'),
    ('auth', 'system'), ('billing', 'system'), ('blog', 'system'),
    ('calendar', 'system'), ('cdn', 'system'), ('config', 'system'),
    ('dashboard', 'system'), ('docs', 'system'), ('email', 'system'),
    ('events', 'system'), ('explore', 'system'), ('feed', 'system'),
    ('graphql', 'system'), ('help', 'system'), ('home', 'system'),
    ('inbox', 'system'), ('internal', 'system'), ('invite', 'system'),
    ('jobs', 'system'), ('login', 'system'), ('logout', 'system'),
    ('mail', 'system'), ('manage', 'system'), ('marketplace', 'system'),
    ('me', 'system'), ('notifications', 'system'), ('null', 'system'),
    ('onboarding', 'system'), ('org', 'system'), ('organizations', 'system'),
    ('portal', 'system'), ('privacy', 'system'), ('profile', 'system'),
    ('projects', 'system'), ('public', 'system'), ('root', 'system'),
    ('search', 'system'), ('security', 'system'), ('settings', 'system'),
    ('setup', 'system'), ('signup', 'system'), ('status', 'system'),
    ('support', 'system'), ('system', 'system'), ('teams', 'system'),
    ('terms', 'system'), ('test', 'system'), ('undefined', 'system'),
    ('user', 'system'), ('users', 'system'), ('webhooks', 'system'),
    ('www', 'system'), ('playbook', 'brand'), ('rilla', 'brand'),
    ('frozenphoenix', 'brand'), ('frozen-phoenix', 'brand');

-- ─── Add username + profile visibility to user_profiles ────────
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS username TEXT,
    ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'connections'
        CHECK (profile_visibility IN ('public', 'connections', 'organization', 'private')),
    ADD COLUMN IF NOT EXISTS headline TEXT,
    ADD COLUMN IF NOT EXISTS website_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMPTZ;

-- Case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower
    ON user_profiles (LOWER(username))
    WHERE username IS NOT NULL;

-- Username format constraint: 3-40 chars, alphanumeric + dots/hyphens/underscores,
-- must start and end with alphanumeric
ALTER TABLE user_profiles
    ADD CONSTRAINT chk_username_format
    CHECK (
        username IS NULL
        OR (
            LENGTH(username) BETWEEN 3 AND 40
            AND username ~ '^[a-z0-9][a-z0-9._-]*[a-z0-9]$'
            AND username !~ '\.\.' -- no consecutive dots
            AND username !~ '--'  -- no consecutive hyphens
            AND username !~ '__'  -- no consecutive underscores
        )
    );

-- ─── Add public profile fields to organizations ───────────────
ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS tagline TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS website_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS employee_count_range TEXT
        CHECK (employee_count_range IS NULL OR employee_count_range IN (
            '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
        )),
    ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (profile_visibility IN ('public', 'connections', 'private')),
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- ─── Username change log (immutable audit trail) ──────────────
CREATE TABLE username_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'organization')),
    entity_id UUID NOT NULL,
    old_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_username_change_log_entity
    ON username_change_log (entity_type, entity_id);

-- Hold released usernames for 30-day cooldown
CREATE TABLE released_usernames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'organization')),
    released_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
    released_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimable_after TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_released_usernames_lookup
    ON released_usernames (LOWER(username), claimable_after);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTION: Check username availability
-- Returns: available (bool), reason (text)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION check_username_available(desired_username TEXT)
RETURNS TABLE(available BOOLEAN, reason TEXT) AS $$
DECLARE
    normalized TEXT;
BEGIN
    normalized := LOWER(TRIM(desired_username));

    -- Format check
    IF LENGTH(normalized) < 3 OR LENGTH(normalized) > 40 THEN
        RETURN QUERY SELECT false, 'Username must be 3-40 characters';
        RETURN;
    END IF;

    IF normalized !~ '^[a-z0-9][a-z0-9._-]*[a-z0-9]$' THEN
        RETURN QUERY SELECT false, 'Username must start and end with a letter or number, and can only contain letters, numbers, dots, hyphens, and underscores';
        RETURN;
    END IF;

    -- Reserved check
    IF EXISTS (SELECT 1 FROM reserved_usernames WHERE reserved_usernames.username = normalized) THEN
        RETURN QUERY SELECT false, 'This username is reserved';
        RETURN;
    END IF;

    -- Taken by user check
    IF EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(user_profiles.username) = normalized) THEN
        RETURN QUERY SELECT false, 'This username is already taken';
        RETURN;
    END IF;

    -- Cooldown check (recently released)
    IF EXISTS (
        SELECT 1 FROM released_usernames
        WHERE LOWER(released_usernames.username) = normalized
        AND released_usernames.claimable_after > NOW()
    ) THEN
        RETURN QUERY SELECT false, 'This username was recently released and is not yet available';
        RETURN;
    END IF;

    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- reserved_usernames: read-only for authenticated
ALTER TABLE reserved_usernames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reserved usernames"
    ON reserved_usernames FOR SELECT
    TO authenticated
    USING (true);

-- username_change_log: insert by system, read by owner
ALTER TABLE username_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own username changes"
    ON username_change_log FOR SELECT
    TO authenticated
    USING (
        (entity_type = 'user' AND entity_id = auth.uid())
        OR (entity_type = 'organization' AND entity_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid() AND role = 'exec' AND status = 'active'
        ))
    );

-- released_usernames: read by authenticated (for availability check)
ALTER TABLE released_usernames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can check released usernames"
    ON released_usernames FOR SELECT
    TO authenticated
    USING (true);

-- Public profile read: anyone can read public profiles (for /u/[username] route)
-- We add a permissive SELECT policy that allows reading basic user info
-- The API layer controls which fields are exposed based on visibility setting
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles' AND policyname = 'Public profiles readable by anyone'
    ) THEN
        CREATE POLICY "Public profiles readable by anyone"
            ON user_profiles FOR SELECT
            TO anon, authenticated
            USING (
                profile_visibility = 'public'
                OR id = auth.uid()
            );
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SEED: Add "claim_username" onboarding step
-- ═══════════════════════════════════════════════════════════════
INSERT INTO onboarding_step_definitions (role, step_key, title, description, sort_order, is_required, gate_access)
VALUES (
    'all',
    'claim_username',
    'Claim Your Username',
    'Choose a unique @username for your professional profile — this is how others will find and connect with you.',
    5,
    false,
    false
)
ON CONFLICT (role, step_key) DO NOTHING;
