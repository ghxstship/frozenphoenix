-- ═══════════════════════════════════════════════════════════════
-- Migration 022: Forensic Audit Remediation
-- Addresses: F1, F2, F4, W1, X1, TD-02, P3, O3, O4
-- ═══════════════════════════════════════════════════════════════

-- ─── F1: Normalize goods_receipts.line_items JSONB → junction table ───
CREATE TABLE IF NOT EXISTS public.goods_receipt_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
    po_item_id      UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
    description     TEXT NOT NULL,
    quantity_ordered NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity_received NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity_rejected NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit_price      NUMERIC(14,2),
    line_total      NUMERIC(14,2) GENERATED ALWAYS AS (quantity_received * COALESCE(unit_price, 0)) STORED,
    condition       TEXT CHECK (condition IN ('good', 'damaged', 'partial')) DEFAULT 'good',
    notes           TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goods_receipt_lines_receipt ON public.goods_receipt_lines(goods_receipt_id);
CREATE INDEX idx_goods_receipt_lines_po_item ON public.goods_receipt_lines(po_item_id);
CREATE INDEX idx_goods_receipt_lines_org ON public.goods_receipt_lines(organization_id);

ALTER TABLE public.goods_receipt_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.goods_receipt_lines
    USING (organization_id = public.get_user_org_id());

CREATE TRIGGER set_updated_at_goods_receipt_lines
    BEFORE UPDATE ON public.goods_receipt_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── F2: Multi-currency conversion tables ───
CREATE TYPE public.currency_code AS ENUM (
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY',
    'INR', 'BRL', 'MXN', 'KRW', 'SGD', 'HKD', 'NZD', 'SEK',
    'NOK', 'DKK', 'ZAR', 'AED'
);

CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency   public.currency_code NOT NULL DEFAULT 'USD',
    target_currency public.currency_code NOT NULL,
    rate            NUMERIC(18,8) NOT NULL CHECK (rate > 0),
    effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    source          TEXT DEFAULT 'manual',
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(base_currency, target_currency, effective_date, organization_id)
);

CREATE INDEX idx_exchange_rates_lookup ON public.exchange_rates(base_currency, target_currency, effective_date DESC);
CREATE INDEX idx_exchange_rates_org ON public.exchange_rates(organization_id);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.exchange_rates
    USING (organization_id = public.get_user_org_id());

-- Helper function: convert currency amount
CREATE OR REPLACE FUNCTION public.convert_currency(
    amount NUMERIC,
    from_currency public.currency_code,
    to_currency public.currency_code,
    org_id UUID,
    as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS NUMERIC AS $$
DECLARE
    rate NUMERIC;
BEGIN
    IF from_currency = to_currency THEN
        RETURN amount;
    END IF;
    
    SELECT er.rate INTO rate
    FROM public.exchange_rates er
    WHERE er.base_currency = from_currency
      AND er.target_currency = to_currency
      AND er.effective_date <= as_of_date
      AND er.organization_id = org_id
    ORDER BY er.effective_date DESC
    LIMIT 1;
    
    IF rate IS NULL THEN
        RAISE EXCEPTION 'No exchange rate found for % to % as of %', from_currency, to_currency, as_of_date;
    END IF;
    
    RETURN ROUND(amount * rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── F4: Financial period closing mechanism ───
CREATE TYPE public.financial_period_status AS ENUM ('open', 'soft_close', 'hard_close');

CREATE TABLE IF NOT EXISTS public.financial_periods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name     TEXT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          public.financial_period_status NOT NULL DEFAULT 'open',
    closed_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    closed_at       TIMESTAMPTZ,
    notes           TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(start_date, end_date, organization_id),
    CHECK (end_date > start_date)
);

CREATE INDEX idx_financial_periods_org ON public.financial_periods(organization_id);
CREATE INDEX idx_financial_periods_dates ON public.financial_periods(start_date, end_date);

ALTER TABLE public.financial_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.financial_periods
    USING (organization_id = public.get_user_org_id());

CREATE TRIGGER set_updated_at_financial_periods
    BEFORE UPDATE ON public.financial_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: prevent mutations to budget_line_items in closed periods
CREATE OR REPLACE FUNCTION public.check_financial_period_open()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.financial_periods fp
        WHERE fp.organization_id = NEW.organization_id
          AND fp.status = 'hard_close'
          AND NEW.created_at::date BETWEEN fp.start_date AND fp.end_date
    ) THEN
        RAISE EXCEPTION 'Cannot modify financial data in a closed period';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_period_close_budget
    BEFORE INSERT OR UPDATE ON public.budget_line_items
    FOR EACH ROW EXECUTE FUNCTION public.check_financial_period_open();

