/* ═══════════════════════════════════════════════════════════════
   Creative, Brand & Campaign Lifecycle Types (Migration 015)
   ═══════════════════════════════════════════════════════════════ */

// ─── Enums ───────────────────────────────────────────────────

export type CreativeBriefStatus =
    | "draft"
    | "stakeholder_review"
    | "strategy_approved"
    | "budget_approved"
    | "final_approved"
    | "active"
    | "completed"
    | "archived";

export type CreativeBriefType =
    | "brand"
    | "campaign"
    | "product"
    | "event"
    | "social"
    | "content"
    | "experiential";

export type BrandGuidelineStatus = "draft" | "published" | "archived";

export type GuidelineSectionType =
    | "visual_identity"
    | "color_system"
    | "typography"
    | "tone_and_voice"
    | "motion"
    | "accessibility"
    | "co_branding"
    | "photography"
    | "iconography"
    | "layout";

export type CampaignStatus =
    | "planning"
    | "brief_approved"
    | "in_production"
    | "review"
    | "approved"
    | "launching"
    | "live"
    | "optimizing"
    | "completed"
    | "archived";

export type CampaignChannelType =
    | "social_meta"
    | "social_tiktok"
    | "social_linkedin"
    | "social_x"
    | "social_youtube"
    | "display"
    | "email"
    | "website"
    | "print"
    | "ooh"
    | "experiential"
    | "video"
    | "podcast"
    | "influencer"
    | "pr";

export type CampaignChannelStatus = "planned" | "active" | "paused" | "completed";

export type CampaignAssetRole =
    | "hero"
    | "supporting"
    | "variant"
    | "localized"
    | "thumbnail"
    | "social_crop"
    | "print_adaptation"
    | "motion"
    | "template";

export type CampaignAssetProductionStatus =
    | "briefed"
    | "in_production"
    | "in_review"
    | "revision_requested"
    | "approved"
    | "deployed"
    | "retired";

export type CreativeReviewGate =
    | "creative_director"
    | "brand_compliance"
    | "legal"
    | "stakeholder"
    | "client";

export type CreativeReviewStatus =
    | "requested"
    | "in_review"
    | "approved"
    | "revision_requested"
    | "rejected";

export type KpiMetricType = "percentage" | "count" | "currency" | "ratio" | "duration";

export type AttributionModel =
    | "first_touch"
    | "last_touch"
    | "linear"
    | "time_decay"
    | "position_based";

export type BrandLevel = "primary" | "sub_brand" | "market_variant" | "co_brand";

// ─── Brief Templates ─────────────────────────────────────────

