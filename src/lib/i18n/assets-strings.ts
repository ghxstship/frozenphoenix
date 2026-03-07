/**
 * Assets & Digital Media — i18n string definitions
 * Covers: assets, digital-assets, creative-assets, brand-guidelines,
 *         brand-kit, decks, documents, knowledge-base
 */

export const ASSETS_STRINGS = {
    // ─── Assets ────────────────────────────────────────────────
    assets_title: "Assets",
    assets_empty: "No assets",
    assets_search: "Search assets...",
    assets_create: "New Asset",
    asset_name: "Asset Name",
    asset_type: "Type",
    asset_status: "Status",
    asset_location: "Location",
    asset_serial_number: "Serial Number",
    asset_condition: "Condition",
    asset_assigned_to: "Assigned To",
    asset_purchase_date: "Purchase Date",
    asset_value: "Value",

    // ─── Digital Assets ────────────────────────────────────────
    digital_assets_title: "Digital Assets",
    digital_assets_empty: "No digital assets",
    digital_assets_create: "Upload Asset",
    digital_asset_filename: "Filename",
    digital_asset_format: "Format",
    digital_asset_size: "Size",
    digital_asset_tags: "Tags",
    digital_asset_usage_rights: "Usage Rights",

    // ─── Creative Assets ──────────────────────────────────────
    creative_assets_title: "Creative Assets",
    creative_assets_empty: "No creative assets",
    creative_assets_create: "New Creative Asset",
    creative_asset_campaign: "Campaign",
    creative_asset_type: "Asset Type",
    creative_asset_dimensions: "Dimensions",
    creative_asset_version: "Version",

    // ─── Brand Guidelines ──────────────────────────────────────
    brand_guidelines_title: "Brand Guidelines",
    brand_guidelines_empty: "No brand guidelines",
    brand_guidelines_create: "New Guideline",
    brand_guideline_section: "Section",
    brand_guideline_description: "Description",
    brand_guideline_examples: "Examples",

    // ─── Brand Kit ─────────────────────────────────────────────
    brand_kit_title: "Brand Kit",
    brand_kit_empty: "No brand kit items",
    brand_kit_logos: "Logos",
    brand_kit_colors: "Colors",
    brand_kit_typography: "Typography",
    brand_kit_templates: "Templates",

    // ─── Decks ─────────────────────────────────────────────────
    decks_title: "Decks",
    decks_empty: "No decks",
    decks_create: "New Deck",
    deck_title: "Deck Title",
    deck_slides: "Slides",
    deck_template: "Template",
    deck_shared_with: "Shared With",

    // ─── Documents ─────────────────────────────────────────────
    documents_title: "Documents",
    documents_empty: "No documents",
    documents_search: "Search documents...",
    documents_create: "Upload Document",
    document_name: "Document Name",
    document_type: "Type",
    document_version: "Version",
    document_uploaded_by: "Uploaded By",
    document_last_modified: "Last Modified",

    // ─── Knowledge Base ────────────────────────────────────────
    knowledge_base_title: "Knowledge Base",
    knowledge_base_empty: "No articles",
    knowledge_base_search: "Search knowledge base...",
    knowledge_base_create: "New Article",
    article_title: "Title",
    article_category: "Category",
    article_author: "Author",
    article_published: "Published",
    article_views: "Views",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_asset_list: "Asset list",
    a11y_document_list: "Document list",
    a11y_file_preview: "File preview for {name}",
    a11y_upload_zone: "Drag and drop files or click to upload",
} as const;

export type AssetsStringKey = keyof typeof ASSETS_STRINGS;
