/* ═══════════════════════════════════════════════════════════════
   CONFIG INDEX — Unified Export for All Configuration
   ═══════════════════════════════════════════════════════════════
   
   Import from "@/config" for all configuration needs.
   This ensures SSOT by providing a single entry point.
   ═══════════════════════════════════════════════════════════════ */

// Multi-Tenant Brand System
export { BRAND_REGISTRY, ATLVS_BRAND, PLAYBOOK_BRAND, getBrand, getActiveBrand } from "./brands";
export type {
    BrandConfig,
    BrandId,
    BrandColorPalette,
    BrandTypography,
    BrandAssets,
    BrandContact,
    BrandSocial,
} from "./brands";

// Design System Tokens
export * from "./design-tokens";

// UI Variant Mappings
export * from "./ui-variants";

// Domain Business Logic
export * from "./domain-config";

// Navigation Structure
export * from "./navigation";

// Production Domain Configuration
export * from "./production-config";

// RBAC Permissions
export * from "./rbac";

// Tier Entitlements (Billing)
export * from "./tier-entitlements";
