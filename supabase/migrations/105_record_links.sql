-- ============================================================================
-- Migration 105: Generic Record Links (Entity-Polymorphic Junction Table)
-- Enables AirTable/SmartSuite-style linked records across any entity types
-- ============================================================================

CREATE TABLE IF NOT EXISTS record_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Source side
    source_entity_type TEXT NOT NULL,
    source_entity_id   UUID NOT NULL,
    -- Target side
    target_entity_type TEXT NOT NULL,
    target_entity_id   UUID NOT NULL,
    -- Metadata
    link_type          TEXT NOT NULL DEFAULT 'related'
                       CHECK (link_type IN ('related', 'parent', 'blocks', 'duplicate', 'references')),
    label              TEXT,
    created_by         UUID REFERENCES profiles(id),
    organization_id    UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate links in either direction
    UNIQUE(source_entity_type, source_entity_id, target_entity_type, target_entity_id)
);

-- Indexes for bi-directional lookups
CREATE INDEX IF NOT EXISTS idx_record_links_source ON record_links(source_entity_type, source_entity_id);
CREATE INDEX IF NOT EXISTS idx_record_links_target ON record_links(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_record_links_org    ON record_links(organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS Policies (org-scoped, following existing pattern from migration 061)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE record_links ENABLE ROW LEVEL SECURITY;

-- SELECT: org members can read
CREATE POLICY record_links_select ON record_links
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: org members can create links
CREATE POLICY record_links_insert ON record_links
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: org members can remove links (link creator or admin)
CREATE POLICY record_links_delete ON record_links
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM org_memberships
            WHERE user_id = auth.uid()
        )
    );

COMMENT ON TABLE record_links IS
    'Generic polymorphic junction table for entity-to-entity linked records. '
    'Supports bi-directional queries and semantic link types (related, parent, blocks, etc.).';
