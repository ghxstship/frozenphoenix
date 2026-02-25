-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Productive.io Feature Integration Migration
-- Adds CRM, Resource Planning, Billing, Dashboards, Documents, and Automations
-- Maintains 3NF compliance and SSOT principles
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE custom_field_type AS ENUM ('text', 'number', 'date', 'datetime', 'boolean', 'select', 'multi_select', 'url', 'email', 'phone', 'currency', 'user', 'file');
CREATE TYPE entity_type AS ENUM ('project', 'task', 'deal', 'contact', 'company', 'crew_member', 'asset', 'invoice', 'proposal', 'document');
CREATE TYPE automation_trigger AS ENUM ('created', 'updated', 'status_changed', 'assigned', 'due_date_approaching', 'overdue', 'field_changed', 'time_logged', 'budget_threshold', 'scheduled');
CREATE TYPE automation_action AS ENUM ('send_notification', 'send_email', 'update_field', 'create_task', 'assign_user', 'move_stage', 'add_comment', 'webhook', 'slack_message');
CREATE TYPE booking_status AS ENUM ('tentative', 'confirmed', 'cancelled');
CREATE TYPE booking_type AS ENUM ('project_work', 'internal', 'time_off', 'training', 'admin');
CREATE TYPE time_off_type AS ENUM ('vacation', 'sick', 'personal', 'parental', 'bereavement', 'jury_duty', 'holiday', 'unpaid', 'other');
CREATE TYPE time_off_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised');
CREATE TYPE billing_type AS ENUM ('fixed_price', 'time_and_materials', 'retainer', 'non_billable', 'milestone');
CREATE TYPE invoice_delivery_status AS ENUM ('draft', 'sent', 'viewed', 'reminded', 'paid', 'overdue', 'disputed', 'void');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'failed');
CREATE TYPE widget_type AS ENUM ('number', 'chart_bar', 'chart_line', 'chart_pie', 'chart_donut', 'table', 'list', 'progress', 'gauge', 'calendar', 'timeline');
CREATE TYPE document_type AS ENUM ('doc', 'wiki', 'meeting_notes', 'specification', 'proposal_doc', 'sow', 'template');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: CRM FOUNDATION (Companies, Contacts, Pipelines)
-- ─────────────────────────────────────────────────────────────────────────────

-- Companies (SSOT for all client/brand data)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    industry TEXT,
    website TEXT,
    
    -- Contact Info
    phone TEXT,
    email TEXT,
    
    -- Address
    address_street1 TEXT,
    address_street2 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_postal_code TEXT,
    address_country TEXT DEFAULT 'USA',
    
    -- Billing
    billing_address_same BOOLEAN DEFAULT true,
    billing_street1 TEXT,
    billing_street2 TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_postal_code TEXT,
    billing_country TEXT,
    default_currency TEXT DEFAULT 'USD',
    payment_terms_days INTEGER DEFAULT 30,
    tax_id TEXT,
    
    -- Relationship
    company_type TEXT NOT NULL DEFAULT 'client' CHECK (company_type IN ('client', 'brand', 'agency', 'vendor', 'partner')),
    account_manager_id UUID REFERENCES profiles(id),
    parent_company_id UUID REFERENCES companies(id),
    
    -- Branding (links to brand_kits)
    brand_kit_id UUID REFERENCES brand_kits(id),
    logo_url TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'inactive', 'churned')),
    
    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_org ON companies(organization_id);
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_name ON companies(name);

-- Contacts (SSOT for all contact persons)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Name
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    preferred_name TEXT,
    
    -- Contact Info
    email TEXT,
    phone TEXT,
    mobile TEXT,
    
    -- Position
    title TEXT,
    department TEXT,
    
    -- Role in relationship
    is_primary BOOLEAN DEFAULT false,
    is_billing_contact BOOLEAN DEFAULT false,
    is_decision_maker BOOLEAN DEFAULT false,
    
    -- Social
    linkedin_url TEXT,
    
    -- Communication
    preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'mobile')),
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
    -- Notes
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(full_name);