-- ─── W1: State transition validation triggers ───
-- Project status transitions
CREATE OR REPLACE FUNCTION public.validate_project_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions JSONB := '{
        "draft": ["active", "cancelled"],
        "active": ["on_hold", "completed", "cancelled"],
        "on_hold": ["active", "cancelled"],
        "completed": [],
        "cancelled": []
    }'::jsonb;
    allowed TEXT[];
BEGIN
    IF OLD.status = NEW.status THEN RETURN NEW; END IF;
    
    SELECT ARRAY(SELECT jsonb_array_elements_text(valid_transitions -> OLD.status))
    INTO allowed;
    
    IF NEW.status = ANY(allowed) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid project status transition: % → %', OLD.status, NEW.status;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_project_transition
    BEFORE UPDATE OF status ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.validate_project_status_transition();

-- Work package status transitions
CREATE OR REPLACE FUNCTION public.validate_work_package_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions JSONB := '{
        "draft": ["planning", "cancelled"],
        "planning": ["approved", "cancelled"],
        "approved": ["in_progress", "on_hold", "cancelled"],
        "in_progress": ["qc_review", "on_hold", "cancelled"],
        "qc_review": ["done", "rework"],
        "rework": ["in_progress", "cancelled"],
        "on_hold": ["in_progress", "cancelled"],
        "done": [],
        "cancelled": []
    }'::jsonb;
    allowed TEXT[];
BEGIN
    IF OLD.status = NEW.status THEN RETURN NEW; END IF;
    
    SELECT ARRAY(SELECT jsonb_array_elements_text(valid_transitions -> OLD.status))
    INTO allowed;
    
    IF NEW.status = ANY(allowed) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid work package transition: % → %', OLD.status, NEW.status;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_work_package_transition
    BEFORE UPDATE OF status ON public.work_packages
    FOR EACH ROW EXECUTE FUNCTION public.validate_work_package_transition();

-- Deal stage transitions
CREATE OR REPLACE FUNCTION public.validate_deal_stage_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions JSONB := '{
        "lead": ["qualified", "lost"],
        "qualified": ["proposal", "lost"],
        "proposal": ["negotiation", "lost"],
        "negotiation": ["won", "lost"],
        "won": [],
        "lost": ["lead"]
    }'::jsonb;
    allowed TEXT[];
BEGIN
    IF OLD.stage = NEW.stage THEN RETURN NEW; END IF;
    
    SELECT ARRAY(SELECT jsonb_array_elements_text(valid_transitions -> OLD.stage))
    INTO allowed;
    
    IF NEW.stage = ANY(allowed) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid deal stage transition: % → %', OLD.stage, NEW.stage;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_deal_transition
    BEFORE UPDATE OF stage ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.validate_deal_stage_transition();

-- ─── X1: Incident ↔ Insurance junction table ───
CREATE TABLE IF NOT EXISTS public.incident_insurance_links (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id         UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    insurance_policy_id UUID NOT NULL REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
    claim_number        TEXT,
    claim_status        TEXT CHECK (claim_status IN ('pending', 'filed', 'under_review', 'approved', 'denied', 'settled')) DEFAULT 'pending',
    claim_amount        NUMERIC(14,2),
    settlement_amount   NUMERIC(14,2),
    notes               TEXT,
    organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(incident_id, insurance_policy_id)
);

