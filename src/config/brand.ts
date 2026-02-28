/* ═══════════════════════════════════════════════════════════════
   BRAND CONFIGURATION — DEPRECATED
   ═══════════════════════════════════════════════════════════════
   @deprecated Import from "@/config/brands" instead.
   This file is a backward-compatible shim. It re-exports
   the active brand from the BRAND_REGISTRY so existing
   consumers continue to work during migration.
   ═══════════════════════════════════════════════════════════════ */

import { getActiveBrand } from "@/config/brands";
import type { BrandConfig as FullBrandConfig } from "@/config/brands";

/**
 * @deprecated Use `BrandConfig` from "@/config/brands" instead.
 */
export type BrandConfig = FullBrandConfig;

const _active = getActiveBrand();

/**
 * @deprecated Use `getActiveBrand()` from "@/config/brands" instead.
 */
export const brandConfig = _active;
