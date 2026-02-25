-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 015 — Creative, Brand & Campaign Lifecycle
-- ═══════════════════════════════════════════════════════════════
-- Implements: creative_briefs, brief_templates, brand_guidelines,
--   brand_guideline_sections, brand_guideline_versions, campaigns,
--   campaign_channels, campaign_assets, campaign_kpis, campaign_metrics,
--   creative_reviews, asset_channel_deployments
-- Extends: brand_kits (backward-compatible FK), tasks, budget_line_items
-- ═══════════════════════════════════════════════════════════════

-- ─── ENUMS ───────────────────────────────────────────────────

CREATE TYPE creative_brief_status AS ENUM (
    'draft',
    'stakeholder_review',
    'strategy_approved',
    'budget_approved',
    'final_approved',
    'active',
    'completed',
    'archived'
);

CREATE TYPE creative_brief_type AS ENUM (
    'brand',
    'campaign',
    'product',
    'event',
    'social',
    'content',
    'experiential'
);

CREATE TYPE brand_guideline_status AS ENUM (
    'draft',
    'published',
    'archived'
);

CREATE TYPE guideline_section_type AS ENUM (
    'visual_identity',
    'color_system',
    'typography',
    'tone_and_voice',
    'motion',
    'accessibility',
    'co_branding',
    'photography',
    'iconography',
    'layout'
);

CREATE TYPE campaign_status AS ENUM (
    'planning',
    'brief_approved',
    'in_production',
    'review',
    'approved',
    'launching',
    'live',
    'optimizing',
    'completed',
    'archived'
);

CREATE TYPE campaign_channel_type AS ENUM (
    'social_meta',
    'social_tiktok',
    'social_linkedin',
    'social_x',
    'social_youtube',
    'display',
    'email',
    'website',
    'print',
    'ooh',
    'experiential',
    'video',
    'podcast',
    'influencer',
    'pr'
);

CREATE TYPE campaign_channel_status AS ENUM (
    'planned',
    'active',
    'paused',
    'completed'
);

CREATE TYPE campaign_asset_role AS ENUM (
    'hero',
    'supporting',
    'variant',
    'localized',
    'thumbnail',
    'social_crop',
    'print_adaptation',
    'motion',
    'template'
);

CREATE TYPE campaign_asset_production_status AS ENUM (
    'briefed',
    'in_production',
    'in_review',
    'revision_requested',
    'approved',
    'deployed',
    'retired'
);

CREATE TYPE creative_review_gate AS ENUM (
    'creative_director',
    'brand_compliance',
    'legal',
    'stakeholder',
    'client'
);

CREATE TYPE creative_review_status AS ENUM (
    'requested',
    'in_review',
    'approved',
    'revision_requested',
    'rejected'
);

CREATE TYPE kpi_metric_type AS ENUM (
    'percentage',
    'count',
    'currency',
    'ratio',
    'duration'
);

CREATE TYPE attribution_model AS ENUM (
    'first_touch',
    'last_touch',
    'linear',
    'time_decay',
    'position_based'
);

-- ═══════════════════════════════════════════════════════════════
-- BRIEF TEMPLATES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE brief_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    brief_type creative_brief_type NOT NULL,
    template_sections JSONB NOT NULL DEFAULT '{}',
    default_kpis JSONB DEFAULT '[]',
    default_deliverable_manifest JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- BRAND GUIDELINES (multi-brand hierarchy)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES brand_guidelines(id) ON DELETE SET NULL,
    brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    brand_level TEXT NOT NULL DEFAULT 'primary'
        CHECK (brand_level IN ('primary', 'sub_brand', 'market_variant', 'co_brand')),
    markets TEXT[] DEFAULT '{}',
    status brand_guideline_status NOT NULL DEFAULT 'draft',
    current_version INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- BRAND GUIDELINE SECTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE brand_guideline_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_guideline_id UUID NOT NULL REFERENCES brand_guidelines(id) ON DELETE CASCADE,
    section_type guideline_section_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_inherited BOOLEAN NOT NULL DEFAULT false,
    overrides_parent_section_id UUID REFERENCES brand_guideline_sections(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (brand_guideline_id, section_type)
);

