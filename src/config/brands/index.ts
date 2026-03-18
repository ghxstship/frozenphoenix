/* ═══════════════════════════════════════════════════════════════
   BRAND REGISTRY — Multi-Tenant Brand Configuration System
   ═══════════════════════════════════════════════════════════════
   
   3NF Compliance:
   - Each brand defined exactly once
   - All styling resolves via design tokens
   - No hardcoded values in components
   
   White-Label Ready:
   - Full brand abstraction
   - Tenant-isolated configuration
   - Zero brand leakage
   ═══════════════════════════════════════════════════════════════ */

// Re-export all types
export type {
    BrandColorPalette,
    BrandTypography,
    BrandAssets,
    BrandContact,
    BrandSocial,
    BrandConfig,
    BrandId,
} from "./types";

import type { BrandConfig, BrandId } from "./types";

// Re-export individual brand configs
export { ATLVS_BRAND } from "./atlvs";
export { PLAYBOOK_BRAND } from "./playbook";

// Brand registry for runtime lookup
import { ATLVS_BRAND } from "./atlvs";
import { PLAYBOOK_BRAND } from "./playbook";

export const BRAND_REGISTRY: Record<BrandId, BrandConfig> = {
    atlvs: ATLVS_BRAND,
    playbook: PLAYBOOK_BRAND,
};

/**
 * Get brand configuration by ID
 */
export function getBrand(id: BrandId): BrandConfig {
    return BRAND_REGISTRY[id];
}

/**
 * Get current active brand from environment or default.
 *
 * FIND-008: Resolution order for multi-tenant brand config:
 *   1. Runtime override via `organizations.settings.brand_id` (DB-backed)
 *      — When org-level brand resolution is wired, pass the org's brand_id
 *        to `getBrand()` directly instead of calling `getActiveBrand()`.
 *   2. Build-time env var NEXT_PUBLIC_BRAND_ID (current implementation)
 *   3. Fallback to "atlvs"
 *
 * To enable DB-backed brand resolution per-org:
 *   const org = await supabase.from("organizations").select("settings").eq("id", orgId).single();
 *   const brand = getBrand(org.data?.settings?.brand_id || getActiveBrand().id);
 */
export function getActiveBrand(): BrandConfig {
    const brandId = (process.env.NEXT_PUBLIC_BRAND_ID as BrandId) || "atlvs";
    return BRAND_REGISTRY[brandId] || ATLVS_BRAND;
}

/**
 * Resolve brand for a specific organization.
 * Accepts an optional brand_id from the org's settings JSONB.
 * Falls back to the environment-level active brand.
 */
export function resolveBrandForOrg(orgBrandId?: string | null): BrandConfig {
    if (orgBrandId && orgBrandId in BRAND_REGISTRY) {
        return BRAND_REGISTRY[orgBrandId as BrandId];
    }
    return getActiveBrand();
}
