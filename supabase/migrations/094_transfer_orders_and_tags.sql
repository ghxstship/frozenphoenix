-- ═══════════════════════════════════════════════════════════════
-- Migration 094: Transfer Orders + Tags (cross-entity tagging)
--
-- Creates two missing tables referenced in MODULE_WORKSTREAM_MATRIX:
--   1. transfer_orders — inter-location asset/inventory transfers
--   2. tags — cross-entity tagging definitions (WS-10.7)
-- ═══════════════════════════════════════════════════════════════

-- ─── ENABLE MODDATETIME EXTENSION ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- ─── TRANSFER ORDER STATUS ENUM ─────────────────────────────
CREATE TYPE public.transfer_order_status AS ENUM (
    'draft',
    'requested',
    'approved',
    'in_transit',
    'partially_received',
    'received',
    'cancelled'
);

-- ─── TRANSFER ORDERS TABLE ──────────────────────────────────
CREATE TABLE public.transfer_orders (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transfer_number text NOT NULL,
    status          public.transfer_order_status NOT NULL DEFAULT 'draft',
    origin_location_id   uuid REFERENCES public.locations(id),
    destination_location_id uuid REFERENCES public.locations(id),
    requested_by    uuid REFERENCES auth.users(id),
    approved_by     uuid REFERENCES auth.users(id),
    requested_date  timestamptz,
    expected_arrival_date timestamptz,
    actual_arrival_date   timestamptz,
    notes           text,
    priority        text CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    total_items     integer DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid REFERENCES auth.users(id),
    CONSTRAINT transfer_orders_different_locations CHECK (origin_location_id IS DISTINCT FROM destination_location_id)
);

CREATE INDEX idx_transfer_orders_org ON public.transfer_orders(organization_id);
CREATE INDEX idx_transfer_orders_status ON public.transfer_orders(status);
CREATE INDEX idx_transfer_orders_origin ON public.transfer_orders(origin_location_id);
CREATE INDEX idx_transfer_orders_dest ON public.transfer_orders(destination_location_id);

ALTER TABLE public.transfer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY transfer_orders_select ON public.transfer_orders
    FOR SELECT USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY transfer_orders_insert ON public.transfer_orders
    FOR INSERT WITH CHECK (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY transfer_orders_update ON public.transfer_orders
    FOR UPDATE USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY transfer_orders_delete ON public.transfer_orders
    FOR DELETE USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);

CREATE TRIGGER set_updated_at_transfer_orders
    BEFORE UPDATE ON public.transfer_orders
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ─── TAGS TABLE (cross-entity tagging) ──────────────────────
CREATE TABLE public.tags (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name            text NOT NULL,
    slug            text NOT NULL,
    color           text,
    description     text,
    category        text,
    usage_count     integer NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid REFERENCES auth.users(id),
    CONSTRAINT tags_unique_per_org UNIQUE (organization_id, slug)
);

CREATE INDEX idx_tags_org ON public.tags(organization_id);
CREATE INDEX idx_tags_slug ON public.tags(organization_id, slug);
CREATE INDEX idx_tags_category ON public.tags(organization_id, category);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY tags_select ON public.tags
    FOR SELECT USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY tags_insert ON public.tags
    FOR INSERT WITH CHECK (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY tags_update ON public.tags
    FOR UPDATE USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY tags_delete ON public.tags
    FOR DELETE USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);

CREATE TRIGGER set_updated_at_tags
    BEFORE UPDATE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ─── ENTITY TAG ASSIGNMENTS (polymorphic join) ──────────────
CREATE TABLE public.entity_tag_assignments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    tag_id          uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    entity_type     text NOT NULL,
    entity_id       uuid NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    created_by      uuid REFERENCES auth.users(id),
    CONSTRAINT entity_tag_unique UNIQUE (tag_id, entity_type, entity_id)
);

CREATE INDEX idx_entity_tag_assignments_org ON public.entity_tag_assignments(organization_id);
CREATE INDEX idx_entity_tag_assignments_tag ON public.entity_tag_assignments(tag_id);
CREATE INDEX idx_entity_tag_assignments_entity ON public.entity_tag_assignments(entity_type, entity_id);

ALTER TABLE public.entity_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY entity_tag_assignments_select ON public.entity_tag_assignments
    FOR SELECT USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY entity_tag_assignments_insert ON public.entity_tag_assignments
    FOR INSERT WITH CHECK (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
CREATE POLICY entity_tag_assignments_delete ON public.entity_tag_assignments
    FOR DELETE USING (organization_id = (SELECT current_setting('app.current_org_id', true))::uuid);
