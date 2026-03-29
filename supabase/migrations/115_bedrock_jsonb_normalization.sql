-- ============================================================
-- Migration 115: BEDROCK Batch 4b — JSONB Normalization
-- Protocol: FP-DATA-BEDROCK-001
--
-- Normalizes 8 JSONB columns into proper relational child tables:
--   1. estimates.line_items            → estimate_items
--   2. rfqs.line_items                 → rfq_line_items
--   3. rfqs.responses                  → rfq_vendor_responses
--   4. recurring_invoices.line_items   → recurring_invoice_items
--   5. purchase_requisitions.line_items→ purchase_requisition_items
--   6. checklist_templates.template_items → checklist_template_items
--   7. pipelines.stages                → pipeline_stages
--   8. production_sops.steps           → sop_steps
--
-- Data migration included. JSONB columns dropped after migration.
-- ============================================================

-- ============================================================
-- 1. estimate_items
-- ============================================================

CREATE TABLE IF NOT EXISTS estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    line_number INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT '',
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    taxable BOOLEAN DEFAULT false,
    tax_rate NUMERIC,
    display_order INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_estimate_items_estimate ON estimate_items(estimate_id);

-- Migrate JSONB data
INSERT INTO estimate_items (estimate_id, line_number, name, description, quantity, unit, unit_price, taxable, tax_rate, display_order)
SELECT
    e.id,
    COALESCE((item->>'line_number')::int, row_number() OVER (PARTITION BY e.id ORDER BY ordinality)),
    COALESCE(item->>'name', item->>'description', ''),
    item->>'description',
    COALESCE((item->>'quantity')::numeric, 1),
    item->>'unit',
    COALESCE((item->>'unit_price')::numeric, (item->>'rate')::numeric, (item->>'price')::numeric, 0),
    COALESCE((item->>'taxable')::boolean, false),
    (item->>'tax_rate')::numeric,
    COALESCE((item->>'display_order')::int, row_number() OVER (PARTITION BY e.id ORDER BY ordinality)::int)
FROM estimates e,
     jsonb_array_elements(e.line_items) WITH ORDINALITY AS t(item, ordinality)
WHERE e.line_items IS NOT NULL
  AND jsonb_typeof(e.line_items) = 'array'
  AND jsonb_array_length(e.line_items) > 0;

ALTER TABLE estimates DROP COLUMN IF EXISTS line_items;

-- ============================================================
-- 2. rfq_line_items
-- ============================================================

CREATE TABLE IF NOT EXISTS rfq_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    line_number INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT '',
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    display_order INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rfq_line_items_rfq ON rfq_line_items(rfq_id);

INSERT INTO rfq_line_items (rfq_id, line_number, name, description, quantity, unit, unit_price, display_order)
SELECT
    r.id,
    COALESCE((item->>'line_number')::int, row_number() OVER (PARTITION BY r.id ORDER BY ordinality)),
    COALESCE(item->>'name', item->>'description', ''),
    item->>'description',
    COALESCE((item->>'quantity')::numeric, 1),
    item->>'unit',
    COALESCE((item->>'unit_price')::numeric, (item->>'price')::numeric, 0),
    COALESCE((item->>'display_order')::int, row_number() OVER (PARTITION BY r.id ORDER BY ordinality)::int)
FROM rfqs r,
     jsonb_array_elements(r.line_items) WITH ORDINALITY AS t(item, ordinality)
WHERE r.line_items IS NOT NULL
  AND jsonb_typeof(r.line_items) = 'array'
  AND jsonb_array_length(r.line_items) > 0;

ALTER TABLE rfqs DROP COLUMN IF EXISTS line_items;

-- ============================================================
-- 3. rfq_vendor_responses
-- ============================================================

CREATE TABLE IF NOT EXISTS rfq_vendor_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    unit_price NUMERIC,
    total_price NUMERIC,
    lead_time_days INT,
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    response_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rfq_vendor_responses_rfq ON rfq_vendor_responses(rfq_id);
CREATE INDEX idx_rfq_vendor_responses_vendor ON rfq_vendor_responses(vendor_id);

