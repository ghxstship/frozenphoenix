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
    fontFamilyDisplay?: string;
    fontFamilyMono?: string;
}

export interface BrandAssets {
    logoIcon: string;
    logoWordmark?: string;
    logoFull?: string;
    favicon?: string;
    ogImage?: string;
}

export interface BrandContact {
    email: string;
    url: string;
    phone?: string;
    address?: string;
}

export interface BrandSocial {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
    tiktok?: string;
}

export interface BrandConfig {
    id: string;
    name: string;
    shortName: string;
    tagline: string;
    description?: string;

    colors: {
        light: BrandColorPalette;
        dark: BrandColorPalette;
    };

    typography: BrandTypography;
    assets: BrandAssets;
    support: BrandContact;
    social?: BrandSocial;

    features?: {
        enableDarkMode?: boolean;
        enableAnimations?: boolean;
        enableGlassEffects?: boolean;
    };
}

export type BrandId = "atlvs" | "playbook";
