/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Marketing Domain
   
   Declarative ListPageConfig objects for the marketing domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import {
    CREATE_BRAND_GUIDELINE_CONFIG,
    CREATE_BRAND_KIT_CONFIG,
    CREATE_CATALOG_ITEM_CONFIG,
} from "@/config/create-entity-configs";
import {
    CREATE_BRAND_CONFIG,
    CREATE_BRIEF_TEMPLATE_CONFIG,
    CREATE_CAMPAIGN_ASSET_CONFIG,
    CREATE_CAMPAIGN_CHANNEL_CONFIG,
    CREATE_CAMPAIGN_KPI_CONFIG,
    CREATE_CATALOG_CATEGORY_CONFIG,
    CREATE_CREATIVE_REVIEW_CONFIG,
    CREATE_SURVEY_TEMPLATE_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    BarChart3,
    ClipboardList,
    Eye,
    FileText,
    LayoutGrid,
    Palette,
    PenTool,
    Radio,
    ShoppingCart,
    Sparkles,
} from "lucide-react";

// ─── brand ───

export const BRANDS_PAGE: ListPageConfig = {
    entityKey: "brand",
    description: "Brand identities, guidelines, and asset libraries",
    icon: Sparkles,
    createConfig: CREATE_BRAND_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Brand", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── brief_template ───

export const BRIEF_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "brief_template",
    description: "Reusable creative brief templates for standardized project scoping",
    icon: FileText,
    createConfig: CREATE_BRIEF_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "brief_type", header: "Type", accessorKey: "brief_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── creative_review ───

export const CREATIVE_REVIEWS_PAGE: ListPageConfig = {
    entityKey: "creative_review",
    description: "Review and approve creative deliverables and assets",
    icon: Eye,
    createConfig: CREATE_CREATIVE_REVIEW_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Review", accessorKey: "title" },
        { id: "review_type", header: "Type", accessorKey: "review_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── survey_template ───

export const SURVEY_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "survey_template",
    description: "Reusable survey and feedback form templates",
    icon: ClipboardList,
    createConfig: CREATE_SURVEY_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "survey_type", header: "Type", accessorKey: "survey_type", fieldType: "status" },
        { id: "question_count", header: "Questions", accessorKey: "question_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── brand_guideline_section ───

export const BRAND_GUIDELINE_SECTIONS_PAGE: ListPageConfig = {
    entityKey: "brand_guideline_section",
    description: "Sections within brand guidelines defining usage rules",
    icon: Palette,
    createConfig: CREATE_BRAND_GUIDELINE_CONFIG,
    searchKeys: ["title", "section_type"],
    columns: [
        { id: "title", header: "Section", accessorKey: "title" },
        { id: "section_type", header: "Type", accessorKey: "section_type", fieldType: "status" },
        { id: "order", header: "Order", accessorKey: "order" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
};

// ─── brand_kit ───

export const BRAND_KITS_PAGE: ListPageConfig = {
    entityKey: "brand_kit",
    description: "Brand kits containing logos, colors, fonts, and templates",
    icon: Palette,
    createConfig: CREATE_BRAND_KIT_CONFIG,
    searchKeys: ["name", "brand_name"],
    columns: [
        { id: "name", header: "Kit", accessorKey: "name" },
        { id: "brand_name", header: "Brand", accessorKey: "brand_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
};

// ─── campaign_asset ───

export const CAMPAIGN_ASSETS_PAGE: ListPageConfig = {
    entityKey: "campaign_asset",
    description: "Creative assets linked to marketing campaigns",
    icon: PenTool,
    createConfig: CREATE_CAMPAIGN_ASSET_CONFIG,
    searchKeys: ["name", "asset_type"],
    columns: [
        { id: "name", header: "Asset", accessorKey: "name" },
        { id: "asset_type", header: "Type", accessorKey: "asset_type", fieldType: "status" },
        { id: "campaign_name", header: "Campaign", accessorKey: "campaign_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── campaign_channel ───

export const CAMPAIGN_CHANNELS_PAGE: ListPageConfig = {
    entityKey: "campaign_channel",
    description: "Distribution channels for marketing campaigns",
    icon: Radio,
    createConfig: CREATE_CAMPAIGN_CHANNEL_CONFIG,
    searchKeys: ["name", "channel_type"],
    columns: [
        { id: "name", header: "Channel", accessorKey: "name" },
        { id: "channel_type", header: "Type", accessorKey: "channel_type", fieldType: "status" },
        { id: "campaign_name", header: "Campaign", accessorKey: "campaign_name" },
        { id: "budget", header: "Budget", accessorKey: "budget", fieldType: "currency" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── campaign_kpi ───

export const CAMPAIGN_KPIS_PAGE: ListPageConfig = {
    entityKey: "campaign_kpi",
    description: "Key performance indicators for campaign measurement",
    icon: BarChart3,
    createConfig: CREATE_CAMPAIGN_KPI_CONFIG,
    searchKeys: ["name", "metric_type"],
    columns: [
        { id: "name", header: "KPI", accessorKey: "name" },
        { id: "metric_type", header: "Metric", accessorKey: "metric_type", fieldType: "status" },
        { id: "target_value", header: "Target", accessorKey: "target_value" },
        { id: "current_value", header: "Current", accessorKey: "current_value" },
        { id: "campaign_name", header: "Campaign", accessorKey: "campaign_name" },
    ],
};

// ─── catalog_category ───

export const CATALOG_CATEGORIES_PAGE: ListPageConfig = {
    entityKey: "catalog_category",
    description: "Categories for organizing catalog items",
    icon: LayoutGrid,
    createConfig: CREATE_CATALOG_CATEGORY_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Category", accessorKey: "name" },
        { id: "parent_name", header: "Parent", accessorKey: "parent_name" },
        { id: "item_count", header: "Items", accessorKey: "item_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── catalog_item ───

export const CATALOG_ITEMS_PAGE: ListPageConfig = {
    entityKey: "catalog_item",
    description: "Products and services in the catalog",
    icon: ShoppingCart,
    createConfig: CREATE_CATALOG_ITEM_CONFIG,
    searchKeys: ["name", "sku"],
    columns: [
        { id: "name", header: "Item", accessorKey: "name" },
        { id: "sku", header: "SKU", accessorKey: "sku" },
        { id: "price", header: "Price", accessorKey: "price", fieldType: "currency" },
        {
            id: "category_name",
            header: "Category",
            accessorKey: "category_name",
            fieldType: "status",
        },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
    ],
};

// ─── survey_response ───

export const SURVEY_RESPONSES_PAGE: ListPageConfig = {
    entityKey: "survey_response",
    description: "Responses to surveys and feedback forms",
    icon: ClipboardList,
    searchKeys: ["respondent_name", "survey_name"],
    columns: [
        { id: "respondent_name", header: "Respondent", accessorKey: "respondent_name" },
        { id: "survey_name", header: "Survey", accessorKey: "survey_name" },
        { id: "score", header: "Score", accessorKey: "score" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "submitted_at", header: "Submitted", accessorKey: "submitted_at", fieldType: "date" },
    ],
};
