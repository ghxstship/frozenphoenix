-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 077: BUSINESS OPERATIONS ENRICHMENT (P1)
-- ═══════════════════════════════════════════════════════════════════════════
-- Priority: HIGH — Business-critical feature gaps
-- Source: SCHEMA_OPTIMIZATION_AND_ENRICHMENT_PLAN.md §19 Migration 077
-- Tables modified: purchase_orders, invoices, projects, deals, shifts,
--   crew_members, budget_line_items, stakeholders, change_orders,
--   expenses, time_entries, client_invoices, project_members
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. purchase_orders: PO number, currency, payment terms
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS po_number TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (length(currency) = 3),
  ADD COLUMN IF NOT EXISTS payment_terms TEXT;

COMMENT ON COLUMN purchase_orders.po_number IS
  'Human-readable PO reference. Unique per organization.';
COMMENT ON COLUMN purchase_orders.currency IS
  'ISO 4217 currency code.';
COMMENT ON COLUMN purchase_orders.payment_terms IS
  'Net-30/Net-60 etc. Cash flow forecasting.';

-- Unique PO number per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_po_number_org
  ON purchase_orders(organization_id, po_number)
  WHERE po_number IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. invoices: invoice number, currency, tax amount
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (length(currency) = 3),
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0);

COMMENT ON COLUMN invoices.invoice_number IS
  'Vendor invoice reference — 3-way match.';
COMMENT ON COLUMN invoices.currency IS
  'ISO 4217 currency code.';
COMMENT ON COLUMN invoices.tax_amount IS
  'Sales tax/VAT amount — international compliance.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. projects: timezone, load-out completion
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS load_out_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN projects.timezone IS
  'IANA timezone for local schedule rendering.';
COMMENT ON COLUMN projects.load_out_completed_at IS
  'Triggers 48hr auto-revoke of project-scoped access. Kill switch.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. deals: weighted value (generated), currency
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (length(currency) = 3);

-- weighted_value as a generated column requires knowing the existing column names.
-- deals has `value` NUMERIC and `probability` INTEGER (001_initial_schema)
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS weighted_value NUMERIC(12,2)
    GENERATED ALWAYS AS (value * probability / 100.0) STORED;

COMMENT ON COLUMN deals.currency IS
  'ISO 4217 — multi-currency deal tracking.';
COMMENT ON COLUMN deals.weighted_value IS
  'Pipeline forecasting: value × probability / 100.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. shifts: break minutes, overtime flag, check-in time
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0 CHECK (break_minutes >= 0),
  ADD COLUMN IF NOT EXISTS overtime_flag BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

COMMENT ON COLUMN shifts.break_minutes IS
  'FLSA meal/rest break tracking (30-min per 8hr rule).';
COMMENT ON COLUMN shifts.overtime_flag IS
  'FLSA overtime calculation (>40hr/week, >8hr/day in CA).';
COMMENT ON COLUMN shifts.checked_in_at IS
  'Actual check-in time vs scheduled — variance tracking.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. crew_members: union, dietary
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS union_local TEXT,
  ADD COLUMN IF NOT EXISTS union_classification TEXT,
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;

COMMENT ON COLUMN crew_members.union_local IS
  'IATSE/Teamsters/SAG-AFTRA local number — rate card compliance.';
COMMENT ON COLUMN crew_members.union_classification IS
  'Union job classification (e.g., "Electric Dept Head").';
COMMENT ON COLUMN crew_members.dietary_restrictions IS
  'On-site catering/hospitality for crew.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. budget_line_items: cost center, committed amount
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE budget_line_items
  ADD COLUMN IF NOT EXISTS cost_center TEXT,
  ADD COLUMN IF NOT EXISTS committed_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (committed_amount >= 0);

COMMENT ON COLUMN budget_line_items.cost_center IS
  'Department cost allocation — P&L attribution.';
COMMENT ON COLUMN budget_line_items.committed_amount IS
  '3-bucket budgeting: estimated / committed / actual.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. stakeholders: title, company (display fields)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE stakeholders
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT;

COMMENT ON COLUMN stakeholders.title IS
  'Professional title for contact cards.';
COMMENT ON COLUMN stakeholders.company IS
  'Company affiliation (external display — canonical link via company_id FK in 076).';

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. change_orders: client approval
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE change_orders
  ADD COLUMN IF NOT EXISTS client_approved_at TIMESTAMPTZ;

COMMENT ON COLUMN change_orders.client_approved_at IS
  'Signed change order documentation timestamp.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. expenses: receipt verification
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS receipt_verified BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN expenses.receipt_verified IS
  'Audit compliance — receipt has been verified by approver.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. time_entries: overtime flag
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS overtime_flag BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN time_entries.overtime_flag IS
  'FLSA overtime compliance — hours worked beyond threshold.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. client_invoices: retention percent
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE client_invoices
  ADD COLUMN IF NOT EXISTS retention_percent NUMERIC(5,2) DEFAULT 0 CHECK (retention_percent >= 0 AND retention_percent <= 100);

COMMENT ON COLUMN client_invoices.retention_percent IS
  'Client payment holdback percentage.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. project_members: access expiry + department role
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'project_members') THEN
    ALTER TABLE project_members
      ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS department_role TEXT;

    EXECUTE 'COMMENT ON COLUMN project_members.access_expires_at IS '
      || quote_literal('Auto-revoke post-project access. SOC2 CC6.2.');
    EXECUTE 'COMMENT ON COLUMN project_members.department_role IS '
      || quote_literal('Department-specific role within project context.');
  END IF;
END $$;

COMMIT;