INSERT INTO rfq_vendor_responses (rfq_id, vendor_id, unit_price, total_price, lead_time_days, notes, status, response_data)
SELECT
    r.id,
    (resp->>'vendor_id')::uuid,
    (resp->>'unit_price')::numeric,
    (resp->>'total_price')::numeric,
    (resp->>'lead_time_days')::int,
    resp->>'notes',
    COALESCE(resp->>'status', 'pending'),
    resp
FROM rfqs r,
     jsonb_array_elements(r.responses) WITH ORDINALITY AS t(resp, ordinality)
WHERE r.responses IS NOT NULL
  AND jsonb_typeof(r.responses) = 'array'
  AND jsonb_array_length(r.responses) > 0;

ALTER TABLE rfqs DROP COLUMN IF EXISTS responses;

-- ============================================================
-- 4. recurring_invoice_items
-- ============================================================

CREATE TABLE IF NOT EXISTS recurring_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_invoice_id UUID NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    line_number INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT '',
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    taxable BOOLEAN DEFAULT false,
    tax_rate NUMERIC,
    display_order INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurring_invoice_items_invoice ON recurring_invoice_items(recurring_invoice_id);

INSERT INTO recurring_invoice_items (recurring_invoice_id, line_number, name, description, quantity, unit, unit_price, taxable, tax_rate, display_order)
SELECT
    ri.id,
    COALESCE((item->>'line_number')::int, row_number() OVER (PARTITION BY ri.id ORDER BY ordinality)),
    COALESCE(item->>'name', item->>'description', ''),
    item->>'description',
    COALESCE((item->>'quantity')::numeric, 1),
    item->>'unit',
    COALESCE((item->>'unit_price')::numeric, (item->>'price')::numeric, 0),
    COALESCE((item->>'taxable')::boolean, false),
    (item->>'tax_rate')::numeric,
    COALESCE((item->>'display_order')::int, row_number() OVER (PARTITION BY ri.id ORDER BY ordinality)::int)
FROM recurring_invoices ri,
     jsonb_array_elements(ri.line_items) WITH ORDINALITY AS t(item, ordinality)
WHERE ri.line_items IS NOT NULL
  AND jsonb_typeof(ri.line_items) = 'array'
  AND jsonb_array_length(ri.line_items) > 0;

ALTER TABLE recurring_invoices DROP COLUMN IF EXISTS line_items;

-- ============================================================
-- 5. purchase_requisition_items
-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_requisition_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_requisition_id UUID NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    line_number INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT '',
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    display_order INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_requisition_items_pr ON purchase_requisition_items(purchase_requisition_id);

INSERT INTO purchase_requisition_items (purchase_requisition_id, line_number, name, description, quantity, unit, unit_price, display_order)
SELECT
    pr.id,
    COALESCE((item->>'line_number')::int, row_number() OVER (PARTITION BY pr.id ORDER BY ordinality)),
    COALESCE(item->>'name', item->>'description', ''),
    item->>'description',
    COALESCE((item->>'quantity')::numeric, 1),
    item->>'unit',
    COALESCE((item->>'unit_price')::numeric, (item->>'price')::numeric, 0),
    COALESCE((item->>'display_order')::int, row_number() OVER (PARTITION BY pr.id ORDER BY ordinality)::int)
FROM purchase_requisitions pr,
     jsonb_array_elements(pr.line_items) WITH ORDINALITY AS t(item, ordinality)
WHERE pr.line_items IS NOT NULL
  AND jsonb_typeof(pr.line_items) = 'array'
  AND jsonb_array_length(pr.line_items) > 0;

ALTER TABLE purchase_requisitions DROP COLUMN IF EXISTS line_items;

-- ============================================================
-- 6. checklist_template_items
-- ============================================================

CREATE TABLE IF NOT EXISTS checklist_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    item_order INT NOT NULL DEFAULT 1,
    label TEXT NOT NULL DEFAULT '',
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT true,
    item_type TEXT NOT NULL DEFAULT 'checkbox',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_template_items_template ON checklist_template_items(template_id);

