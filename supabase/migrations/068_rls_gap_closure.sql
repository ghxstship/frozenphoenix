-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 068: RLS Gap Closure & Policy Upgrade
-- Resolves SCHEMA_OPTIMIZATION_PLAN §6 — RLS Coverage Audit
--
-- 1. Upgrades 022 tables from single-org get_user_org_id() SELECT-only
--    policies to multi-org get_user_org_ids() full CRUD policies
-- 2. Adds explicit INSERT/UPDATE/DELETE policies where only SELECT existed
-- 3. Follows the standard 4-policy pattern from migration 061
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: goods_receipt_lines — Upgrade to multi-org + full CRUD
-- Original (022): single "org_isolation" USING policy only
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON goods_receipt_lines;

CREATE POLICY goods_receipt_lines_select ON goods_receipt_lines
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY goods_receipt_lines_insert ON goods_receipt_lines
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY goods_receipt_lines_update ON goods_receipt_lines
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY goods_receipt_lines_delete ON goods_receipt_lines
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: exchange_rates — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON exchange_rates;

CREATE POLICY exchange_rates_select ON exchange_rates
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY exchange_rates_insert ON exchange_rates
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY exchange_rates_update ON exchange_rates
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY exchange_rates_delete ON exchange_rates
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: financial_periods — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON financial_periods;

CREATE POLICY financial_periods_select ON financial_periods
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY financial_periods_insert ON financial_periods
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY financial_periods_update ON financial_periods
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY financial_periods_delete ON financial_periods
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: incident_insurance_links — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON incident_insurance_links;

CREATE POLICY incident_insurance_links_select ON incident_insurance_links
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY incident_insurance_links_insert ON incident_insurance_links
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY incident_insurance_links_update ON incident_insurance_links
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY incident_insurance_links_delete ON incident_insurance_links
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: sla_definitions — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON sla_definitions;

CREATE POLICY sla_definitions_select ON sla_definitions
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_definitions_insert ON sla_definitions
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_definitions_update ON sla_definitions
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_definitions_delete ON sla_definitions
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: sla_tracking — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON sla_tracking;

CREATE POLICY sla_tracking_select ON sla_tracking
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_tracking_insert ON sla_tracking
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_tracking_update ON sla_tracking
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY sla_tracking_delete ON sla_tracking
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: resilience_targets — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON resilience_targets;

CREATE POLICY resilience_targets_select ON resilience_targets
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY resilience_targets_insert ON resilience_targets
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY resilience_targets_update ON resilience_targets
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY resilience_targets_delete ON resilience_targets
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: idempotency_keys — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON idempotency_keys;

CREATE POLICY idempotency_keys_select ON idempotency_keys
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY idempotency_keys_insert ON idempotency_keys
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY idempotency_keys_update ON idempotency_keys
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY idempotency_keys_delete ON idempotency_keys
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: domain_events — Upgrade to multi-org + full CRUD
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON domain_events;

CREATE POLICY domain_events_select ON domain_events
    FOR SELECT USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY domain_events_insert ON domain_events
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_org_ids()));
CREATE POLICY domain_events_update ON domain_events
    FOR UPDATE USING (organization_id = ANY(get_user_org_ids()));
CREATE POLICY domain_events_delete ON domain_events
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: anonymization_queue — Upgrade to multi-org + exec-only
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org_isolation" ON anonymization_queue;

CREATE POLICY anonymization_queue_select ON anonymization_queue
    FOR SELECT USING (organization_id = ANY(get_user_exec_org_ids()));
CREATE POLICY anonymization_queue_insert ON anonymization_queue
    FOR INSERT WITH CHECK (organization_id = ANY(get_user_exec_org_ids()));
CREATE POLICY anonymization_queue_update ON anonymization_queue
    FOR UPDATE USING (organization_id = ANY(get_user_exec_org_ids()));
CREATE POLICY anonymization_queue_delete ON anonymization_queue
    FOR DELETE USING (organization_id = ANY(get_user_exec_org_ids()));

COMMIT;
