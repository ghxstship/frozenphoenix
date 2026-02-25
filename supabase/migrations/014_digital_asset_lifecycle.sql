-- ============================================================================
-- Migration 014: Digital Asset Lifecycle Management
-- ============================================================================
-- Creates the unified digital asset metadata layer, version control system,
-- polymorphic entity-asset linking, tag system, storage abstraction,
-- access control, audit logging, retention policies, legal holds,
-- and asset dependency graph.
--
-- References: docs/DIGITAL_ASSET_LIFECYCLE_ARCHITECTURE.md
-- ============================================================================

-- ============================================================================
-- 1. STORAGE ABSTRACTION
-- ============================================================================

CREATE TABLE storage_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'supabase_storage'
        CHECK (provider IN ('supabase_storage', 's3', 'gcs', 'azure_blob', 'external_url')),
    bucket_id TEXT NOT NULL,
    object_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 TEXT,
    storage_url TEXT NOT NULL,
    cdn_url TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,
    processing_status TEXT NOT NULL DEFAULT 'ready'
        CHECK (processing_status IN ('uploading', 'processing', 'ready', 'error')),
    processing_error TEXT,
    is_deduplicated BOOLEAN NOT NULL DEFAULT false,
    canonical_object_id UUID REFERENCES storage_objects(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_storage_objects_org ON storage_objects(organization_id);
CREATE INDEX idx_storage_objects_checksum ON storage_objects(checksum_sha256) WHERE checksum_sha256 IS NOT NULL;
CREATE INDEX idx_storage_objects_bucket ON storage_objects(bucket_id, object_path);

ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storage_objects_org_isolation" ON storage_objects
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- ============================================================================
-- 2. CORE METADATA TABLE
-- ============================================================================

CREATE TABLE digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Classification (dot-notation hierarchy, e.g. 'document.contract', 'media.photo')
    asset_class TEXT NOT NULL,
    asset_class_l1 TEXT GENERATED ALWAYS AS (split_part(asset_class, '.', 1)) STORED,
    asset_class_l2 TEXT GENERATED ALWAYS AS (split_part(asset_class, '.', 2)) STORED,

    -- Identity
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    description TEXT,

    -- Scope
    scope_level TEXT NOT NULL DEFAULT 'project'
        CHECK (scope_level IN (
            'global', 'company', 'project', 'location', 'activation',
            'event', 'task', 'vendor', 'worker', 'department', 'personal'
        )),
    scope_entity_id UUID,

    -- Functional domains (denormalized for query performance)
    domains TEXT[] NOT NULL DEFAULT '{}',

    -- Lifecycle status
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft', 'pending_review', 'in_review', 'approved', 'published',
            'active', 'superseded', 'archived', 'expired', 'deleted'
        )),
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Current version pointer (set after first version is created)
    current_version_id UUID,

    -- Ownership
    owner_id UUID NOT NULL REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),

    -- Auto-numbering (contracts, invoices, SOPs)
    document_number TEXT,

    -- Review cycle
    last_reviewed_at TIMESTAMPTZ,
    next_review_date DATE,
    reviewer_ids UUID[] NOT NULL DEFAULT '{}',

    -- Acknowledgment (SOPs, policies)
    requires_acknowledgment BOOLEAN NOT NULL DEFAULT false,

    -- Sensitivity & privacy
    sensitivity TEXT NOT NULL DEFAULT 'internal'
        CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
    data_purpose TEXT,
    retention_policy_id UUID, -- FK added after retention table created

    -- Full-text search vector (populated by trigger)
    search_text TSVECTOR,

    -- Extensible metadata
    custom_metadata JSONB NOT NULL DEFAULT '{}',

    -- Tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_digital_assets_org ON digital_assets(organization_id);