INSERT INTO checklist_template_items (template_id, item_order, label, description, is_required, item_type)
SELECT
    ct.id,
    COALESCE((item->>'order')::int, (item->>'item_order')::int, row_number() OVER (PARTITION BY ct.id ORDER BY ordinality)),
    COALESCE(item->>'label', item->>'name', item->>'title', ''),
    item->>'description',
    COALESCE((item->>'is_required')::boolean, (item->>'required')::boolean, true),
    COALESCE(item->>'item_type', item->>'type', 'checkbox')
FROM checklist_templates ct,
     jsonb_array_elements(ct.items) WITH ORDINALITY AS t(item, ordinality)
WHERE ct.items IS NOT NULL
  AND jsonb_typeof(ct.items) = 'array'
  AND jsonb_array_length(ct.items) > 0;

ALTER TABLE checklist_templates DROP COLUMN IF EXISTS items;

-- ============================================================
-- 7. pipeline_stages
-- ============================================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    stage_order INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL DEFAULT '',
    description TEXT,
    color TEXT,
    is_won BOOLEAN NOT NULL DEFAULT false,
    is_lost BOOLEAN NOT NULL DEFAULT false,
    probability_percent NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);

INSERT INTO pipeline_stages (pipeline_id, stage_order, name, description, color, is_won, is_lost, probability_percent)
SELECT
    p.id,
    COALESCE((stage->>'order')::int, (stage->>'stage_order')::int, row_number() OVER (PARTITION BY p.id ORDER BY ordinality)),
    COALESCE(stage->>'name', stage->>'label', ''),
    stage->>'description',
    stage->>'color',
    COALESCE((stage->>'is_won')::boolean, false),
    COALESCE((stage->>'is_lost')::boolean, false),
    (stage->>'probability_percent')::numeric
FROM pipelines p,
     jsonb_array_elements(p.stages) WITH ORDINALITY AS t(stage, ordinality)
WHERE p.stages IS NOT NULL
  AND jsonb_typeof(p.stages) = 'array'
  AND jsonb_array_length(p.stages) > 0;

ALTER TABLE pipelines DROP COLUMN IF EXISTS stages;

-- ============================================================
-- 8. sop_steps
-- ============================================================

CREATE TABLE IF NOT EXISTS sop_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id UUID NOT NULL REFERENCES production_sops(id) ON DELETE CASCADE,
    step_order INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    duration_minutes INT,
    safety_notes TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sop_steps_sop ON sop_steps(sop_id);

INSERT INTO sop_steps (sop_id, step_order, title, description, duration_minutes, safety_notes, media_url)
SELECT
    s.id,
    COALESCE((step->>'order')::int, (step->>'step_order')::int, row_number() OVER (PARTITION BY s.id ORDER BY ordinality)),
    COALESCE(step->>'title', step->>'name', ''),
    step->>'description',
    (step->>'duration_minutes')::int,
    step->>'safety_notes',
    step->>'media_url'
FROM production_sops s,
     jsonb_array_elements(s.steps) WITH ORDINALITY AS t(step, ordinality)
WHERE s.steps IS NOT NULL
  AND jsonb_typeof(s.steps) = 'array'
  AND jsonb_array_length(s.steps) > 0;

ALTER TABLE production_sops DROP COLUMN IF EXISTS steps;

-- ============================================================
-- Enable RLS + permissive policies on all new child tables
-- (Parent table RLS provides org-scoping)
-- ============================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'estimate_items',
        'rfq_line_items',
        'rfq_vendor_responses',
        'recurring_invoice_items',
        'purchase_requisition_items',
        'checklist_template_items',
        'pipeline_stages',
        'sop_steps'
    ]) LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format(
            'CREATE POLICY %I_select ON %I FOR SELECT USING (true)',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (true)',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY %I_update ON %I FOR UPDATE USING (true)',
            tbl, tbl
        );
        EXECUTE format(
            'CREATE POLICY %I_delete ON %I FOR DELETE USING (true)',
            tbl, tbl
        );
    END LOOP;
END $$;
