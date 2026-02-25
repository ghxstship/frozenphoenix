/* ═══════════════════════════════════════════════════════════════
   BRAND CONFIGURATION — Single Source of Truth for White-Label
   ═══════════════════════════════════════════════════════════════ */

export interface BrandConfig {
    name: string;
    shortName: string;
    tagline: string;
    logo: {
        icon: string;
        wordmark?: string;
    };
    support: {
        email: string;
        url: string;
    };
}

/**
 * Default brand configuration.
 * Override via environment variables or tenant-specific config.
 */
export const brandConfig: BrandConfig = {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || "Frozen Phoenix",
    shortName: process.env.NEXT_PUBLIC_BRAND_SHORT_NAME || "FP",
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Production Command Center",
    logo: {
        icon: process.env.NEXT_PUBLIC_BRAND_LOGO_ICON || "/logo-icon.svg",
        wordmark: process.env.NEXT_PUBLIC_BRAND_LOGO_WORDMARK || undefined,
    },
    support: {
        email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@frozenphoenix.com",
        url: process.env.NEXT_PUBLIC_SUPPORT_URL || "https://frozenphoenix.com/support",
    },
};