CREATE INDEX idx_incident_insurance_incident ON public.incident_insurance_links(incident_id);
CREATE INDEX idx_incident_insurance_policy ON public.incident_insurance_links(insurance_policy_id);
CREATE INDEX idx_incident_insurance_org ON public.incident_insurance_links(organization_id);

ALTER TABLE public.incident_insurance_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.incident_insurance_links
    USING (organization_id = public.get_user_org_id());

CREATE TRIGGER set_updated_at_incident_insurance
    BEFORE UPDATE ON public.incident_insurance_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── TD-02: JSON Schema validation for JSONB config columns ───
CREATE OR REPLACE FUNCTION public.validate_phase_definitions()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate phase_definitions is a non-empty array of objects with required keys
    IF NEW.phase_definitions IS NOT NULL AND jsonb_typeof(NEW.phase_definitions) != 'array' THEN
        RAISE EXCEPTION 'phase_definitions must be a JSON array';
    END IF;
    
    IF NEW.default_qc_gates IS NOT NULL AND jsonb_typeof(NEW.default_qc_gates) != 'array' THEN
        RAISE EXCEPTION 'default_qc_gates must be a JSON array';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_production_vertical_config
    BEFORE INSERT OR UPDATE ON public.production_verticals
    FOR EACH ROW EXECUTE FUNCTION public.validate_phase_definitions();

-- ─── P3: PII sanitization function for audit log payloads ───
CREATE OR REPLACE FUNCTION public.sanitize_audit_payload(payload JSONB)
RETURNS JSONB AS $$
DECLARE
    pii_fields TEXT[] := ARRAY[
        'ssn', 'social_security', 'tax_id', 'bank_account', 'routing_number',
        'credit_card', 'password', 'password_hash', 'secret', 'token',
        'phone', 'email', 'address', 'date_of_birth', 'salary', 'compensation'
    ];
    field TEXT;
    result JSONB := payload;
BEGIN
    FOREACH field IN ARRAY pii_fields LOOP
        IF result ? field THEN
            result := result || jsonb_build_object(field, '***REDACTED***');
        END IF;
        -- Also check nested 'new' and 'old' objects
        IF result ? 'new' AND (result -> 'new') ? field THEN
            result := jsonb_set(result, ARRAY['new', field], '"***REDACTED***"');
        END IF;
        IF result ? 'old' AND (result -> 'old') ? field THEN
            result := jsonb_set(result, ARRAY['old', field], '"***REDACTED***"');
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── O3+O4: SLA monitoring tables + RTO/RPO documentation ───
CREATE TYPE public.sla_target_type AS ENUM (
    'task_completion', 'approval_turnaround', 'incident_response',
    'invoice_payment', 'deliverable_review', 'onboarding_completion',
    'support_response', 'change_order_approval'
);

CREATE TYPE public.sla_status AS ENUM ('on_track', 'at_risk', 'breached');

CREATE TABLE IF NOT EXISTS public.sla_definitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    target_type     public.sla_target_type NOT NULL,
    target_hours    NUMERIC(8,2) NOT NULL CHECK (target_hours > 0),
    warning_percent NUMERIC(5,2) NOT NULL DEFAULT 80 CHECK (warning_percent > 0 AND warning_percent < 100),
    applies_to_role TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sla_tracking (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_definition_id UUID NOT NULL REFERENCES public.sla_definitions(id) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_at          TIMESTAMPTZ NOT NULL,
    completed_at    TIMESTAMPTZ,
    status          public.sla_status NOT NULL DEFAULT 'on_track',
    elapsed_hours   NUMERIC(8,2),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to compute elapsed_hours (now() is not immutable, can't use GENERATED ALWAYS)
CREATE OR REPLACE FUNCTION public.compute_sla_elapsed_hours()
RETURNS TRIGGER AS $$
BEGIN
    NEW.elapsed_hours := EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, now()) - NEW.started_at)) / 3600.0;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sla_tracking_elapsed
    BEFORE INSERT OR UPDATE ON public.sla_tracking
    FOR EACH ROW EXECUTE FUNCTION public.compute_sla_elapsed_hours();