-- Sales Pipelines
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Configuration
    is_default BOOLEAN DEFAULT false,
    color TEXT,
    icon TEXT,
    
    -- Stages (ordered array of stage definitions)
    stages JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"id": "uuid", "name": "Lead", "order": 1, "probability": 10, "color": "#hex", "rotting_days": 14}]
    
    -- Automation
    default_assignee_id UUID REFERENCES profiles(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipelines_org ON pipelines(organization_id);
CREATE INDEX idx_pipelines_active ON pipelines(is_active);

-- Lost Reasons (for deal analytics)
CREATE TABLE lost_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lost_reasons_org ON lost_reasons(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: CUSTOM FIELDS SYSTEM
-- ─────────────────────────────────────────────────────────────────────────────

-- Custom Field Definitions
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type entity_type NOT NULL,
    
    -- Definition
    name TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_type custom_field_type NOT NULL,
    description TEXT,
    
    -- Configuration
    is_required BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT true,
    is_visible_in_list BOOLEAN DEFAULT true,
    default_value TEXT,
    
    -- For select/multi_select types
    options JSONB DEFAULT '[]',
    -- Format: [{"value": "option1", "label": "Option 1", "color": "#hex"}]
    
    -- Validation
    validation_rules JSONB DEFAULT '{}',
    -- Format: {"min": 0, "max": 100, "pattern": "regex", "min_length": 1}
    
    -- Display
    display_order INTEGER DEFAULT 0,
    group_name TEXT,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, entity_type, field_key)
);

CREATE INDEX idx_custom_fields_org ON custom_fields(organization_id);
CREATE INDEX idx_custom_fields_entity ON custom_fields(entity_type);

-- Custom Field Values
CREATE TABLE custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    
    -- Value storage (use appropriate column based on field_type)
    value_text TEXT,
    value_number NUMERIC,
    value_boolean BOOLEAN,
    value_date DATE,
    value_datetime TIMESTAMPTZ,
    value_json JSONB,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(custom_field_id, entity_id)
);

CREATE INDEX idx_custom_field_values_field ON custom_field_values(custom_field_id);
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: SAVED VIEWS & TASK VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

-- Saved Views
CREATE TABLE saved_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type entity_type NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Definition
    name TEXT NOT NULL,
    description TEXT,
    
    -- View Configuration
    view_type TEXT NOT NULL CHECK (view_type IN ('board', 'list', 'table', 'calendar', 'timeline', 'gantt', 'workload')),
    
    -- Filters, Sorting, Grouping
    filters JSONB DEFAULT '[]',
    -- Format: [{"field": "status", "operator": "equals", "value": "in_progress"}]
    
    sort_by JSONB DEFAULT '[]',
    -- Format: [{"field": "due_date", "direction": "asc"}]
    
    group_by TEXT,
    
    -- Column Configuration (for table/list views)
    visible_columns TEXT[] DEFAULT '{}',
    column_widths JSONB DEFAULT '{}',
    
    -- Board Configuration (for board view)
    board_config JSONB DEFAULT '{}',
    -- Format: {"group_by": "status", "card_fields": ["assignee", "due_date"]}
    
    -- Sharing
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    shared_with_team_ids UUID[] DEFAULT '{}',
    
    -- Owner
    owner_id UUID NOT NULL REFERENCES profiles(id),
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_views_org ON saved_views(organization_id);
CREATE INDEX idx_saved_views_owner ON saved_views(owner_id);
CREATE INDEX idx_saved_views_project ON saved_views(project_id);
CREATE INDEX idx_saved_views_entity ON saved_views(entity_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: AUTOMATIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Automation Definitions
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Scope
    entity_type entity_type NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Execution
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automations_org ON automations(organization_id);
CREATE INDEX idx_automations_entity ON automations(entity_type);
CREATE INDEX idx_automations_active ON automations(is_active);

-- Automation Rules
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    
    -- Trigger
    trigger_type automation_trigger NOT NULL,
    trigger_config JSONB DEFAULT '{}',
    -- Format: {"field": "status", "from": "todo", "to": "in_progress"} or {"days_before": 3}
    
    -- Conditions (all must be true)
    conditions JSONB DEFAULT '[]',
    -- Format: [{"field": "priority", "operator": "equals", "value": "high"}]
    
    -- Action
    action_type automation_action NOT NULL,
    action_config JSONB DEFAULT '{}',
    -- Format: {"user_id": "uuid", "message": "Task assigned"} or {"field": "status", "value": "done"}
    
    -- Order
    execution_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_automation ON automation_rules(automation_id);
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);

