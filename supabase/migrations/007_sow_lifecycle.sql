-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — SOW Lifecycle & Invoice Line Item Schema
-- Full normalized chain: SOW → Deliverable → Invoice Line Item → Task →
--   Subtask → Time Entry / Activity Log
-- Maintains 3NF compliance, SSOT, referential integrity
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE sow_status AS ENUM (
    'draft',
    'pending_review',
    'pending_approval',
    'approved',
    'active',
    'on_hold',
    'completed',
    'cancelled',
    'amended'
);

CREATE TYPE sow_deliverable_status AS ENUM (
    'not_started',
    'in_progress',
    'submitted',
    'under_review',
    'revision_requested',
    'approved',
    'completed',
    'cancelled'
);

CREATE TYPE sow_deliverable_type AS ENUM (
    'milestone',
    'fixed_fee',
    'time_and_materials',
    'unit_based',
    'retainer',
    'expense_passthrough'
);

CREATE TYPE invoice_line_item_type AS ENUM (
    'deliverable',
    'time_and_materials',
    'expense',
    'retainer',
    'adjustment',
    'discount',
    'tax'
);

CREATE TYPE client_invoice_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'sent',
    'viewed',
    'partial',
    'paid',
    'overdue',
    'disputed',
    'void',
    'credited'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: SCOPE OF WORK (SOW)
-- Canonical definition of contractual scope per project.
-- One project may have multiple SOW versions (amendments).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE scopes_of_work (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,

    -- Identification
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    parent_sow_id UUID REFERENCES scopes_of_work(id) ON DELETE SET NULL,

    -- Content
    description TEXT,
    assumptions TEXT,
    exclusions TEXT,
    acceptance_criteria TEXT,

    -- Schedule
    effective_date DATE NOT NULL,
    expiration_date DATE,
    estimated_start_date DATE,
    estimated_end_date DATE,

    -- Value
    total_value NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',

    -- Billing
    billing_type billing_type NOT NULL DEFAULT 'fixed_price',
    payment_terms_days INTEGER DEFAULT 30,
    retainer_amount NUMERIC(14,2),
    retainer_frequency TEXT CHECK (retainer_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),

    -- Approval
    status sow_status NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    client_signed_by TEXT,
    client_signed_at TIMESTAMPTZ,

    -- Ownership
    prepared_by UUID REFERENCES profiles(id),
    owner_id UUID REFERENCES profiles(id),

    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, number, version)
);

CREATE INDEX idx_sow_project ON scopes_of_work(project_id);
CREATE INDEX idx_sow_proposal ON scopes_of_work(proposal_id);
CREATE INDEX idx_sow_contract ON scopes_of_work(contract_id);
CREATE INDEX idx_sow_status ON scopes_of_work(status);
CREATE INDEX idx_sow_org ON scopes_of_work(organization_id);
CREATE INDEX idx_sow_parent ON scopes_of_work(parent_sow_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: SOW DELIVERABLES
-- Individual line-item deliverables within a SOW.
-- Each deliverable is the SSOT for "what was promised" and drives
-- invoice line items, tasks, and time tracking downstream.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sow_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sow_id UUID NOT NULL REFERENCES scopes_of_work(id) ON DELETE CASCADE,

    -- Identification
    line_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Type & Pricing
    deliverable_type sow_deliverable_type NOT NULL DEFAULT 'fixed_fee',
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'unit',
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    -- For T&M deliverables
    estimated_hours NUMERIC(8,2),
    hourly_rate NUMERIC(10,2),
    not_to_exceed NUMERIC(14,2),

    -- Schedule
    phase production_phase,
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,

    -- Acceptance
    acceptance_criteria TEXT,
    requires_client_approval BOOLEAN DEFAULT false,

    -- Status
    status sow_deliverable_status NOT NULL DEFAULT 'not_started',
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),

    -- Billing Progress
    amount_invoiced NUMERIC(14,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0,

    -- Category (for budget roll-up)
    budget_category budget_category,
    department department,

    -- Display
    display_order INTEGER DEFAULT 0,
    is_optional BOOLEAN DEFAULT false,

    -- Relationships
    milestone_id UUID REFERENCES production_milestones(id) ON DELETE SET NULL,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(sow_id, line_number)
);

