-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Role-Based RLS Enhancement
-- Adds role-aware RLS policies to sensitive financial and PII tables
-- References org_memberships.role instead of legacy profiles.role
-- Adds DB-backed brand table for multi-tenant brand config
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: HELPER FUNCTION — Get user role in org via org_memberships
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM org_memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND is_default = true
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_exec_or_pm()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_memberships
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND is_default = true
          AND role IN ('exec', 'pm')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_exec()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM org_memberships
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND is_default = true
          AND role = 'exec'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: ROLE-BASED RLS ON FINANCIAL TABLES
-- Restrict vendor/client access to sensitive financial data
-- ─────────────────────────────────────────────────────────────────────────────

-- Invoices: vendors can only see invoices where they are the vendor
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        -- Drop existing overly-permissive policy if it exists
        DROP POLICY IF EXISTS "invoices_org_isolation" ON invoices;
        DROP POLICY IF EXISTS "invoices_role_read" ON invoices;

        CREATE POLICY "invoices_role_read" ON invoices
            FOR SELECT USING (
                auth.uid() IS NOT NULL
                AND (
                    is_exec_or_pm()
                    OR (get_user_role() = 'client' AND EXISTS (
                        SELECT 1 FROM projects p
                        WHERE p.id = invoices.project_id
                        AND p.organization_id IN (
                            SELECT organization_id FROM org_memberships
                            WHERE user_id = auth.uid() AND status = 'active'
                        )
                    ))
                    OR (get_user_role() = 'vendor' AND invoices.vendor_id IN (
                        SELECT id FROM vendors
                        WHERE contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
                    ))
                )
            );
    END IF;
END $$;

-- Budgets: only exec and pm can see budget details
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budgets') THEN
        DROP POLICY IF EXISTS "budgets_org_isolation" ON budgets;
        DROP POLICY IF EXISTS "budgets_role_read" ON budgets;

        CREATE POLICY "budgets_role_read" ON budgets
            FOR SELECT USING (
                auth.uid() IS NOT NULL AND is_exec_or_pm()
            );
    END IF;
END $$;

-- Payroll: exec only
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_batches') THEN
        DROP POLICY IF EXISTS "payroll_batches_org_isolation" ON payroll_batches;
        DROP POLICY IF EXISTS "payroll_exec_only" ON payroll_batches;

        CREATE POLICY "payroll_exec_only" ON payroll_batches
            FOR SELECT USING (
                auth.uid() IS NOT NULL AND is_exec()
            );
    END IF;
END $$;

-- Rate cards: exec and pm only
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_cards') THEN
        DROP POLICY IF EXISTS "rate_cards_org_isolation" ON rate_cards;
        DROP POLICY IF EXISTS "rate_cards_role_read" ON rate_cards;

        CREATE POLICY "rate_cards_role_read" ON rate_cards
            FOR SELECT USING (
                auth.uid() IS NOT NULL AND is_exec_or_pm()
            );
    END IF;
END $$;

-- GL Accounts: exec only
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gl_accounts') THEN
        DROP POLICY IF EXISTS "gl_accounts_read" ON gl_accounts;
        DROP POLICY IF EXISTS "gl_accounts_exec_only" ON gl_accounts;

        CREATE POLICY "gl_accounts_exec_only" ON gl_accounts
            FOR SELECT USING (
                auth.uid() IS NOT NULL AND is_exec()
            );
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: DB-BACKED BRANDS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,

    -- Colors (HSL strings)
    color_primary TEXT DEFAULT '220 70% 50%',
    color_accent TEXT DEFAULT '31 97% 60%',
    color_background TEXT DEFAULT '220 15% 8%',
    color_foreground TEXT DEFAULT '0 0% 100%',
    color_muted TEXT DEFAULT '215 20% 65%',

    -- Typography
    font_family TEXT DEFAULT 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
    font_heading TEXT,
    font_mono TEXT DEFAULT 'var(--font-geist-mono), ui-monospace, monospace',

    -- Assets
    logo_icon_url TEXT,
    logo_wordmark_url TEXT,
    favicon_url TEXT,

    -- Support
    support_email TEXT,
    support_phone TEXT,
    support_url TEXT,

    -- Social
    social_links JSONB DEFAULT '{}',

    -- Feature toggles
    enable_dark_mode BOOLEAN DEFAULT true,
    enable_animations BOOLEAN DEFAULT true,
    enable_glass_effects BOOLEAN DEFAULT true,

    -- Custom domain
    custom_domain TEXT,

    -- Lifecycle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_key ON brands(key);
CREATE INDEX IF NOT EXISTS idx_brands_org ON brands(organization_id);

CREATE TRIGGER set_updated_at_brands
    BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Brands readable by org members
CREATE POLICY "brands_read" ON brands
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            organization_id IS NULL
            OR organization_id IN (
                SELECT organization_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Only exec can manage brands
CREATE POLICY "brands_manage" ON brands
    FOR ALL USING (
        auth.uid() IS NOT NULL
        AND organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid() AND status = 'active' AND role = 'exec'
        )
    );

-- Seed default brand from existing file config
INSERT INTO brands (key, label, color_primary, color_accent, font_family, logo_icon_url, enable_dark_mode, enable_animations, enable_glass_effects)
VALUES (
    'playbook',
    'Playbook',
    '220 70% 50%',
    '31 97% 60%',
    'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
    '/logo-icon.svg',
    true,
    true,
    true
) ON CONFLICT (key) DO NOTHING;

INSERT INTO brands (key, label, color_primary, color_accent, logo_icon_url, enable_dark_mode, enable_animations, enable_glass_effects)
VALUES (
    'rilla',
    'Rilla',
    '150 60% 45%',
    '45 90% 55%',
    '/brands/rilla/logo-icon.svg',
    true,
    true,
    false
) ON CONFLICT (key) DO NOTHING;