-- ═══════════════════════════════════════════════════════════════
-- BRAND GUIDELINE VERSIONS (immutable snapshots)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE brand_guideline_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_guideline_id UUID NOT NULL REFERENCES brand_guidelines(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    change_summary TEXT,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (brand_guideline_id, version_number)
);

-- ═══════════════════════════════════════════════════════════════
-- CREATIVE BRIEFS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE creative_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES brief_templates(id) ON DELETE SET NULL,
    brand_guideline_id UUID REFERENCES brand_guidelines(id) ON DELETE SET NULL,
    brand_guideline_version_id UUID REFERENCES brand_guideline_versions(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Overview
    title TEXT NOT NULL,
    brief_type creative_brief_type NOT NULL DEFAULT 'campaign',
    objective_summary TEXT,
    status creative_brief_status NOT NULL DEFAULT 'draft',

    -- Strategic Context
    business_objectives JSONB DEFAULT '[]',
    success_criteria JSONB DEFAULT '[]',
    competitive_context TEXT,

    -- Audience
    target_segments JSONB DEFAULT '[]',
    personas JSONB DEFAULT '[]',

    -- Scope
    deliverable_manifest JSONB DEFAULT '[]',
    channels TEXT[] DEFAULT '{}',
    markets TEXT[] DEFAULT '{}',

    -- Brand Direction
    tone_direction TEXT,
    visual_direction TEXT,

    -- Budget
    total_budget NUMERIC(15, 2) DEFAULT 0,
    budget_breakdown JSONB DEFAULT '[]',
    contingency_pct NUMERIC(5, 2) DEFAULT 10,

    -- Timeline
    start_date DATE,
    end_date DATE,
    milestone_dates JSONB DEFAULT '[]',

    -- KPIs
    kpi_definitions JSONB DEFAULT '[]',

    -- Stakeholders
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approver_ids UUID[] DEFAULT '{}',
    reviewer_ids UUID[] DEFAULT '{}',
    contributor_ids UUID[] DEFAULT '{}',

    -- References
    inspiration_assets JSONB DEFAULT '[]',
    competitor_references JSONB DEFAULT '[]',
    previous_campaign_ids UUID[] DEFAULT '{}',

    -- Metadata
    version INTEGER NOT NULL DEFAULT 1,
    amendment_of_id UUID REFERENCES creative_briefs(id) ON DELETE SET NULL,
    retrospective_notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CAMPAIGNS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brief_id UUID REFERENCES creative_briefs(id) ON DELETE SET NULL,
    brand_guideline_version_id UUID REFERENCES brand_guideline_versions(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    name TEXT NOT NULL,
    description TEXT,
    status campaign_status NOT NULL DEFAULT 'planning',

    -- Strategy
    objective TEXT,
    target_audience TEXT,
    key_messages JSONB DEFAULT '[]',

    -- Budget
    total_budget NUMERIC(15, 2) DEFAULT 0,
    spent_budget NUMERIC(15, 2) DEFAULT 0,

    -- Timeline
    start_date DATE,
    end_date DATE,
    launch_date DATE,

    -- Ownership
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    team_member_ids UUID[] DEFAULT '{}',

    -- Results (post-campaign)
    total_reach BIGINT,
    total_impressions BIGINT,
    total_engagements BIGINT,
    total_conversions INTEGER,
    roi NUMERIC(10, 2),
    post_analysis_notes TEXT,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CAMPAIGN CHANNELS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE campaign_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    channel_type campaign_channel_type NOT NULL,
    label TEXT,
    budget_allocation NUMERIC(15, 2) DEFAULT 0,
    budget_pct NUMERIC(5, 2) DEFAULT 0,
    launch_date DATE,
    end_date DATE,
    status campaign_channel_status NOT NULL DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (campaign_id, channel_type)
);

-- ═══════════════════════════════════════════════════════════════
-- CAMPAIGN ASSETS (M:N junction: campaign ↔ digital_assets)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE campaign_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    digital_asset_id UUID REFERENCES digital_assets(id) ON DELETE SET NULL,
    brief_id UUID REFERENCES creative_briefs(id) ON DELETE SET NULL,

    name TEXT NOT NULL,
    asset_role campaign_asset_role NOT NULL DEFAULT 'supporting',
    production_status campaign_asset_production_status NOT NULL DEFAULT 'briefed',
    target_channels campaign_channel_type[] DEFAULT '{}',

    -- Brand Compliance
    brand_compliance_score NUMERIC(5, 2),
    compliance_notes TEXT,

    -- Localization
    locale TEXT DEFAULT 'en-US',
    localized_from_id UUID REFERENCES campaign_assets(id) ON DELETE SET NULL,
    localization_notes TEXT,

    -- Specs
    specs JSONB DEFAULT '{}',
    due_date DATE,
    approved_at TIMESTAMPTZ,
    deployed_at TIMESTAMPTZ,

    -- Ownership
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CAMPAIGN KPIs
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE campaign_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_type kpi_metric_type NOT NULL DEFAULT 'count',
    target_value NUMERIC(15, 4),
    current_value NUMERIC(15, 4),
    measurement_method TEXT,
    attribution attribution_model DEFAULT 'last_touch',
    data_source TEXT,
    reporting_frequency TEXT DEFAULT 'weekly'
        CHECK (reporting_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CAMPAIGN METRICS (time-series, append-only)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE campaign_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_kpi_id UUID REFERENCES campaign_kpis(id) ON DELETE SET NULL,
    campaign_channel_id UUID REFERENCES campaign_channels(id) ON DELETE SET NULL,
    campaign_asset_id UUID REFERENCES campaign_assets(id) ON DELETE SET NULL,

    metric_name TEXT NOT NULL,
    metric_value NUMERIC(15, 4) NOT NULL,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════
-- CREATIVE REVIEWS (multi-gate approval workflow)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE creative_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_asset_id UUID NOT NULL REFERENCES campaign_assets(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    gate_type creative_review_gate NOT NULL,
    status creative_review_status NOT NULL DEFAULT 'requested',
    score NUMERIC(5, 2),
    feedback TEXT,
    annotations JSONB DEFAULT '[]',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ASSET CHANNEL DEPLOYMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE asset_channel_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_asset_id UUID NOT NULL REFERENCES campaign_assets(id) ON DELETE CASCADE,
    campaign_channel_id UUID NOT NULL REFERENCES campaign_channels(id) ON DELETE CASCADE,
    deployed_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    deployment_url TEXT,
    performance_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (campaign_asset_id, campaign_channel_id)
);

-- ═══════════════════════════════════════════════════════════════
-- EXTEND EXISTING TABLES (backward-compatible)
-- ═══════════════════════════════════════════════════════════════

-- Add campaign_id to tasks for campaign production tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Add campaign_id to budget_line_items for campaign budget attribution
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

-- Brief Templates
CREATE INDEX idx_brief_templates_org ON brief_templates(organization_id);
CREATE INDEX idx_brief_templates_type ON brief_templates(brief_type);

-- Brand Guidelines
CREATE INDEX idx_brand_guidelines_org ON brand_guidelines(organization_id);
CREATE INDEX idx_brand_guidelines_parent ON brand_guidelines(parent_id);
CREATE INDEX idx_brand_guidelines_brand_kit ON brand_guidelines(brand_kit_id);
CREATE INDEX idx_brand_guidelines_status ON brand_guidelines(status);

-- Brand Guideline Sections
CREATE INDEX idx_brand_guideline_sections_guideline ON brand_guideline_sections(brand_guideline_id);
CREATE INDEX idx_brand_guideline_sections_type ON brand_guideline_sections(section_type);

-- Brand Guideline Versions
CREATE INDEX idx_brand_guideline_versions_guideline ON brand_guideline_versions(brand_guideline_id);

-- Creative Briefs
CREATE INDEX idx_creative_briefs_org ON creative_briefs(organization_id);
CREATE INDEX idx_creative_briefs_status ON creative_briefs(status);
CREATE INDEX idx_creative_briefs_type ON creative_briefs(brief_type);
CREATE INDEX idx_creative_briefs_project ON creative_briefs(project_id);
CREATE INDEX idx_creative_briefs_deal ON creative_briefs(deal_id);
CREATE INDEX idx_creative_briefs_company ON creative_briefs(company_id);
CREATE INDEX idx_creative_briefs_owner ON creative_briefs(owner_id);
CREATE INDEX idx_creative_briefs_guideline ON creative_briefs(brand_guideline_id);
CREATE INDEX idx_creative_briefs_template ON creative_briefs(template_id);

-- Campaigns
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_brief ON campaigns(brief_id);
CREATE INDEX idx_campaigns_company ON campaigns(company_id);
CREATE INDEX idx_campaigns_project ON campaigns(project_id);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_tags ON campaigns USING GIN(tags);

-- Campaign Channels
CREATE INDEX idx_campaign_channels_campaign ON campaign_channels(campaign_id);
CREATE INDEX idx_campaign_channels_type ON campaign_channels(channel_type);
CREATE INDEX idx_campaign_channels_status ON campaign_channels(status);

-- Campaign Assets
CREATE INDEX idx_campaign_assets_campaign ON campaign_assets(campaign_id);
CREATE INDEX idx_campaign_assets_digital ON campaign_assets(digital_asset_id);
CREATE INDEX idx_campaign_assets_brief ON campaign_assets(brief_id);
CREATE INDEX idx_campaign_assets_status ON campaign_assets(production_status);
CREATE INDEX idx_campaign_assets_role ON campaign_assets(asset_role);
CREATE INDEX idx_campaign_assets_locale ON campaign_assets(locale);
CREATE INDEX idx_campaign_assets_localized_from ON campaign_assets(localized_from_id);
CREATE INDEX idx_campaign_assets_assigned ON campaign_assets(assigned_to);

-- Campaign KPIs
CREATE INDEX idx_campaign_kpis_campaign ON campaign_kpis(campaign_id);

-- Campaign Metrics
CREATE INDEX idx_campaign_metrics_campaign ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_kpi ON campaign_metrics(campaign_kpi_id);
CREATE INDEX idx_campaign_metrics_channel ON campaign_metrics(campaign_channel_id);
CREATE INDEX idx_campaign_metrics_asset ON campaign_metrics(campaign_asset_id);
CREATE INDEX idx_campaign_metrics_measured ON campaign_metrics(measured_at);

-- Creative Reviews
CREATE INDEX idx_creative_reviews_asset ON creative_reviews(campaign_asset_id);
CREATE INDEX idx_creative_reviews_reviewer ON creative_reviews(reviewer_id);
CREATE INDEX idx_creative_reviews_gate ON creative_reviews(gate_type);
CREATE INDEX idx_creative_reviews_status ON creative_reviews(status);
CREATE INDEX idx_creative_reviews_org ON creative_reviews(organization_id);

-- Asset Channel Deployments
CREATE INDEX idx_asset_channel_deployments_asset ON asset_channel_deployments(campaign_asset_id);
CREATE INDEX idx_asset_channel_deployments_channel ON asset_channel_deployments(campaign_channel_id);

-- Extended columns
CREATE INDEX idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX idx_budget_line_items_campaign ON budget_line_items(campaign_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE brief_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guideline_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guideline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_channel_deployments ENABLE ROW LEVEL SECURITY;

-- Org-isolation policies
CREATE POLICY "org_isolation" ON brief_templates USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "org_isolation" ON brand_guidelines USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "org_isolation" ON brand_guideline_sections USING (
    brand_guideline_id IN (SELECT id FROM brand_guidelines WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "org_isolation" ON brand_guideline_versions USING (
    brand_guideline_id IN (SELECT id FROM brand_guidelines WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "org_isolation" ON creative_briefs USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "org_isolation" ON campaigns USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "org_isolation" ON campaign_channels USING (
    campaign_id IN (SELECT id FROM campaigns WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "org_isolation" ON campaign_assets USING (
    campaign_id IN (SELECT id FROM campaigns WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "org_isolation" ON campaign_kpis USING (
    campaign_id IN (SELECT id FROM campaigns WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "org_isolation" ON campaign_metrics USING (
    campaign_id IN (SELECT id FROM campaigns WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "org_isolation" ON creative_reviews USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "org_isolation" ON asset_channel_deployments USING (
    campaign_asset_id IN (
        SELECT ca.id FROM campaign_assets ca
        JOIN campaigns c ON c.id = ca.campaign_id
        WHERE c.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS — updated_at
-- ═══════════════════════════════════════════════════════════════

CREATE TRIGGER set_updated_at_brief_templates
    BEFORE UPDATE ON brief_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_brand_guidelines
    BEFORE UPDATE ON brand_guidelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_brand_guideline_sections
    BEFORE UPDATE ON brand_guideline_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_creative_briefs
    BEFORE UPDATE ON creative_briefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_campaigns
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_campaign_channels
    BEFORE UPDATE ON campaign_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_campaign_assets
    BEFORE UPDATE ON campaign_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_campaign_kpis
    BEFORE UPDATE ON campaign_kpis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_asset_channel_deployments
    BEFORE UPDATE ON asset_channel_deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS — activity log
-- ═══════════════════════════════════════════════════════════════

CREATE TRIGGER log_creative_briefs_changes
    AFTER INSERT OR UPDATE OR DELETE ON creative_briefs
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_campaigns_changes
    AFTER INSERT OR UPDATE OR DELETE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_campaign_assets_changes
    AFTER INSERT OR UPDATE OR DELETE ON campaign_assets
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_creative_reviews_changes
    AFTER INSERT OR UPDATE OR DELETE ON creative_reviews
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_brand_guidelines_changes
    AFTER INSERT OR UPDATE OR DELETE ON brand_guidelines
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ═══════════════════════════════════════════════════════════════
-- UTILITY VIEWS
-- ═══════════════════════════════════════════════════════════════

-- Campaign overview with aggregated metrics
CREATE OR REPLACE VIEW campaign_overview AS
SELECT
    c.id,
    c.name,
    c.status,
    c.total_budget,
    c.spent_budget,
    c.start_date,
    c.end_date,
    c.organization_id,
    cb.title AS brief_title,
    COUNT(DISTINCT ca.id) AS asset_count,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.production_status = 'approved') AS approved_asset_count,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.production_status = 'deployed') AS deployed_asset_count,
    COUNT(DISTINCT cc.id) AS channel_count,
    AVG(ca.brand_compliance_score) AS avg_compliance_score
FROM campaigns c
LEFT JOIN creative_briefs cb ON cb.id = c.brief_id
LEFT JOIN campaign_assets ca ON ca.campaign_id = c.id
LEFT JOIN campaign_channels cc ON cc.campaign_id = c.id
GROUP BY c.id, c.name, c.status, c.total_budget, c.spent_budget,
         c.start_date, c.end_date, c.organization_id, cb.title;

-- Brief pipeline summary
CREATE OR REPLACE VIEW brief_pipeline AS
SELECT
    cb.status,
    COUNT(*) AS brief_count,
    SUM(cb.total_budget) AS total_budget,
    cb.organization_id
FROM creative_briefs cb
WHERE cb.status NOT IN ('archived')
GROUP BY cb.status, cb.organization_id;
