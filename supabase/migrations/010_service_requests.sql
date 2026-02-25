-- ═══════════════════════════════════════════════════════════════════════════
-- FROZEN PHOENIX — Service/Work Requests (Jobber feature parity)
-- Client-initiated requests that get triaged into quotes, work orders, or projects
-- Maintains 3NF compliance, SSOT, referential integrity
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE service_request_status AS ENUM (
    'new', 'acknowledged', 'assessment_scheduled', 'quoted', 'approved',
    'converted', 'declined', 'cancelled', 'archived'
);

CREATE TYPE service_request_source AS ENUM (
    'client_portal', 'online_booking', 'phone', 'email', 'walk_in',
    'referral', 'social_media', 'website_form', 'vendor_portal', 'internal'
);

CREATE TYPE service_request_priority AS ENUM ('low', 'normal', 'high', 'urgent', 'emergency');

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE REQUESTS TABLE
-- Captures incoming work/service requests before they become formal
-- quotes, estimates, or work orders.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Requester (client-side)
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    requester_name TEXT,
    requester_email TEXT,
    requester_phone TEXT,

    -- Request details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    service_type TEXT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    location_notes TEXT,

    -- Scheduling preference
    preferred_date DATE,
    preferred_time_start TEXT,
    preferred_time_end TEXT,
    is_flexible BOOLEAN DEFAULT true,

    -- Priority & Status
    priority service_request_priority NOT NULL DEFAULT 'normal',
    status service_request_status NOT NULL DEFAULT 'new',
    source service_request_source NOT NULL DEFAULT 'client_portal',

    -- Assessment
    requires_assessment BOOLEAN DEFAULT false,
    assessment_date TIMESTAMPTZ,
    assessment_notes TEXT,
    assessed_by UUID REFERENCES profiles(id),

    -- Attachments (photos, docs from client)
    attachment_urls TEXT[] DEFAULT '{}',

    -- Conversion tracking
    converted_to_type TEXT CHECK (converted_to_type IN ('estimate', 'work_order', 'project', 'deal')),
    converted_to_id UUID,
    converted_at TIMESTAMPTZ,
    converted_by UUID REFERENCES profiles(id),

    -- Assignment
    assigned_to UUID REFERENCES profiles(id),

    -- Internal notes
    internal_notes TEXT,

    -- Metadata
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_requests_org ON service_requests(organization_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_priority ON service_requests(priority);
CREATE INDEX idx_service_requests_company ON service_requests(company_id);
CREATE INDEX idx_service_requests_contact ON service_requests(contact_id);
CREATE INDEX idx_service_requests_source ON service_requests(source);
CREATE INDEX idx_service_requests_assigned ON service_requests(assigned_to);
CREATE INDEX idx_service_requests_created ON service_requests(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service_requests in their org" ON service_requests
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert service_requests in their org" ON service_requests
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update service_requests in their org" ON service_requests
    FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER log_service_requests_activity AFTER INSERT OR UPDATE OR DELETE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION log_activity();