-- Automation Logs
CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    automation_rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
    
    -- Execution
    entity_id UUID NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Result
    success BOOLEAN NOT NULL,
    error_message TEXT,
    execution_data JSONB DEFAULT '{}',
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_automation_logs_automation ON automation_logs(automation_id);
CREATE INDEX idx_automation_logs_triggered ON automation_logs(triggered_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: RATE CARDS & BILLING
-- ─────────────────────────────────────────────────────────────────────────────

-- Rate Cards
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Type
    is_default BOOLEAN DEFAULT false,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Currency
    currency TEXT DEFAULT 'USD',
    
    -- Validity
    effective_date DATE,
    expiration_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_cards_org ON rate_cards(organization_id);
CREATE INDEX idx_rate_cards_company ON rate_cards(company_id);
CREATE INDEX idx_rate_cards_active ON rate_cards(is_active);

-- Rate Card Items
CREATE TABLE rate_card_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
    
    -- Service Definition
    service_name TEXT NOT NULL,
    service_description TEXT,
    
    -- Role/Department (for labor rates)
    role TEXT,
    department department,
    
    -- Rates
    hourly_rate NUMERIC(10,2),
    daily_rate NUMERIC(10,2),
    unit_rate NUMERIC(10,2),
    unit_name TEXT DEFAULT 'hour',
    
    -- Cost (internal)
    internal_cost_rate NUMERIC(10,2),
    
    -- Billing
    billing_type billing_type DEFAULT 'time_and_materials',
    is_billable BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_card_items_card ON rate_card_items(rate_card_id);
CREATE INDEX idx_rate_card_items_role ON rate_card_items(role);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: RESOURCE PLANNING
-- ─────────────────────────────────────────────────────────────────────────────

-- Resource Bookings (unified booking system)
CREATE TABLE resource_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Resource (one of these)
    crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
    placeholder_name TEXT,
    
    -- Project/Task
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES production_tasks(id) ON DELETE SET NULL,
    
    -- Booking Details
    booking_type booking_type NOT NULL DEFAULT 'project_work',
    status booking_status NOT NULL DEFAULT 'tentative',
    
    -- Time
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_day NUMERIC(4,2) DEFAULT 8,
    total_hours NUMERIC(8,2) GENERATED ALWAYS AS (
        (end_date - start_date + 1) * hours_per_day
    ) STORED,
    
    -- Role
    role TEXT,
    department department,
    
    -- Rates
    rate NUMERIC(10,2),
    rate_type rate_type DEFAULT 'hourly',
    
    -- Notes
    notes TEXT,
    
    -- Conflict tracking
    has_conflict BOOLEAN DEFAULT false,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (crew_member_id IS NOT NULL OR placeholder_name IS NOT NULL)
);

CREATE INDEX idx_resource_bookings_org ON resource_bookings(organization_id);
CREATE INDEX idx_resource_bookings_crew ON resource_bookings(crew_member_id);
CREATE INDEX idx_resource_bookings_project ON resource_bookings(project_id);
CREATE INDEX idx_resource_bookings_dates ON resource_bookings(start_date, end_date);
CREATE INDEX idx_resource_bookings_status ON resource_bookings(status);

