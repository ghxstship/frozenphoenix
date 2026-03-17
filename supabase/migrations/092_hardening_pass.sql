-- ═══════════════════════════════════════════════════════════════
-- Migration 092: Hardening Pass
-- Enables RLS on integration_catalog (was intentionally skipped
-- in 091 as "public reference data") and adds a permissive
-- read-only policy for authenticated users.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE integration_catalog ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read the catalog (it's reference data)
CREATE POLICY "integration_catalog_select_authenticated"
    ON integration_catalog FOR SELECT
    TO authenticated
    USING (true);

-- Only service_role can mutate catalog rows (admin-only seeds)
CREATE POLICY "integration_catalog_mutate_service_role"
    ON integration_catalog FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