CREATE INDEX idx_digital_assets_class ON digital_assets(asset_class);
CREATE INDEX idx_digital_assets_class_l1 ON digital_assets(asset_class_l1);
CREATE INDEX idx_digital_assets_scope ON digital_assets(scope_level, scope_entity_id);
CREATE INDEX idx_digital_assets_status ON digital_assets(status);
CREATE INDEX idx_digital_assets_owner ON digital_assets(owner_id);
CREATE INDEX idx_digital_assets_expires ON digital_assets(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_digital_assets_search ON digital_assets USING GIN(search_text);
CREATE INDEX idx_digital_assets_domains ON digital_assets USING GIN(domains);
CREATE INDEX idx_digital_assets_doc_number ON digital_assets(organization_id, document_number) WHERE document_number IS NOT NULL;

ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "digital_assets_org_isolation" ON digital_assets
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- ============================================================================
-- 3. IMMUTABLE VERSION HISTORY
-- ============================================================================

CREATE TABLE asset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,

    -- Version identity
    version_number INTEGER NOT NULL,
    version_label TEXT,                      -- e.g. 'Rev C', 'Amendment 3'
    is_major BOOLEAN NOT NULL DEFAULT true,

    -- File storage reference
    storage_object_id UUID REFERENCES storage_objects(id),

    -- Rich content (for document-type assets: wiki, docs, meeting notes)
    content JSONB,
    content_text TEXT,                       -- Plain text extraction for search

    -- File metadata (denormalized from storage_objects for query performance)
    mime_type TEXT,
    size_bytes BIGINT,
    checksum TEXT,

    -- Change tracking
    change_description TEXT,
    change_type TEXT NOT NULL DEFAULT 'create'
        CHECK (change_type IN (
            'create', 'update', 'amendment', 'revision',
            'correction', 'reformat', 'merge'
        )),

    -- Structured diff from previous version (optional)
    diff_from_previous JSONB,

    -- Actor
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Immutability: no updated_at column, no UPDATE policy
    UNIQUE(asset_id, version_number)
);

CREATE INDEX idx_asset_versions_asset ON asset_versions(asset_id);
CREATE INDEX idx_asset_versions_created ON asset_versions(created_at);
CREATE INDEX idx_asset_versions_storage ON asset_versions(storage_object_id) WHERE storage_object_id IS NOT NULL;

ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_versions_org_isolation" ON asset_versions
    USING (asset_id IN (
        SELECT id FROM digital_assets WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- Add FK from digital_assets.current_version_id to asset_versions
ALTER TABLE digital_assets
    ADD CONSTRAINT fk_digital_assets_current_version
    FOREIGN KEY (current_version_id) REFERENCES asset_versions(id);

-- ============================================================================
-- 4. POLYMORPHIC ENTITY-ASSET JUNCTION
-- ============================================================================

CREATE TABLE asset_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,

    -- Linked entity (polymorphic: any table with UUID PK)
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,

    -- Link semantics
    link_type TEXT NOT NULL DEFAULT 'attachment'
        CHECK (link_type IN (
            'primary',           -- Canonical document for this entity (1:1 per role)
            'attachment',        -- Attached file (1:M)
            'reference',         -- Referenced but not owned (M:M)
            'deliverable',       -- Deliverable output
            'evidence',          -- Supporting evidence (incidents, reviews)
            'template_source',   -- Template this was instantiated from
            'supersedes'         -- This asset replaces another
        )),
    link_role TEXT,              -- e.g. 'floor_plan', 'coi', 'headshot', 'receipt'

    -- Display
    display_order INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,

    -- Validity window
    effective_from TIMESTAMPTZ,
    effective_until TIMESTAMPTZ,

    -- Context
    notes TEXT,

    -- Tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Uniqueness enforced via index below (COALESCE not allowed in table constraints)
    CONSTRAINT asset_links_no_duplicate CHECK (true)
);

CREATE UNIQUE INDEX idx_asset_links_unique
    ON asset_links(asset_id, entity_type, entity_id, link_type, COALESCE(link_role, ''));

CREATE INDEX idx_asset_links_asset ON asset_links(asset_id);
CREATE INDEX idx_asset_links_entity ON asset_links(entity_type, entity_id);
CREATE INDEX idx_asset_links_org ON asset_links(organization_id);

ALTER TABLE asset_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_links_org_isolation" ON asset_links
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- ============================================================================
-- 5. NORMALIZED TAG SYSTEM
-- ============================================================================

CREATE TABLE asset_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    tag_group TEXT,              -- e.g. 'department', 'phase', 'client', 'custom'
    color TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_asset_tags_org ON asset_tags(organization_id);
CREATE INDEX idx_asset_tags_group ON asset_tags(tag_group);

ALTER TABLE asset_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_tags_org_isolation" ON asset_tags
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE TABLE asset_tag_assignments (
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES asset_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, tag_id)
);

