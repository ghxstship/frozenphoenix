"use client";

/**
 * Documents & Creative entity hooks: documents, document_versions, document_templates,
 * vault_documents, brand_guidelines, brand_guideline_sections, brand_kits,
 * creative_briefs, brief_templates, creative_reviews, decks, call_sheets,
 * tech_sheets, sops, knowledge_articles, digital_assets, creative_assets.
 */

import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";
import type { KBArticleWithProfile } from "./hook-types";

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS (documents table)
// ═══════════════════════════════════════════════════════════════

export const useDocuments = makeListHook<Tables<"documents">>(
    "document",
    "/api/entities/documents",
    {
        sort_by: "updated_at",
        sort_order: "desc",
    }
);
export const useDocument = makeDetailHook<Tables<"documents">>(
    "document",
    "/api/entities/documents"
);
export const useCreateDocument = makeCreateHook<Tables<"documents">>(
    "document",
    "/api/entities/documents"
);
export const useUpdateDocument = makeUpdateHook<Tables<"documents">>(
    "document",
    "/api/entities/documents"
);
export const useDeleteDocument = makeDeleteHook("document", "/api/entities/documents");

// ─── Document Versions ───
export const useDocumentVersions = makeListHook<Tables<"document_versions">>(
    "document_version",
    "/api/entities/document-versions",
    { sort_by: "version_number", sort_order: "desc" }
);
export const useCreateDocumentVersion = makeCreateHook<Tables<"document_versions">>(
    "document_version",
    "/api/entities/document-versions",
    ["document"]
);

// ═══════════════════════════════════════════════════════════════
// VAULT DOCUMENTS (vault_documents table)
// ═══════════════════════════════════════════════════════════════

export const useVaultDocuments = makeListHook<Tables<"vault_documents">>(
    "vault_document",
    "/api/entities/vault-documents",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useVaultDocument = makeDetailHook<Tables<"vault_documents">>(
    "vault_document",
    "/api/entities/vault-documents"
);
export const useCreateVaultDocument = makeCreateHook<Tables<"vault_documents">>(
    "vault_document",
    "/api/entities/vault-documents"
);
export const useUpdateVaultDocument = makeUpdateHook<Tables<"vault_documents">>(
    "vault_document",
    "/api/entities/vault-documents"
);
export const useDeleteVaultDocument = makeDeleteHook(
    "vault_document",
    "/api/entities/vault-documents"
);

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES (document_templates table)
// ═══════════════════════════════════════════════════════════════

export const useDocumentTemplates = makeListHook<Tables<"document_templates">>(
    "document_template",
    "/api/entities/templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useDocumentTemplate = makeDetailHook<Tables<"document_templates">>(
    "document_template",
    "/api/entities/templates"
);
export const useCreateDocumentTemplate = makeCreateHook<Tables<"document_templates">>(
    "document_template",
    "/api/entities/templates"
);
export const useUpdateDocumentTemplate = makeUpdateHook<Tables<"document_templates">>(
    "document_template",
    "/api/entities/templates"
);
export const useDeleteDocumentTemplate = makeDeleteHook(
    "document_template",
    "/api/entities/templates"
);

// ═══════════════════════════════════════════════════════════════
// BRAND GUIDELINES
// ═══════════════════════════════════════════════════════════════

export const useBrandGuidelines = makeListHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/entities/brand-guidelines",
    { sort_by: "title", sort_order: "asc" }
);
export const useBrandGuideline = makeDetailHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/entities/brand-guidelines"
);
export const useCreateBrandGuideline = makeCreateHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/entities/brand-guidelines"
);
export const useUpdateBrandGuideline = makeUpdateHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/entities/brand-guidelines"
);
export const useDeleteBrandGuideline = makeDeleteHook(
    "brand_guideline",
    "/api/entities/brand-guidelines"
);

// ─── Brand Guideline Sections ───
export const useBrandGuidelineSections = makeListHook<Tables<"brand_guideline_sections">>(
    "brand_guideline_section",
    "/api/entities/brand-guideline-sections",
    { sort_by: "sort_order", sort_order: "asc" }
);
export const useCreateBrandGuidelineSection = makeCreateHook<Tables<"brand_guideline_sections">>(
    "brand_guideline_section",
    "/api/entities/brand-guideline-sections",
    ["brand_guideline"]
);

// ═══════════════════════════════════════════════════════════════
// BRAND KITS
// ═══════════════════════════════════════════════════════════════

export const useBrandKits = makeListHook<Tables<"brand_kits">>(
    "brand_kit",
    "/api/entities/brand-kits",
    {
        sort_by: "client_name",
        sort_order: "asc",
    }
);
export const useBrandKit = makeDetailHook<Tables<"brand_kits">>(
    "brand_kit",
    "/api/entities/brand-kits"
);
export const useCreateBrandKit = makeCreateHook<Tables<"brand_kits">>(
    "brand_kit",
    "/api/entities/brand-kits"
);
export const useUpdateBrandKit = makeUpdateHook<Tables<"brand_kits">>(
    "brand_kit",
    "/api/entities/brand-kits"
);
export const useDeleteBrandKit = makeDeleteHook("brand_kit", "/api/entities/brand-kits");

// ═══════════════════════════════════════════════════════════════
// CREATIVE BRIEFS
// ═══════════════════════════════════════════════════════════════

export const useBriefs = makeListHook<Tables<"creative_briefs">>(
    "creative_brief",
    "/api/entities/briefs",
    {
        sort_by: "created_at",
        sort_order: "desc",
    }
);
export const useBrief = makeDetailHook<Tables<"creative_briefs">>(
    "creative_brief",
    "/api/entities/briefs"
);
export const useCreateBrief = makeCreateHook<Tables<"creative_briefs">>(
    "creative_brief",
    "/api/entities/briefs"
);
export const useUpdateBrief = makeUpdateHook<Tables<"creative_briefs">>(
    "creative_brief",
    "/api/entities/briefs"
);
export const useDeleteBrief = makeDeleteHook("creative_brief", "/api/entities/briefs");

