-- ═══════════════════════════════════════════════════════════════
-- Migration 060: expense_reports & timesheets tables
-- These are aggregate/summary entities distinct from individual
-- expenses and time_entries respectively.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Expense Reports ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS expense_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','submitted','approved','rejected','paid')),
    submitted_by    UUID REFERENCES profiles(id),
    approved_by     UUID REFERENCES profiles(id),
    period_start    DATE,
    period_end      DATE,
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency        TEXT NOT NULL DEFAULT 'USD',
    notes           TEXT,
    created_by      UUID REFERENCES profiles(id),
    updated_by      UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_expense_reports_org ON expense_reports(organization_id);
CREATE INDEX idx_expense_reports_status ON expense_reports(status);
CREATE INDEX idx_expense_reports_submitted_by ON expense_reports(submitted_by);

ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view expense reports"
    ON expense_reports FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "Org members can insert expense reports"
    ON expense_reports FOR INSERT
    WITH CHECK (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "Authors can update own expense reports"
    ON expense_reports FOR UPDATE
    USING (created_by = auth.uid());

CREATE TRIGGER set_expense_reports_updated_at
    BEFORE UPDATE ON expense_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─── 2. Timesheets ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timesheets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id),
    status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','submitted','approved','rejected')),
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    total_hours     NUMERIC(8,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    approved_by     UUID REFERENCES profiles(id),
    approved_at     TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ,
    created_by      UUID REFERENCES profiles(id),
    updated_by      UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_timesheets_org ON timesheets(organization_id);
CREATE INDEX idx_timesheets_user ON timesheets(user_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_period ON timesheets(period_start, period_end);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view timesheets"
    ON timesheets FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "Users can insert own timesheets"
    ON timesheets FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own draft timesheets"
    ON timesheets FOR UPDATE
    USING (user_id = auth.uid() AND status = 'draft');

CREATE TRIGGER set_timesheets_updated_at
    BEFORE UPDATE ON timesheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
