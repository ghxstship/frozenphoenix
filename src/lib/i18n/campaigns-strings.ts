/**
 * Campaigns & Marketing — i18n string definitions
 * Covers: campaigns, briefs, brand-guidelines
 */

export const CAMPAIGNS_STRINGS = {
    // ─── Campaigns ─────────────────────────────────────────────
    campaigns_title: "Campaigns",
    campaigns_empty: "No campaigns",
    campaigns_search: "Search campaigns...",
    campaigns_create: "New Campaign",
    campaign_name: "Campaign Name",
    campaign_status: "Status",
    campaign_type: "Type",
    campaign_start_date: "Start Date",
    campaign_end_date: "End Date",
    campaign_budget: "Budget",
    campaign_channels: "Channels",
    campaign_kpis: "KPIs",
    campaign_assets: "Assets",
    campaign_description: "Description",

    // ─── Campaign Channels ─────────────────────────────────────
    channel_name: "Channel Name",
    channel_type: "Channel Type",
    channel_budget: "Budget",
    channel_reach: "Estimated Reach",
    channel_status: "Status",

    // ─── Campaign KPIs ─────────────────────────────────────────
    kpi_name: "KPI Name",
    kpi_target: "Target",
    kpi_actual: "Actual",
    kpi_unit: "Unit",
    kpi_trend: "Trend",

    // ─── Briefs ────────────────────────────────────────────────
    briefs_title: "Briefs",
    briefs_empty: "No briefs",
    briefs_create: "New Brief",
    brief_title: "Brief Title",
    brief_type: "Type",
    brief_client: "Client",
    brief_objectives: "Objectives",
    brief_target_audience: "Target Audience",
    brief_deliverables: "Deliverables",
    brief_deadline: "Deadline",
    brief_budget: "Budget",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_campaign_list: "Campaign list",
    a11y_kpi_chart: "KPI progress chart",
    a11y_channel_breakdown: "Channel budget breakdown",
} as const;

export type CampaignsStringKey = keyof typeof CAMPAIGNS_STRINGS;