export interface BriefTemplate {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    brief_type: CreativeBriefType;
    template_sections: Record<string, unknown>;
    default_kpis: Record<string, unknown>[];
    default_deliverable_manifest: Record<string, unknown>[];
    is_active: boolean;
    usage_count: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Brand Guidelines ────────────────────────────────────────

export interface BrandGuideline {
    id: string;
    organization_id: string;
    parent_id: string | null;
    brand_kit_id: string | null;
    name: string;
    description: string | null;
    brand_level: BrandLevel;
    markets: string[];
    status: BrandGuidelineStatus;
    current_version: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface BrandGuidelineSection {
    id: string;
    brand_guideline_id: string;
    section_type: GuidelineSectionType;
    title: string;
    description: string | null;
    content: Record<string, unknown>;
    display_order: number;
    is_inherited: boolean;
    overrides_parent_section_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface BrandGuidelineVersion {
    id: string;
    brand_guideline_id: string;
    version_number: number;
    snapshot: Record<string, unknown>;
    change_summary: string | null;
    published_by: string | null;
    published_at: string;
}

// ─── Creative Briefs ─────────────────────────────────────────

export interface CreativeBrief {
    id: string;
    organization_id: string;
    template_id: string | null;
    brand_guideline_id: string | null;
    brand_guideline_version_id: string | null;
    project_id: string | null;
    deal_id: string | null;
    company_id: string | null;
    title: string;
    brief_type: CreativeBriefType;
    objective_summary: string | null;
    status: CreativeBriefStatus;
    business_objectives: string[];
    success_criteria: string[];
    competitive_context: string | null;
    target_segments: Record<string, unknown>[];
    personas: Record<string, unknown>[];
    deliverable_manifest: DeliverableManifestItem[];
    channels: string[];
    markets: string[];
    tone_direction: string | null;
    visual_direction: string | null;
    total_budget: number;
    budget_breakdown: BudgetBreakdownItem[];
    contingency_pct: number;
    start_date: string | null;
    end_date: string | null;
    milestone_dates: MilestoneDate[];
    kpi_definitions: KpiDefinition[];
    owner_id: string | null;
    inspiration_assets: Record<string, unknown>[];
    competitor_references: Record<string, unknown>[];
    version: number;
    amendment_of_id: string | null;
    retrospective_notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface DeliverableManifestItem {
    type: string;
    quantity: number;
    specs: string;
    channel?: string | undefined;
}

export interface BudgetBreakdownItem {
    category: string;
    amount: number;
}

export interface MilestoneDate {
    label: string;
    date: string;
}

export interface KpiDefinition {
    metric: string;
    target: number;
    measurement_method: string;
    attribution_model?: AttributionModel | undefined;
}

// ─── Campaigns ───────────────────────────────────────────────

export interface Campaign {
    id: string;
    organization_id: string;
    brief_id: string | null;
    brand_guideline_version_id: string | null;
    company_id: string | null;
    project_id: string | null;
    name: string;
    description: string | null;
    status: CampaignStatus;
    objective: string | null;
    target_audience: string | null;
    key_messages: string[];
    total_budget: number;
    spent_budget: number;
    start_date: string | null;
    end_date: string | null;
    launch_date: string | null;
    owner_id: string | null;

    total_reach: number | null;
    total_impressions: number | null;
    total_engagements: number | null;
    total_conversions: number | null;
    roi: number | null;
    post_analysis_notes: string | null;
    tags: string[];
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Campaign Channels ───────────────────────────────────────

export interface CampaignChannel {
    id: string;
    campaign_id: string;
    channel_type: CampaignChannelType;
    label: string | null;
    budget_allocation: number;
    budget_pct: number;
    launch_date: string | null;
    end_date: string | null;
    status: CampaignChannelStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Campaign Assets ─────────────────────────────────────────

export interface CampaignAsset {
    id: string;
    campaign_id: string;
    digital_asset_id: string | null;
    brief_id: string | null;
    name: string;
    asset_role: CampaignAssetRole;
    production_status: CampaignAssetProductionStatus;
    target_channels: CampaignChannelType[];
    brand_compliance_score: number | null;
    compliance_notes: string | null;
    locale: string;
    localized_from_id: string | null;
    localization_notes: string | null;
    specs: Record<string, unknown>;
    due_date: string | null;
    approved_at: string | null;
    deployed_at: string | null;
    assigned_to: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Campaign KPIs ───────────────────────────────────────────

export interface CampaignKpi {
    id: string;
    campaign_id: string;
    metric_name: string;
    metric_type: KpiMetricType;
    target_value: number | null;
    current_value: number | null;
    measurement_method: string | null;
    attribution: AttributionModel;
    data_source: string | null;
    reporting_frequency: "daily" | "weekly" | "monthly" | "quarterly";
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Campaign Metrics ────────────────────────────────────────

export interface CampaignMetric {
    id: string;
    campaign_id: string;
    campaign_kpi_id: string | null;
    campaign_channel_id: string | null;
    campaign_asset_id: string | null;
    metric_name: string;
    metric_value: number;
    measured_at: string;
    metadata: Record<string, unknown>;
}

// ─── Creative Reviews ────────────────────────────────────────

export interface CreativeReview {
    id: string;
    campaign_asset_id: string;
    reviewer_id: string | null;
    gate_type: CreativeReviewGate;
    status: CreativeReviewStatus;
    score: number | null;
    feedback: string | null;
    annotations: Record<string, unknown>[];
    requested_at: string;
    reviewed_at: string | null;
    organization_id: string;
    created_at: string;
}

// ─── Asset Channel Deployments ───────────────────────────────

export interface AssetChannelDeployment {
    id: string;
    campaign_asset_id: string;
    campaign_channel_id: string;
    deployed_at: string | null;
    retired_at: string | null;
    deployment_url: string | null;
    performance_notes: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

// ─── Composite Types ─────────────────────────────────────────

export interface CampaignWithBrief extends Campaign {
    brief?: CreativeBrief | null | undefined;
}

export interface CampaignAssetWithReviews extends CampaignAsset {
    reviews?: CreativeReview[] | undefined;
}

export interface BrandGuidelineWithSections extends BrandGuideline {
    sections?: BrandGuidelineSection[] | undefined;
}

export interface CampaignOverview {
    id: string;
    name: string;
    status: CampaignStatus;
    total_budget: number;
    spent_budget: number;
    start_date: string | null;
    end_date: string | null;
    organization_id: string;
    brief_title: string | null;
    asset_count: number;
    approved_asset_count: number;
    deployed_asset_count: number;
    channel_count: number;
    avg_compliance_score: number | null;
}
