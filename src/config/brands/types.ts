/* ═══════════════════════════════════════════════════════════════
   BRAND TYPES — Type Definitions for Multi-Tenant Branding
   ═══════════════════════════════════════════════════════════════ */

export interface BrandColorPalette {
    primary: string; // HSL format: "H S% L%"
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    ring: string;
}

export interface BrandTypography {
    fontFamily: string;
    fontFamilyDisplay?: string | undefined;
    fontFamilyMono?: string | undefined;
}

export interface BrandAssets {
    logoIcon: string;
    logoWordmark?: string | undefined;
    logoFull?: string | undefined;
    favicon?: string | undefined;
    ogImage?: string | undefined;
}

export interface BrandContact {
    email: string;
    url: string;
    phone?: string | undefined;
    address?: string | undefined;
}

export interface BrandSocial {
    twitter?: string | undefined;
    instagram?: string | undefined;
    youtube?: string | undefined;
    twitch?: string | undefined;
    discord?: string | undefined;
    tiktok?: string | undefined;
}

export interface BrandConfig {
    id: string;
    name: string;
    shortName: string;
    tagline: string;
    description?: string | undefined;
    colors: {
        light: BrandColorPalette;
        dark: BrandColorPalette;
    };

    typography: BrandTypography;
    assets: BrandAssets;
    support: BrandContact;
    social?: BrandSocial | undefined;
    features?: {
        enableDarkMode?: boolean | undefined;
        enableAnimations?: boolean | undefined;
        enableGlassEffects?: boolean | undefined;
    };
}

export type BrandId = "atlvs" | "playbook";