-- Time Off Requests
CREATE TABLE time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    
    -- Request Details
    time_off_type time_off_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_day NUMERIC(4,2) DEFAULT 8,
    is_half_day BOOLEAN DEFAULT false,
    
    -- Reason
    reason TEXT,
    
    -- Approval
    status time_off_status NOT NULL DEFAULT 'pending',
    approver_id UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Notes
    notes TEXT,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_off_requests_org ON time_off_requests(organization_id);
CREATE INDEX idx_time_off_requests_crew ON time_off_requests(crew_member_id);
CREATE INDEX idx_time_off_requests_dates ON time_off_requests(start_date, end_date);
CREATE INDEX idx_time_off_requests_status ON time_off_requests(status);

-- Active Timers
CREATE TABLE active_timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- What are we timing
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES production_tasks(id) ON DELETE SET NULL,
    
    -- Timer
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT,
    
    -- Billing
    is_billable BOOLEAN DEFAULT true,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Only one active timer per user
    UNIQUE(user_id)
);

CREATE INDEX idx_active_timers_user ON active_timers(user_id);
CREATE INDEX idx_active_timers_project ON active_timers(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: PROPOSALS & QUOTES
-- ─────────────────────────────────────────────────────────────────────────────

-- Proposals
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Identification
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    
    -- Content
    introduction TEXT,
    scope_of_work TEXT,
    deliverables TEXT,
    terms_and_conditions TEXT,
    
    -- Pricing
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(14,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(14,2) DEFAULT 0,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Timeline
    valid_until DATE,
    proposed_start_date DATE,
    proposed_end_date DATE,
    
    -- Status
    status proposal_status NOT NULL DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Signature
    signature_required BOOLEAN DEFAULT false,
    signed_by TEXT,
    signed_at TIMESTAMPTZ,
    signature_ip TEXT,
    
    -- Conversion
    converted_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Template
    template_id UUID,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_org ON proposals(organization_id);
CREATE INDEX idx_proposals_deal ON proposals(deal_id);
CREATE INDEX idx_proposals_company ON proposals(company_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_number ON proposals(number);

-- Proposal Items
CREATE TABLE proposal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    
    -- Item Details
    name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'unit',
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Categorization
    category TEXT,
    phase production_phase,
    
    -- Rate Card Reference
    rate_card_item_id UUID REFERENCES rate_card_items(id) ON DELETE SET NULL,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_optional BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposal_items_proposal ON proposal_items(proposal_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: ENHANCED INVOICING
-- ─────────────────────────────────────────────────────────────────────────────

-- Invoice Templates
CREATE TABLE invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    
    -- Branding
    logo_url TEXT,
    header_text TEXT,
    footer_text TEXT,
    
    -- Styling
    primary_color TEXT DEFAULT '#000000',
    accent_color TEXT DEFAULT '#666666',
    font_family TEXT DEFAULT 'Inter',
    
    -- Content
    show_logo BOOLEAN DEFAULT true,
    show_company_address BOOLEAN DEFAULT true,
    show_line_item_details BOOLEAN DEFAULT true,
    show_tax_breakdown BOOLEAN DEFAULT true,
    
    -- Payment
    payment_instructions TEXT,
    bank_details TEXT,
    
    -- Default
    is_default BOOLEAN DEFAULT false,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_templates_org ON invoice_templates(organization_id);

-- Recurring Invoices
CREATE TABLE recurring_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Schedule
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 28),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE NOT NULL,
    last_invoice_date DATE,
    
    -- Amount
    amount NUMERIC(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Template
    template_id UUID REFERENCES invoice_templates(id) ON DELETE SET NULL,
    
    -- Content
    description TEXT,
    line_items JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    invoices_generated INTEGER DEFAULT 0,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_invoices_org ON recurring_invoices(organization_id);
CREATE INDEX idx_recurring_invoices_company ON recurring_invoices(company_id);
CREATE INDEX idx_recurring_invoices_next ON recurring_invoices(next_invoice_date);
CREATE INDEX idx_recurring_invoices_active ON recurring_invoices(is_active);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount NUMERIC(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_date DATE NOT NULL,
    
    -- Method
    payment_method payment_method NOT NULL,
    reference_number TEXT,
    
    -- Status
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- Notes
    notes TEXT,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);

-- Credit Notes
CREATE TABLE credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Identification
    number TEXT NOT NULL,
    
    -- Amount
    amount NUMERIC(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Reason
    reason TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'void')),
    issued_at TIMESTAMPTZ,
    applied_at TIMESTAMPTZ,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_notes_invoice ON credit_notes(invoice_id);
CREATE INDEX idx_credit_notes_status ON credit_notes(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: DASHBOARDS & REPORTING
-- ─────────────────────────────────────────────────────────────────────────────

-- Dashboards
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Layout
    layout JSONB DEFAULT '[]',
    -- Format: [{"widget_id": "uuid", "x": 0, "y": 0, "w": 4, "h": 2}]
    
    -- Sharing
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    shared_with_role TEXT,
    
    -- Owner
    owner_id UUID NOT NULL REFERENCES profiles(id),
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboards_org ON dashboards(organization_id);
CREATE INDEX idx_dashboards_owner ON dashboards(owner_id);

-- Dashboard Widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    
    -- Widget Definition
    name TEXT NOT NULL,
    widget_type widget_type NOT NULL,
    
    -- Data Source
    data_source TEXT NOT NULL,
    -- e.g., 'projects', 'tasks', 'time_entries', 'invoices', 'deals'
    
    -- Configuration
    config JSONB DEFAULT '{}',
    -- Format varies by widget type:
    -- number: {"metric": "count", "filters": [...]}
    -- chart: {"x_axis": "date", "y_axis": "amount", "group_by": "status"}
    
    -- Filters
    filters JSONB DEFAULT '[]',
    
    -- Time Range
    time_range TEXT DEFAULT 'this_month',
    -- Options: 'today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'custom'
    
    -- Refresh
    refresh_interval_seconds INTEGER DEFAULT 300,
    last_refreshed_at TIMESTAMPTZ,
    
    -- Display
    title TEXT,
    subtitle TEXT,
    color TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 10: DOCUMENTS & COLLABORATION
-- ─────────────────────────────────────────────────────────────────────────────

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Hierarchy
    parent_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Content
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    -- Stored as structured JSON (e.g., ProseMirror/TipTap format)
    
    -- Type
    document_type document_type NOT NULL DEFAULT 'doc',
    
    -- Template
    template_id UUID,
    
    -- Status
    status document_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    
    -- Cover
    cover_image_url TEXT,
    icon TEXT,
    
    -- Sharing
    is_public BOOLEAN DEFAULT false,
    shared_with_user_ids UUID[] DEFAULT '{}',
    shared_with_team_ids UUID[] DEFAULT '{}',
    
    -- Permissions
    can_comment BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    
    -- Owner
    owner_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Last Editor
    last_edited_by UUID REFERENCES profiles(id),
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_parent ON documents(parent_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Document Versions
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Version
    version_number INTEGER NOT NULL,
    
    -- Content Snapshot
    content JSONB NOT NULL,
    title TEXT NOT NULL,
    
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Change Description
    change_description TEXT,
    
    UNIQUE(document_id, version_number)
);

CREATE INDEX idx_document_versions_document ON document_versions(document_id);
CREATE INDEX idx_document_versions_created ON document_versions(created_at DESC);

-- Document Templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Content
    content JSONB NOT NULL DEFAULT '{}',
    
    -- Type
    document_type document_type NOT NULL DEFAULT 'doc',
    
    -- Category
    category TEXT,
    
    -- Preview
    preview_image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_templates_org ON document_templates(organization_id);
CREATE INDEX idx_document_templates_type ON document_templates(document_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 11: EXISTING TABLE MODIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Add company_id to projects (SSOT for client)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_type billing_type DEFAULT 'fixed_price';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rate_card_id UUID REFERENCES rate_cards(id) ON DELETE SET NULL;

-- Add is_billable to time entries
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT true;
ALTER TABLE production_time_entries ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT true;

-- Add pipeline and conversion fields to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lost_reason_id UUID REFERENCES lost_reasons(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS converted_project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- Add template and delivery tracking to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES invoice_templates(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS delivery_status invoice_delivery_status DEFAULT 'draft';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Add view position to tasks for board view
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS board_position INTEGER;
ALTER TABLE production_tasks ADD COLUMN IF NOT EXISTS board_position INTEGER;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 12: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Standard org-based policies (only for tables with organization_id column)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'companies', 'contacts', 'pipelines', 'lost_reasons',
        'custom_fields', 'custom_field_values', 'saved_views',
        'automations', 'automation_logs',
        'rate_cards', 'resource_bookings',
        'time_off_requests', 'active_timers', 'proposals',
        'invoice_templates', 'recurring_invoices', 'payments', 'credit_notes',
        'dashboards', 'documents', 'document_templates'
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

-- Rate card items policy (via rate_cards)
CREATE POLICY "Users can view rate_card_items via rate_cards" ON rate_card_items
    FOR SELECT USING (rate_card_id IN (
        SELECT id FROM rate_cards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can insert rate_card_items via rate_cards" ON rate_card_items
    FOR INSERT WITH CHECK (rate_card_id IN (
        SELECT id FROM rate_cards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can update rate_card_items via rate_cards" ON rate_card_items
    FOR UPDATE USING (rate_card_id IN (
        SELECT id FROM rate_cards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can delete rate_card_items via rate_cards" ON rate_card_items
    FOR DELETE USING (rate_card_id IN (
        SELECT id FROM rate_cards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Proposal items policy (via proposals)
CREATE POLICY "Users can view proposal_items via proposals" ON proposal_items
    FOR SELECT USING (proposal_id IN (
        SELECT id FROM proposals WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can insert proposal_items via proposals" ON proposal_items
    FOR INSERT WITH CHECK (proposal_id IN (
        SELECT id FROM proposals WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can update proposal_items via proposals" ON proposal_items
    FOR UPDATE USING (proposal_id IN (
        SELECT id FROM proposals WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can delete proposal_items via proposals" ON proposal_items
    FOR DELETE USING (proposal_id IN (
        SELECT id FROM proposals WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Dashboard widgets policy (via dashboards)
CREATE POLICY "Users can view dashboard_widgets via dashboards" ON dashboard_widgets
    FOR SELECT USING (dashboard_id IN (
        SELECT id FROM dashboards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can insert dashboard_widgets via dashboards" ON dashboard_widgets
    FOR INSERT WITH CHECK (dashboard_id IN (
        SELECT id FROM dashboards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can update dashboard_widgets via dashboards" ON dashboard_widgets
    FOR UPDATE USING (dashboard_id IN (
        SELECT id FROM dashboards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can delete dashboard_widgets via dashboards" ON dashboard_widgets
    FOR DELETE USING (dashboard_id IN (
        SELECT id FROM dashboards WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Document versions policy (via documents)
CREATE POLICY "Users can view document_versions via documents" ON document_versions
    FOR SELECT USING (document_id IN (
        SELECT id FROM documents WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can insert document_versions via documents" ON document_versions
    FOR INSERT WITH CHECK (document_id IN (
        SELECT id FROM documents WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Automation rules policy (via automations)
CREATE POLICY "Users can view automation_rules via automations" ON automation_rules
    FOR SELECT USING (automation_id IN (
        SELECT id FROM automations WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can insert automation_rules via automations" ON automation_rules
    FOR INSERT WITH CHECK (automation_id IN (
        SELECT id FROM automations WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can update automation_rules via automations" ON automation_rules
    FOR UPDATE USING (automation_id IN (
        SELECT id FROM automations WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
CREATE POLICY "Users can delete automation_rules via automations" ON automation_rules
    FOR DELETE USING (automation_id IN (
        SELECT id FROM automations WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 13: TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Add updated_at triggers
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'companies', 'contacts', 'pipelines', 'custom_fields', 'custom_field_values',
        'saved_views', 'automations', 'automation_rules', 'rate_cards', 'rate_card_items',
        'resource_bookings', 'time_off_requests', 'proposals', 'proposal_items',
        'invoice_templates', 'recurring_invoices', 'credit_notes',
        'dashboards', 'dashboard_widgets', 'documents', 'document_templates'
    ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 14: UTILITY FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to calculate utilization for a crew member
CREATE OR REPLACE FUNCTION calculate_utilization(
    p_crew_member_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS NUMERIC AS $$
DECLARE
    total_available_hours NUMERIC;
    total_booked_hours NUMERIC;
BEGIN
    -- Calculate available hours (8 hours per weekday, minus time off)
    SELECT COUNT(*) * 8 INTO total_available_hours
    FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d
    WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
    AND d::date NOT IN (
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date
        FROM time_off_requests
        WHERE crew_member_id = p_crew_member_id
        AND status = 'approved'
    );
    
    -- Calculate booked hours
    SELECT COALESCE(SUM(
        (LEAST(end_date, p_end_date) - GREATEST(start_date, p_start_date) + 1) * hours_per_day
    ), 0) INTO total_booked_hours
    FROM resource_bookings
    WHERE crew_member_id = p_crew_member_id
    AND status = 'confirmed'
    AND start_date <= p_end_date
    AND end_date >= p_start_date;
    
    IF total_available_hours = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((total_booked_hours / total_available_hours) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this booking overlaps with any existing confirmed booking
    IF EXISTS (
        SELECT 1 FROM resource_bookings
        WHERE crew_member_id = NEW.crew_member_id
        AND id != NEW.id
        AND status = 'confirmed'
        AND start_date <= NEW.end_date
        AND end_date >= NEW.start_date
        AND (
            -- Check if combined hours exceed 8 per day
            NEW.hours_per_day + hours_per_day > 8
        )
    ) THEN
        NEW.has_conflict := true;
    ELSE
        NEW.has_conflict := false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_booking_conflicts_trigger
    BEFORE INSERT OR UPDATE ON resource_bookings
    FOR EACH ROW EXECUTE FUNCTION check_booking_conflicts();

-- Function to generate next proposal number
CREATE OR REPLACE FUNCTION generate_proposal_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(number FROM '\d+$') AS INTEGER)
    ), 0) + 1 INTO next_num
    FROM proposals
    WHERE organization_id = p_org_id
    AND number LIKE 'PROP-' || year_prefix || '-%';
    
    RETURN 'PROP-' || year_prefix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to convert deal to project
CREATE OR REPLACE FUNCTION convert_deal_to_project(p_deal_id UUID)
RETURNS UUID AS $$
DECLARE
    v_deal deals%ROWTYPE;
    v_project_id UUID;
BEGIN
    SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
    
    IF v_deal.stage != 'won' THEN
        RAISE EXCEPTION 'Deal must be in won stage to convert';
    END IF;
    
    IF v_deal.converted_project_id IS NOT NULL THEN
        RAISE EXCEPTION 'Deal has already been converted';
    END IF;
    
    INSERT INTO projects (
        name,
        client,
        company_id,
        status,
        start_date,
        end_date,
        budget_planned,
        manager_id,
        organization_id
    ) VALUES (
        v_deal.title,
        v_deal.company,
        v_deal.company_id,
        'draft',
        COALESCE(v_deal.expected_close_date, CURRENT_DATE),
        COALESCE(v_deal.expected_close_date + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days'),
        v_deal.value,
        v_deal.assigned_to,
        v_deal.organization_id
    ) RETURNING id INTO v_project_id;
    
    UPDATE deals
    SET converted_project_id = v_project_id,
        converted_at = NOW()
    WHERE id = p_deal_id;
    
    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────════════════════════════════════════
-- SECTION 15: VIEWS FOR REPORTING
-- ─────────────────────────────────────────────────────────────────────────────

-- Utilization Summary View
CREATE OR REPLACE VIEW v_crew_utilization AS
SELECT 
    cm.id AS crew_member_id,
    cm.name,
    cm.department,
    cm.organization_id,
    DATE_TRUNC('month', CURRENT_DATE) AS period_start,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date AS period_end,
    calculate_utilization(
        cm.id,
        DATE_TRUNC('month', CURRENT_DATE)::date,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date
    ) AS utilization_percent
FROM crew_members cm
WHERE cm.status = 'available';

-- Project Profitability View
CREATE OR REPLACE VIEW v_project_profitability AS
SELECT 
    p.id AS project_id,
    p.name,
    p.client,
    p.company_id,
    p.organization_id,
    p.budget_planned,
    p.budget_actual,
    (p.budget_planned - p.budget_actual) AS budget_variance,
    CASE 
        WHEN p.budget_planned > 0 
        THEN ROUND(((p.budget_planned - p.budget_actual) / p.budget_planned) * 100, 2)
        ELSE 0 
    END AS margin_percent,
    COALESCE(te.total_hours, 0) AS total_hours_logged,
    COALESCE(te.total_cost, 0) AS total_labor_cost,
    COALESCE(ex.total_expenses, 0) AS total_expenses
FROM projects p
LEFT JOIN (
    SELECT 
        project_id,
        SUM(hours_worked) AS total_hours,
        SUM(total_cost) AS total_cost
    FROM time_entries
    GROUP BY project_id
) te ON te.project_id = p.id
LEFT JOIN (
    SELECT 
        project_id,
        SUM(amount) AS total_expenses
    FROM expenses
    WHERE status = 'approved'
    GROUP BY project_id
) ex ON ex.project_id = p.id;

-- Pipeline Summary View
CREATE OR REPLACE VIEW v_pipeline_summary AS
SELECT 
    d.organization_id,
    d.pipeline_id,
    p.name AS pipeline_name,
    d.stage,
    COUNT(*) AS deal_count,
    SUM(d.value) AS total_value,
    AVG(d.probability) AS avg_probability,
    SUM(d.value * d.probability / 100) AS weighted_value
FROM deals d
LEFT JOIN pipelines p ON p.id = d.pipeline_id
WHERE d.stage NOT IN ('won', 'lost')
GROUP BY d.organization_id, d.pipeline_id, p.name, d.stage;

-- Invoice Aging View
CREATE OR REPLACE VIEW v_invoice_aging AS
SELECT 
    i.organization_id,
    i.id AS invoice_id,
    i.vendor_id,
    i.company_id,
    i.amount,
    i.due_date,
    i.status,
    CURRENT_DATE - i.due_date AS days_overdue,
    CASE 
        WHEN CURRENT_DATE - i.due_date <= 0 THEN 'current'
        WHEN CURRENT_DATE - i.due_date <= 30 THEN '1-30 days'
        WHEN CURRENT_DATE - i.due_date <= 60 THEN '31-60 days'
        WHEN CURRENT_DATE - i.due_date <= 90 THEN '61-90 days'
        ELSE '90+ days'
    END AS aging_bucket
FROM invoices i
WHERE i.status NOT IN ('paid', 'void');
