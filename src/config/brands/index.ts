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
export { RILLA_BRAND } from "./rilla";
export { FROZEN_PHOENIX_BRAND } from "./frozen-phoenix";

// Brand registry for runtime lookup
import { RILLA_BRAND } from "./rilla";
import { FROZEN_PHOENIX_BRAND } from "./frozen-phoenix";

export const BRAND_REGISTRY: Record<BrandId, BrandConfig> = {
    "frozen-phoenix": FROZEN_PHOENIX_BRAND,
    "rilla": RILLA_BRAND,
};

/**
 * Get brand configuration by ID
 */
export function getBrand(id: BrandId): BrandConfig {
    return BRAND_REGISTRY[id];
}

/**
 * Get current active brand from environment or default
 */
export function getActiveBrand(): BrandConfig {
    const brandId = (process.env.NEXT_PUBLIC_BRAND_ID as BrandId) || "frozen-phoenix";
    return BRAND_REGISTRY[brandId] || FROZEN_PHOENIX_BRAND;
}