CREATE INDEX idx_sla_definitions_org ON public.sla_definitions(organization_id);
CREATE INDEX idx_sla_tracking_entity ON public.sla_tracking(entity_type, entity_id);
CREATE INDEX idx_sla_tracking_status ON public.sla_tracking(status) WHERE status != 'on_track';
CREATE INDEX idx_sla_tracking_due ON public.sla_tracking(due_at) WHERE completed_at IS NULL;
CREATE INDEX idx_sla_tracking_org ON public.sla_tracking(organization_id);

ALTER TABLE public.sla_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.sla_definitions
    USING (organization_id = public.get_user_org_id());
CREATE POLICY "org_isolation" ON public.sla_tracking
    USING (organization_id = public.get_user_org_id());

CREATE TRIGGER set_updated_at_sla_definitions
    BEFORE UPDATE ON public.sla_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── O4: RTO/RPO Configuration ───
CREATE TABLE IF NOT EXISTS public.resilience_targets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name        TEXT NOT NULL,
    rto_minutes         INTEGER NOT NULL CHECK (rto_minutes > 0),
    rpo_minutes         INTEGER NOT NULL CHECK (rpo_minutes > 0),
    backup_frequency    TEXT NOT NULL DEFAULT 'daily',
    last_tested_at      TIMESTAMPTZ,
    test_result         TEXT CHECK (test_result IN ('passed', 'failed', 'partial')),
    notes               TEXT,
    organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resilience_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.resilience_targets
    USING (organization_id = public.get_user_org_id());

-- ─── Idempotency keys table (S6) ───
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    key             TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       UUID,
    response_status INTEGER,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    PRIMARY KEY (key, organization_id)
);

CREATE INDEX idx_idempotency_expires ON public.idempotency_keys(expires_at);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.idempotency_keys
    USING (organization_id = public.get_user_org_id());

-- ─── X2: Event propagation log for cross-domain events ───
CREATE TYPE public.domain_event_status AS ENUM ('pending', 'delivered', 'failed', 'expired');

CREATE TABLE IF NOT EXISTS public.domain_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      TEXT NOT NULL,
    source_domain   TEXT NOT NULL,
    target_domain   TEXT,
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}',
    status          public.domain_event_status NOT NULL DEFAULT 'pending',
    processed_at    TIMESTAMPTZ,
    error_message   TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_domain_events_status ON public.domain_events(status) WHERE status = 'pending';
CREATE INDEX idx_domain_events_entity ON public.domain_events(entity_type, entity_id);
CREATE INDEX idx_domain_events_org ON public.domain_events(organization_id);
CREATE INDEX idx_domain_events_type ON public.domain_events(event_type, created_at DESC);

ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.domain_events
    USING (organization_id = public.get_user_org_id());

-- ─── P1+P2: Data export requests + anonymization scheduling ───
CREATE TYPE public.data_export_status AS ENUM ('requested', 'processing', 'ready', 'downloaded', 'expired');

CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    export_format   TEXT NOT NULL CHECK (export_format IN ('json', 'csv')) DEFAULT 'json',
    status          public.data_export_status NOT NULL DEFAULT 'requested',
    file_path       TEXT,
    file_size_bytes BIGINT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_data_exports_user ON public.data_export_requests(user_id);
CREATE INDEX idx_data_exports_status ON public.data_export_requests(status);
CREATE INDEX idx_data_exports_org ON public.data_export_requests(organization_id);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_exports" ON public.data_export_requests
    USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.anonymization_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scheduled_for   TIMESTAMPTZ NOT NULL,
    processed_at    TIMESTAMPTZ,
    status          TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    error_message   TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_anonymization_pending ON public.anonymization_queue(scheduled_for)
    WHERE status = 'pending';
CREATE INDEX idx_anonymization_org ON public.anonymization_queue(organization_id);

ALTER TABLE public.anonymization_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON public.anonymization_queue
    USING (organization_id = public.get_user_org_id());