CREATE INDEX idx_sow_deliverables_sow ON sow_deliverables(sow_id);
CREATE INDEX idx_sow_deliverables_status ON sow_deliverables(status);
CREATE INDEX idx_sow_deliverables_phase ON sow_deliverables(phase);
CREATE INDEX idx_sow_deliverables_due ON sow_deliverables(due_date);
CREATE INDEX idx_sow_deliverables_milestone ON sow_deliverables(milestone_id);
CREATE INDEX idx_sow_deliverables_org ON sow_deliverables(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: CLIENT INVOICES
-- Extends the existing invoices table concept for client-facing invoices
-- with proper line items linked to SOW deliverables.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE client_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sow_id UUID REFERENCES scopes_of_work(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    -- Identification
    invoice_number TEXT NOT NULL,
    title TEXT,
    reference TEXT,

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,

    -- Period (for T&M / retainer invoices)
    billing_period_start DATE,
    billing_period_end DATE,

    -- Amounts
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(14,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(14,2) DEFAULT 0,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(14,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
    currency TEXT DEFAULT 'USD',

    -- Terms
    payment_terms_days INTEGER DEFAULT 30,
    payment_instructions TEXT,
    notes TEXT,

    -- Status
    status client_invoice_status NOT NULL DEFAULT 'draft',

    -- Template
    template_id UUID REFERENCES invoice_templates(id) ON DELETE SET NULL,

    -- Reminders
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,

    -- Approval
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, invoice_number)
);

CREATE INDEX idx_client_invoices_project ON client_invoices(project_id);
CREATE INDEX idx_client_invoices_sow ON client_invoices(sow_id);
CREATE INDEX idx_client_invoices_company ON client_invoices(company_id);
CREATE INDEX idx_client_invoices_status ON client_invoices(status);
CREATE INDEX idx_client_invoices_due ON client_invoices(due_date);
CREATE INDEX idx_client_invoices_org ON client_invoices(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: INVOICE LINE ITEMS
-- Each line item traces back to exactly one SOW deliverable (when applicable).
-- This is the billing ↔ deliverable linkage in the lifecycle chain.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_invoice_id UUID NOT NULL REFERENCES client_invoices(id) ON DELETE CASCADE,
    sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL,

    -- Identification
    line_number INTEGER NOT NULL,
    line_type invoice_line_item_type NOT NULL DEFAULT 'deliverable',

    -- Content
    name TEXT NOT NULL,
    description TEXT,

    -- Quantities & Pricing
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'unit',
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    -- Tax
    taxable BOOLEAN DEFAULT true,
    tax_rate NUMERIC(5,2) DEFAULT 0,

    -- For T&M lines: link to time entries
    billing_period_start DATE,
    billing_period_end DATE,

    -- Phase & Category (denormalized for invoice display, source is deliverable)
    phase production_phase,
    budget_category budget_category,

    -- Display
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(client_invoice_id, line_number)
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(client_invoice_id);
CREATE INDEX idx_invoice_line_items_deliverable ON invoice_line_items(sow_deliverable_id);
CREATE INDEX idx_invoice_line_items_type ON invoice_line_items(line_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: LINK TASKS TO SOW DELIVERABLES
-- Add sow_deliverable_id FK to both task tables, creating the
-- deliverable → task → subtask chain. Tasks use parent_id / parent_task_id
-- for subtask nesting (already exists).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL;

ALTER TABLE production_tasks
    ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_sow_deliverable ON tasks(sow_deliverable_id);
CREATE INDEX IF NOT EXISTS idx_production_tasks_sow_deliverable ON production_tasks(sow_deliverable_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: LINK TIME ENTRIES TO SOW DELIVERABLES
-- Add sow_deliverable_id FK to time entry tables so logged time traces
-- back through the full chain: time → task → deliverable → SOW.
-- The deliverable FK on time entries allows direct roll-up even when
-- a time entry is not associated with a specific task.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE time_entries
    ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL;

ALTER TABLE production_time_entries
    ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL;

-- Link time entries to invoice line items for T&M billing
ALTER TABLE time_entries
    ADD COLUMN IF NOT EXISTS invoice_line_item_id UUID REFERENCES invoice_line_items(id) ON DELETE SET NULL;

ALTER TABLE production_time_entries
    ADD COLUMN IF NOT EXISTS invoice_line_item_id UUID REFERENCES invoice_line_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_time_entries_sow_deliverable ON time_entries(sow_deliverable_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_invoice_line_item ON time_entries(invoice_line_item_id);
CREATE INDEX IF NOT EXISTS idx_prod_time_entries_sow_deliverable ON production_time_entries(sow_deliverable_id);
CREATE INDEX IF NOT EXISTS idx_prod_time_entries_invoice_line_item ON production_time_entries(invoice_line_item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: INVOICE LINE ITEM ↔ TIME ENTRY JUNCTION
-- For T&M billing, multiple time entries can appear on a single invoice
-- line item, and a time entry could theoretically span billing periods.
-- This junction table provides the many-to-many linkage with amounts.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE invoice_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_line_item_id UUID NOT NULL REFERENCES invoice_line_items(id) ON DELETE CASCADE,
    time_entry_id UUID REFERENCES time_entries(id) ON DELETE SET NULL,
    production_time_entry_id UUID REFERENCES production_time_entries(id) ON DELETE SET NULL,

    -- Billed amounts (may differ from time entry totals if partial billing)
    hours_billed NUMERIC(8,2) NOT NULL,
    rate_billed NUMERIC(10,2) NOT NULL,
    amount_billed NUMERIC(12,2) GENERATED ALWAYS AS (hours_billed * rate_billed) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Exactly one time entry reference must be set
    CHECK (
        (time_entry_id IS NOT NULL AND production_time_entry_id IS NULL) OR
        (time_entry_id IS NULL AND production_time_entry_id IS NOT NULL)
    )
);

CREATE INDEX idx_invoice_time_entries_line ON invoice_time_entries(invoice_line_item_id);
CREATE INDEX idx_invoice_time_entries_te ON invoice_time_entries(time_entry_id);
CREATE INDEX idx_invoice_time_entries_pte ON invoice_time_entries(production_time_entry_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: SOW CHANGE LOG (IMMUTABLE AUDIT TRAIL)
-- Every change to a SOW or its deliverables is recorded here.
-- Supports compliance requirement for immutable financial records.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sow_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sow_id UUID NOT NULL REFERENCES scopes_of_work(id) ON DELETE CASCADE,
    sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL,

    -- Change
    change_type TEXT NOT NULL CHECK (change_type IN (
        'created', 'updated', 'status_changed', 'deliverable_added',
        'deliverable_updated', 'deliverable_removed', 'amount_changed',
        'schedule_changed', 'approved', 'rejected', 'amended'
    )),
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    change_summary TEXT,

    -- Actor
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Snapshot (for audit)
    metadata JSONB DEFAULT '{}',

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_sow_change_log_sow ON sow_change_log(sow_id);
CREATE INDEX idx_sow_change_log_deliverable ON sow_change_log(sow_deliverable_id);
CREATE INDEX idx_sow_change_log_type ON sow_change_log(change_type);
CREATE INDEX idx_sow_change_log_date ON sow_change_log(changed_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: DELIVERABLE PROGRESS SNAPSHOTS
-- Periodic snapshots for burn-down / progress tracking.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE deliverable_progress_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sow_deliverable_id UUID NOT NULL REFERENCES sow_deliverables(id) ON DELETE CASCADE,

    -- Snapshot data
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    percent_complete INTEGER NOT NULL CHECK (percent_complete >= 0 AND percent_complete <= 100),
    hours_logged NUMERIC(8,2) NOT NULL DEFAULT 0,
    amount_spent NUMERIC(14,2) NOT NULL DEFAULT 0,
    amount_invoiced NUMERIC(14,2) NOT NULL DEFAULT 0,
    tasks_total INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,

    -- Notes
    notes TEXT,

    -- Actor
    recorded_by UUID REFERENCES profiles(id),

    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(sow_deliverable_id, snapshot_date)
);

CREATE INDEX idx_progress_snapshots_deliverable ON deliverable_progress_snapshots(sow_deliverable_id);
CREATE INDEX idx_progress_snapshots_date ON deliverable_progress_snapshots(snapshot_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: LINK EXPENSES TO SOW DELIVERABLES
-- Allow expenses to trace back to specific deliverables for cost tracking.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL;

ALTER TABLE production_expenses
    ADD COLUMN IF NOT EXISTS sow_deliverable_id UUID REFERENCES sow_deliverables(id) ON DELETE SET NULL;

ALTER TABLE production_expenses
    ADD COLUMN IF NOT EXISTS invoice_line_item_id UUID REFERENCES invoice_line_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_sow_deliverable ON expenses(sow_deliverable_id);
CREATE INDEX IF NOT EXISTS idx_prod_expenses_sow_deliverable ON production_expenses(sow_deliverable_id);
CREATE INDEX IF NOT EXISTS idx_prod_expenses_invoice_line_item ON production_expenses(invoice_line_item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE scopes_of_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE sow_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sow_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_progress_snapshots ENABLE ROW LEVEL SECURITY;

-- Org-based policies for tables with organization_id
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'scopes_of_work', 'sow_deliverables', 'client_invoices',
        'sow_change_log', 'deliverable_progress_snapshots'
    ])
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view %I in their org" ON %I
                FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can insert %I in their org" ON %I
                FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can update %I in their org" ON %I
                FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
            CREATE POLICY "Users can delete %I in their org" ON %I
                FOR DELETE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
        ', tbl, tbl, tbl, tbl, tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- Invoice line items policy (via client_invoices)
CREATE POLICY "Users can view invoice_line_items via client_invoices" ON invoice_line_items
    FOR SELECT USING (client_invoice_id IN (
        SELECT id FROM client_invoices WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can insert invoice_line_items via client_invoices" ON invoice_line_items
    FOR INSERT WITH CHECK (client_invoice_id IN (
        SELECT id FROM client_invoices WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can update invoice_line_items via client_invoices" ON invoice_line_items
    FOR UPDATE USING (client_invoice_id IN (
        SELECT id FROM client_invoices WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can delete invoice_line_items via client_invoices" ON invoice_line_items
    FOR DELETE USING (client_invoice_id IN (
        SELECT id FROM client_invoices WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Invoice time entries policy (via invoice_line_items → client_invoices)
CREATE POLICY "Users can view invoice_time_entries via invoices" ON invoice_time_entries
    FOR SELECT USING (invoice_line_item_id IN (
        SELECT ili.id FROM invoice_line_items ili
        JOIN client_invoices ci ON ci.id = ili.client_invoice_id
        WHERE ci.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    ));
CREATE POLICY "Users can insert invoice_time_entries via invoices" ON invoice_time_entries
    FOR INSERT WITH CHECK (invoice_line_item_id IN (
        SELECT ili.id FROM invoice_line_items ili
        JOIN client_invoices ci ON ci.id = ili.client_invoice_id
        WHERE ci.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    ));
CREATE POLICY "Users can delete invoice_time_entries via invoices" ON invoice_time_entries
    FOR DELETE USING (invoice_line_item_id IN (
        SELECT ili.id FROM invoice_line_items ili
        JOIN client_invoices ci ON ci.id = ili.client_invoice_id
        WHERE ci.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    ));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- updated_at triggers
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'scopes_of_work', 'sow_deliverables', 'client_invoices',
        'invoice_line_items'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- Activity log trigger for SOW lifecycle tables
CREATE TRIGGER log_sow_activity AFTER INSERT OR UPDATE OR DELETE ON scopes_of_work
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_sow_deliverables_activity AFTER INSERT OR UPDATE OR DELETE ON sow_deliverables
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_client_invoices_activity AFTER INSERT OR UPDATE OR DELETE ON client_invoices
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13: SOW CHANGE TRACKING TRIGGER
-- Automatically records changes to scopes_of_work into sow_change_log.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION track_sow_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO sow_change_log (sow_id, change_type, change_summary, changed_by, metadata, organization_id)
        VALUES (NEW.id, 'created', 'SOW created: ' || NEW.title, auth.uid(), to_jsonb(NEW), NEW.organization_id);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO sow_change_log (sow_id, change_type, field_name, old_value, new_value, change_summary, changed_by, metadata, organization_id)
            VALUES (NEW.id, 'status_changed', 'status', OLD.status::text, NEW.status::text,
                'Status changed from ' || OLD.status || ' to ' || NEW.status,
                auth.uid(), jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
        END IF;
        IF OLD.total_value IS DISTINCT FROM NEW.total_value THEN
            INSERT INTO sow_change_log (sow_id, change_type, field_name, old_value, new_value, change_summary, changed_by, metadata, organization_id)
            VALUES (NEW.id, 'amount_changed', 'total_value', OLD.total_value::text, NEW.total_value::text,
                'Total value changed from ' || OLD.total_value || ' to ' || NEW.total_value,
                auth.uid(), jsonb_build_object('old_value', OLD.total_value, 'new_value', NEW.total_value), NEW.organization_id);
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_sow_changes_trigger
    AFTER INSERT OR UPDATE ON scopes_of_work
    FOR EACH ROW EXECUTE FUNCTION track_sow_changes();

-- Track deliverable changes
CREATE OR REPLACE FUNCTION track_sow_deliverable_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO sow_change_log (sow_id, sow_deliverable_id, change_type, change_summary, changed_by, metadata, organization_id)
        VALUES (NEW.sow_id, NEW.id, 'deliverable_added', 'Deliverable added: ' || NEW.name, auth.uid(), to_jsonb(NEW), NEW.organization_id);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO sow_change_log (sow_id, sow_deliverable_id, change_type, field_name, old_value, new_value, change_summary, changed_by, metadata, organization_id)
            VALUES (NEW.sow_id, NEW.id, 'deliverable_updated', 'status', OLD.status::text, NEW.status::text,
                'Deliverable "' || NEW.name || '" status: ' || OLD.status || ' → ' || NEW.status,
                auth.uid(), jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.organization_id);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO sow_change_log (sow_id, sow_deliverable_id, change_type, change_summary, changed_by, metadata, organization_id)
        VALUES (OLD.sow_id, OLD.id, 'deliverable_removed', 'Deliverable removed: ' || OLD.name, auth.uid(), to_jsonb(OLD), OLD.organization_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_sow_deliverable_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sow_deliverables
    FOR EACH ROW EXECUTE FUNCTION track_sow_deliverable_changes();

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14: UTILITY FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Recalculate SOW total_value from deliverables
CREATE OR REPLACE FUNCTION recalculate_sow_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE scopes_of_work
    SET total_value = COALESCE((
        SELECT SUM(total_price)
        FROM sow_deliverables
        WHERE sow_id = COALESCE(NEW.sow_id, OLD.sow_id)
        AND is_optional = false
        AND status != 'cancelled'
    ), 0)
    WHERE id = COALESCE(NEW.sow_id, OLD.sow_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_sow_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON sow_deliverables
    FOR EACH ROW EXECUTE FUNCTION recalculate_sow_total();

-- Recalculate client invoice subtotal/total from line items
CREATE OR REPLACE FUNCTION recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal NUMERIC(14,2);
    v_invoice_id UUID;
    v_discount_percent NUMERIC(5,2);
    v_tax_percent NUMERIC(5,2);
BEGIN
    v_invoice_id := COALESCE(NEW.client_invoice_id, OLD.client_invoice_id);

    SELECT COALESCE(SUM(amount), 0) INTO v_subtotal
    FROM invoice_line_items
    WHERE client_invoice_id = v_invoice_id;

    SELECT discount_percent, tax_percent INTO v_discount_percent, v_tax_percent
    FROM client_invoices WHERE id = v_invoice_id;

    UPDATE client_invoices
    SET subtotal = v_subtotal,
        discount_amount = ROUND(v_subtotal * COALESCE(v_discount_percent, 0) / 100, 2),
        tax_amount = ROUND((v_subtotal - ROUND(v_subtotal * COALESCE(v_discount_percent, 0) / 100, 2)) * COALESCE(v_tax_percent, 0) / 100, 2),
        total = v_subtotal
            - ROUND(v_subtotal * COALESCE(v_discount_percent, 0) / 100, 2)
            + ROUND((v_subtotal - ROUND(v_subtotal * COALESCE(v_discount_percent, 0) / 100, 2)) * COALESCE(v_tax_percent, 0) / 100, 2)
    WHERE id = v_invoice_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION recalculate_invoice_totals();

-- Update deliverable invoiced amounts when invoice line items change
CREATE OR REPLACE FUNCTION update_deliverable_invoiced_amount()
RETURNS TRIGGER AS $$
DECLARE
    v_deliverable_id UUID;
BEGIN
    v_deliverable_id := COALESCE(NEW.sow_deliverable_id, OLD.sow_deliverable_id);

    IF v_deliverable_id IS NOT NULL THEN
        UPDATE sow_deliverables
        SET amount_invoiced = COALESCE((
            SELECT SUM(ili.amount)
            FROM invoice_line_items ili
            JOIN client_invoices ci ON ci.id = ili.client_invoice_id
            WHERE ili.sow_deliverable_id = v_deliverable_id
            AND ci.status NOT IN ('void', 'credited')
        ), 0)
        WHERE id = v_deliverable_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_deliverable_invoiced_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION update_deliverable_invoiced_amount();

-- Generate next SOW number
CREATE OR REPLACE FUNCTION generate_sow_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(number FROM '\d+$') AS INTEGER)
    ), 0) + 1 INTO next_num
    FROM scopes_of_work
    WHERE organization_id = p_org_id
    AND number LIKE 'SOW-' || year_prefix || '-%';

    RETURN 'SOW-' || year_prefix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate next client invoice number
CREATE OR REPLACE FUNCTION generate_client_invoice_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)
    ), 0) + 1 INTO next_num
    FROM client_invoices
    WHERE organization_id = p_org_id
    AND invoice_number LIKE 'INV-' || year_prefix || '-%';

    RETURN 'INV-' || year_prefix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 15: REPORTING VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

-- SOW Deliverable Summary (with task counts and time logged)
CREATE OR REPLACE VIEW v_sow_deliverable_summary AS
SELECT
    sd.id AS deliverable_id,
    sd.sow_id,
    sd.name,
    sd.status,
    sd.deliverable_type,
    sd.total_price,
    sd.amount_invoiced,
    sd.amount_paid,
    sd.percent_complete,
    sd.estimated_hours,
    sd.due_date,
    sow.project_id,
    sow.organization_id,
    COALESCE(t.task_count, 0) AS task_count,
    COALESCE(t.tasks_completed, 0) AS tasks_completed,
    COALESCE(te.hours_logged, 0) AS hours_logged,
    COALESCE(te.labor_cost, 0) AS labor_cost,
    COALESCE(ex.expense_total, 0) AS expense_total,
    COALESCE(te.hours_logged, 0) + COALESCE(ex.expense_total, 0) AS total_cost,
    CASE
        WHEN sd.total_price > 0
        THEN ROUND((sd.total_price - COALESCE(te.labor_cost, 0) - COALESCE(ex.expense_total, 0)) / sd.total_price * 100, 2)
        ELSE 0
    END AS margin_percent
FROM sow_deliverables sd
JOIN scopes_of_work sow ON sow.id = sd.sow_id
LEFT JOIN (
    SELECT sow_deliverable_id,
           COUNT(*) AS task_count,
           COUNT(*) FILTER (WHERE status IN ('done', 'completed')) AS tasks_completed
    FROM tasks WHERE sow_deliverable_id IS NOT NULL
    GROUP BY sow_deliverable_id
) t ON t.sow_deliverable_id = sd.id
LEFT JOIN (
    SELECT sow_deliverable_id,
           SUM(hours_worked) AS hours_logged,
           SUM(total_cost) AS labor_cost
    FROM time_entries WHERE sow_deliverable_id IS NOT NULL
    GROUP BY sow_deliverable_id
) te ON te.sow_deliverable_id = sd.id
LEFT JOIN (
    SELECT sow_deliverable_id,
           SUM(amount) AS expense_total
    FROM expenses WHERE sow_deliverable_id IS NOT NULL AND status = 'approved'
    GROUP BY sow_deliverable_id
) ex ON ex.sow_deliverable_id = sd.id;

-- SOW Summary (project-level)
CREATE OR REPLACE VIEW v_sow_summary AS
SELECT
    sow.id AS sow_id,
    sow.project_id,
    sow.number,
    sow.title,
    sow.status,
    sow.total_value,
    sow.billing_type,
    sow.organization_id,
    COALESCE(d.deliverable_count, 0) AS deliverable_count,
    COALESCE(d.completed_count, 0) AS completed_count,
    COALESCE(d.total_invoiced, 0) AS total_invoiced,
    COALESCE(d.total_paid, 0) AS total_paid,
    CASE
        WHEN sow.total_value > 0
        THEN ROUND(COALESCE(d.total_invoiced, 0) / sow.total_value * 100, 2)
        ELSE 0
    END AS percent_invoiced,
    CASE
        WHEN d.deliverable_count > 0
        THEN ROUND(COALESCE(d.completed_count, 0)::numeric / d.deliverable_count * 100, 2)
        ELSE 0
    END AS percent_complete
FROM scopes_of_work sow
LEFT JOIN (
    SELECT sow_id,
           COUNT(*) AS deliverable_count,
           COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
           SUM(amount_invoiced) AS total_invoiced,
           SUM(amount_paid) AS total_paid
    FROM sow_deliverables
    WHERE status != 'cancelled'
    GROUP BY sow_id
) d ON d.sow_id = sow.id;

-- Client Invoice Aging View
CREATE OR REPLACE VIEW v_client_invoice_aging AS
SELECT
    ci.organization_id,
    ci.id AS invoice_id,
    ci.invoice_number,
    ci.project_id,
    ci.company_id,
    ci.total,
    ci.amount_paid,
    ci.balance_due,
    ci.due_date,
    ci.status,
    CURRENT_DATE - ci.due_date AS days_overdue,
    CASE
        WHEN CURRENT_DATE - ci.due_date <= 0 THEN 'current'
        WHEN CURRENT_DATE - ci.due_date <= 30 THEN '1-30 days'
        WHEN CURRENT_DATE - ci.due_date <= 60 THEN '31-60 days'
        WHEN CURRENT_DATE - ci.due_date <= 90 THEN '61-90 days'
        ELSE '90+ days'
    END AS aging_bucket
FROM client_invoices ci
WHERE ci.status NOT IN ('paid', 'void', 'credited');