ALTER TABLE asset_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_tag_assignments_org_isolation" ON asset_tag_assignments
    USING (asset_id IN (
        SELECT id FROM digital_assets WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- ============================================================================
-- 6. ACCESS CONTROL (ASSET-LEVEL OVERRIDES)
-- ============================================================================

CREATE TABLE asset_access_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,

    -- Grantee (exactly one must be non-null)
    user_id UUID REFERENCES profiles(id),
    role TEXT,
    team_id UUID,

    -- Permission bits
    can_view BOOLEAN NOT NULL DEFAULT true,
    can_download BOOLEAN NOT NULL DEFAULT true,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    can_share BOOLEAN NOT NULL DEFAULT false,
    can_approve BOOLEAN NOT NULL DEFAULT false,

    -- Validity
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    granted_by UUID REFERENCES profiles(id),

    -- Tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    UNIQUE(asset_id, user_id),
    CHECK (user_id IS NOT NULL OR role IS NOT NULL OR team_id IS NOT NULL)
);

CREATE INDEX idx_asset_access_controls_asset ON asset_access_controls(asset_id);
CREATE INDEX idx_asset_access_controls_user ON asset_access_controls(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE asset_access_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_access_controls_org_isolation" ON asset_access_controls
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- ============================================================================
-- 7. AUDIT TRAIL
-- ============================================================================

CREATE TABLE asset_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    version_id UUID REFERENCES asset_versions(id),

    -- Actor
    user_id UUID REFERENCES profiles(id),
    actor_type TEXT NOT NULL DEFAULT 'user'
        CHECK (actor_type IN ('user', 'system', 'api', 'portal')),

    -- Action
    action TEXT NOT NULL
        CHECK (action IN (
            'viewed', 'downloaded', 'previewed', 'printed', 'shared',
            'linked', 'unlinked', 'versioned', 'status_changed',
            'permissions_changed', 'deleted', 'restored', 'exported'
        )),

    -- Context
    ip_address INET,
    user_agent TEXT,
    context JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_access_log_asset ON asset_access_log(asset_id);
CREATE INDEX idx_asset_access_log_user ON asset_access_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_asset_access_log_action ON asset_access_log(action);
CREATE INDEX idx_asset_access_log_created ON asset_access_log(created_at);

ALTER TABLE asset_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_access_log_org_isolation" ON asset_access_log
    USING (asset_id IN (
        SELECT id FROM digital_assets WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

-- ============================================================================
-- 8. RETENTION POLICIES
-- ============================================================================

CREATE TABLE asset_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Applicability filters (NULL = applies to all)
    applies_to_class TEXT,
    applies_to_scope TEXT,
    applies_to_sensitivity TEXT,

    -- Retention rules
    retention_period_days INTEGER,           -- NULL = indefinite
    retention_trigger TEXT NOT NULL DEFAULT 'creation'
        CHECK (retention_trigger IN (
            'creation', 'expiration', 'project_closure',
            'contract_termination', 'last_access', 'manual'
        )),

    -- Actions
    on_retention_reached TEXT NOT NULL DEFAULT 'archive'
        CHECK (on_retention_reached IN ('archive', 'delete', 'review', 'notify_owner')),
    on_expiration TEXT NOT NULL DEFAULT 'notify_owner'
        CHECK (on_expiration IN ('archive', 'delete', 'notify_owner', 'lock', 'none')),

    -- Warning schedule
    warning_days_before INTEGER[] NOT NULL DEFAULT '{30, 7, 1}',

    -- Legal hold exemption
    legal_hold_exempt BOOLEAN NOT NULL DEFAULT false,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_retention_policies_org ON asset_retention_policies(organization_id);
CREATE INDEX idx_asset_retention_policies_class ON asset_retention_policies(applies_to_class) WHERE applies_to_class IS NOT NULL;

ALTER TABLE asset_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_retention_policies_org_isolation" ON asset_retention_policies
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Now add the FK from digital_assets.retention_policy_id
ALTER TABLE digital_assets
    ADD CONSTRAINT fk_digital_assets_retention_policy
    FOREIGN KEY (retention_policy_id) REFERENCES asset_retention_policies(id);

-- ============================================================================
-- 9. LEGAL HOLDS
-- ============================================================================

CREATE TABLE legal_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    hold_type TEXT NOT NULL
        CHECK (hold_type IN ('litigation', 'regulatory', 'investigation', 'audit')),

    -- Scope (what is held)
    scope_type TEXT NOT NULL
        CHECK (scope_type IN ('asset', 'project', 'company', 'vendor', 'global')),
    scope_entity_id UUID,

    -- Lifecycle
    is_active BOOLEAN NOT NULL DEFAULT true,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    placed_by UUID REFERENCES profiles(id),
    released_by UUID REFERENCES profiles(id),

    -- Legal reference
    matter_number TEXT,
    counsel_name TEXT,

    -- Tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_legal_holds_org ON legal_holds(organization_id);
CREATE INDEX idx_legal_holds_active ON legal_holds(is_active) WHERE is_active = true;
CREATE INDEX idx_legal_holds_scope ON legal_holds(scope_type, scope_entity_id);

ALTER TABLE legal_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legal_holds_org_isolation" ON legal_holds
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- ============================================================================
-- 10. ASSET DEPENDENCY GRAPH
-- ============================================================================

CREATE TABLE asset_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    depends_on_asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,

    -- Dependency semantics
    dependency_type TEXT NOT NULL
        CHECK (dependency_type IN (
            'requires_approval', 'requires_signature', 'derived_from',
            'supersedes', 'references', 'bundles', 'requires_upload'
        )),

    -- Blocking behavior
    is_blocking BOOLEAN NOT NULL DEFAULT false,
    is_satisfied BOOLEAN NOT NULL DEFAULT false,
    satisfied_at TIMESTAMPTZ,

    -- Context
    notes TEXT,

    -- Tenant
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(asset_id, depends_on_asset_id, dependency_type),
    CHECK (asset_id != depends_on_asset_id)
);

CREATE INDEX idx_asset_dependencies_asset ON asset_dependencies(asset_id);
CREATE INDEX idx_asset_dependencies_depends_on ON asset_dependencies(depends_on_asset_id);
CREATE INDEX idx_asset_dependencies_blocking ON asset_dependencies(asset_id) WHERE is_blocking = true AND is_satisfied = false;

ALTER TABLE asset_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_dependencies_org_isolation" ON asset_dependencies
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- ============================================================================
-- 11. TRIGGERS
-- ============================================================================

-- updated_at triggers
CREATE TRIGGER set_digital_assets_updated_at
    BEFORE UPDATE ON digital_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_asset_retention_policies_updated_at
    BEFORE UPDATE ON asset_retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-text search index trigger
CREATE OR REPLACE FUNCTION update_digital_asset_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := to_tsvector('english',
        COALESCE(NEW.name, '') || ' ' ||
        COALESCE(NEW.filename, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.document_number, '') || ' ' ||
        COALESCE(NEW.asset_class, '') || ' ' ||
        COALESCE(array_to_string(NEW.domains, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_digital_assets_search_text
    BEFORE INSERT OR UPDATE OF name, filename, description, document_number, asset_class, domains
    ON digital_assets
    FOR EACH ROW EXECUTE FUNCTION update_digital_asset_search_text();

-- Auto-satisfy dependencies when dependent asset reaches required status
CREATE OR REPLACE FUNCTION check_asset_dependency_satisfaction()
RETURNS TRIGGER AS $$
BEGIN
    -- When an asset is approved/published/active, satisfy dependencies that require it
    IF NEW.status IN ('approved', 'published', 'active') AND
       (OLD.status IS NULL OR OLD.status != NEW.status) THEN

        UPDATE asset_dependencies
        SET is_satisfied = true,
            satisfied_at = NOW()
        WHERE depends_on_asset_id = NEW.id
          AND is_satisfied = false
          AND dependency_type IN ('requires_approval', 'requires_signature');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_dependency_satisfaction
    AFTER UPDATE OF status ON digital_assets
    FOR EACH ROW EXECUTE FUNCTION check_asset_dependency_satisfaction();

-- Block status transitions when blocking dependencies are unsatisfied
CREATE OR REPLACE FUNCTION enforce_blocking_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    unsatisfied_count INTEGER;
BEGIN
    -- Only check on status advancement (not when moving to archived/deleted)
    IF NEW.status IN ('in_review', 'approved', 'published', 'active') AND
       NEW.status != OLD.status THEN

        SELECT COUNT(*) INTO unsatisfied_count
        FROM asset_dependencies
        WHERE asset_id = NEW.id
          AND is_blocking = true
          AND is_satisfied = false;

        IF unsatisfied_count > 0 THEN
            RAISE EXCEPTION 'Cannot transition to % — % blocking dependencies are unsatisfied',
                NEW.status, unsatisfied_count;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_blocking_dependencies
    BEFORE UPDATE OF status ON digital_assets
    FOR EACH ROW EXECUTE FUNCTION enforce_blocking_dependencies();

-- Prevent deletion/archival of assets under active legal hold
CREATE OR REPLACE FUNCTION enforce_legal_hold()
RETURNS TRIGGER AS $$
DECLARE
    hold_count INTEGER;
BEGIN
    IF NEW.status IN ('deleted', 'archived') AND OLD.status NOT IN ('deleted', 'archived') THEN
        -- Check asset-level holds
        SELECT COUNT(*) INTO hold_count
        FROM legal_holds
        WHERE is_active = true
          AND (
              (scope_type = 'asset' AND scope_entity_id = NEW.id) OR
              (scope_type = 'global' AND organization_id = NEW.organization_id)
          );

        -- Check scope-entity-level holds (project, company, vendor)
        IF hold_count = 0 AND NEW.scope_entity_id IS NOT NULL THEN
            SELECT COUNT(*) INTO hold_count
            FROM legal_holds
            WHERE is_active = true
              AND scope_type = NEW.scope_level
              AND scope_entity_id = NEW.scope_entity_id;
        END IF;

        IF hold_count > 0 THEN
            RAISE EXCEPTION 'Cannot % asset — % active legal hold(s) apply',
                NEW.status, hold_count;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_legal_hold
    BEFORE UPDATE OF status ON digital_assets
    FOR EACH ROW EXECUTE FUNCTION enforce_legal_hold();

-- Immutability: prevent UPDATE on asset_versions
CREATE OR REPLACE FUNCTION prevent_version_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'asset_versions rows are immutable — INSERT new versions instead of updating';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_version_update
    BEFORE UPDATE ON asset_versions
    FOR EACH ROW EXECUTE FUNCTION prevent_version_update();

-- Activity log trigger for digital_assets
CREATE OR REPLACE FUNCTION log_digital_asset_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (
        entity_type, entity_id, action,
        performed_by, organization_id, details
    ) VALUES (
        'digital_asset', NEW.id,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN OLD.status != NEW.status THEN 'status_changed'
            ELSE 'updated'
        END,
        COALESCE(NEW.updated_by, NEW.created_by, auth.uid()),
        NEW.organization_id,
        jsonb_build_object(
            'name', NEW.name,
            'asset_class', NEW.asset_class,
            'status', NEW.status,
            'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_digital_asset_activity
    AFTER INSERT OR UPDATE ON digital_assets
    FOR EACH ROW EXECUTE FUNCTION log_digital_asset_activity();

-- ============================================================================
-- 12. SEED DEFAULT RETENTION POLICIES (per-org, created on demand)
-- ============================================================================
-- These are inserted as application-level defaults. Organizations can customize.
-- The application layer seeds these on org creation. No data inserted here.

-- ============================================================================
-- 13. COMMENTS (documentation)
-- ============================================================================

COMMENT ON TABLE storage_objects IS 'Abstraction over file storage providers. Actual bytes live in Supabase Storage or S3-compatible backends.';
COMMENT ON TABLE digital_assets IS 'Universal metadata record for all digital assets — the SSOT for file/document references.';
COMMENT ON TABLE asset_versions IS 'Immutable version history. INSERT-ONLY — no updates or deletes allowed.';
COMMENT ON TABLE asset_links IS 'Polymorphic junction connecting assets to any entity (project, contract, vendor, etc.).';
COMMENT ON TABLE asset_tags IS 'Org-scoped tag definitions for asset classification.';
COMMENT ON TABLE asset_tag_assignments IS 'M:M junction between digital_assets and asset_tags.';
COMMENT ON TABLE asset_access_controls IS 'Per-asset permission overrides. Most assets inherit access from scope entity.';
COMMENT ON TABLE asset_access_log IS 'High-volume audit trail for asset access events.';
COMMENT ON TABLE asset_retention_policies IS 'Configurable retention/archival/expiration rules by asset class and scope.';
COMMENT ON TABLE legal_holds IS 'Litigation/regulatory holds that prevent deletion or archival of assets.';
COMMENT ON TABLE asset_dependencies IS 'Directed dependency graph between assets with optional blocking enforcement.';

COMMENT ON COLUMN digital_assets.asset_class IS 'Dot-notation hierarchy, e.g. document.contract, media.photo, legal.permit';
COMMENT ON COLUMN digital_assets.scope_level IS 'Determines visibility boundary and access inheritance source';
COMMENT ON COLUMN digital_assets.sensitivity IS 'Data classification: public, internal, confidential, restricted';
COMMENT ON COLUMN digital_assets.search_text IS 'Auto-populated by trigger from name, filename, description, document_number, class, domains';
COMMENT ON COLUMN asset_versions.diff_from_previous IS 'Optional JSON patch (RFC 6902) or text diff from the previous version';
COMMENT ON COLUMN asset_links.link_role IS 'Semantic role qualifier, e.g. floor_plan, coi, receipt, headshot';
COMMENT ON COLUMN asset_links.entity_type IS 'Target table name: project, contract, event, vendor, crew_member, task, incident, etc.';