// ─── Brief Templates ───
export const useBriefTemplates = makeListHook<Tables<"brief_templates">>(
    "brief_template",
    "/api/entities/brief-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateBriefTemplate = makeCreateHook<Tables<"brief_templates">>(
    "brief_template",
    "/api/entities/brief-templates"
);

// ═══════════════════════════════════════════════════════════════
// CREATIVE REVIEWS
// ═══════════════════════════════════════════════════════════════

export const useCreativeReviews = makeListHook<Tables<"creative_reviews">>(
    "creative_review",
    "/api/entities/creative-reviews",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateCreativeReview = makeCreateHook<Tables<"creative_reviews">>(
    "creative_review",
    "/api/entities/creative-reviews"
);

// ═══════════════════════════════════════════════════════════════
// DECKS
// ═══════════════════════════════════════════════════════════════

export const useDecks = makeListHook<Tables<"decks">>("deck", "/api/entities/decks", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useDeck = makeDetailHook<Tables<"decks">>("deck", "/api/entities/decks");
export const useCreateDeck = makeCreateHook<Tables<"decks">>("deck", "/api/entities/decks");
export const useUpdateDeck = makeUpdateHook<Tables<"decks">>("deck", "/api/entities/decks");
export const useDeleteDeck = makeDeleteHook("deck", "/api/entities/decks");

// CALL SHEETS → canonical in hooks-workflows.ts (join-aware)
// TECH SHEETS → canonical in hooks-workflows.ts (join-aware)

// ═══════════════════════════════════════════════════════════════
// SOPS
// ═══════════════════════════════════════════════════════════════

export const useSOPs = makeListHook<Tables<"sops">>("sop", "/api/entities/sops", {
    sort_by: "title",
    sort_order: "asc",
});
export const useSOP = makeDetailHook<Tables<"sops">>("sop", "/api/entities/sops");
export const useCreateSOP = makeCreateHook<Tables<"sops">>("sop", "/api/entities/sops");
export const useUpdateSOP = makeUpdateHook<Tables<"sops">>("sop", "/api/entities/sops");
export const useDeleteSOP = makeDeleteHook("sop", "/api/entities/sops");

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE ARTICLES
// ═══════════════════════════════════════════════════════════════

export const useKnowledgeBaseArticles = makeListHook<KBArticleWithProfile>(
    "knowledge_base_article",
    "/api/entities/knowledge-base",
    { sort_by: "title", sort_order: "asc" }
);
export const useKnowledgeBaseArticle = makeDetailHook<KBArticleWithProfile>(
    "knowledge_base_article",
    "/api/entities/knowledge-base"
);
export const useCreateKBArticle = makeCreateHook<Tables<"knowledge_articles">>(
    "knowledge_base_article",
    "/api/entities/knowledge-base"
);
export const useUpdateKBArticle = makeUpdateHook<Tables<"knowledge_articles">>(
    "knowledge_base_article",
    "/api/entities/knowledge-base-articles"
);
export const useDeleteKBArticle = makeDeleteHook(
    "knowledge_base_article",
    "/api/entities/knowledge-base-articles"
);

// ═══════════════════════════════════════════════════════════════
// DIGITAL ASSETS
// ═══════════════════════════════════════════════════════════════

export const useDigitalAssets = makeListHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/entities/digital-assets",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useDigitalAsset = makeDetailHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/entities/digital-assets"
);
export const useCreateDigitalAsset = makeCreateHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/entities/digital-assets"
);
export const useUpdateDigitalAsset = makeUpdateHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/entities/digital-assets"
);
export const useDeleteDigitalAsset = makeDeleteHook(
    "digital_asset",
    "/api/entities/digital-assets"
);

// ─── Creative Assets alias (same table) ───
export const useCreativeAssets = makeListHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/entities/digital-assets",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreativeAsset = makeDetailHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/entities/digital-assets"
);
export const useCreateCreativeAsset = makeCreateHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/entities/digital-assets"
);
export const useUpdateCreativeAsset = makeUpdateHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/entities/digital-assets"
);
export const useDeleteCreativeAsset = makeDeleteHook(
    "creative_asset",
    "/api/entities/digital-assets"
);

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN SUB-ENTITIES
// ═══════════════════════════════════════════════════════════════

export const useCampaigns = makeListHook<Tables<"campaigns">>(
    "campaign",
    "/api/entities/campaigns",
    {
        sort_by: "start_date",
        sort_order: "desc",
    }
);
export const useCampaign = makeDetailHook<Tables<"campaigns">>(
    "campaign",
    "/api/entities/campaigns"
);
export const useCreateCampaign = makeCreateHook<Tables<"campaigns">>(
    "campaign",
    "/api/entities/campaigns"
);
export const useUpdateCampaign = makeUpdateHook<Tables<"campaigns">>(
    "campaign",
    "/api/entities/campaigns"
);
export const useDeleteCampaign = makeDeleteHook("campaign", "/api/entities/campaigns");

export const useCampaignChannels = makeListHook<Tables<"campaign_channels">>(
    "campaign_channel",
    "/api/entities/campaign-channels"
);
export const useCampaignAssets = makeListHook<Tables<"campaign_assets">>(
    "campaign_asset",
    "/api/entities/campaign-assets"
);
export const useCampaignKPIs = makeListHook<Tables<"campaign_kpis">>(
    "campaign_kpi",
    "/api/entities/campaign-kpis"
);
