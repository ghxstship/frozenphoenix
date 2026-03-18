/* ═══════════════════════════════════════════════════════════════
   ATLVS — Primary Product Brand Configuration
   The hero brand identity for the ATLVS platform product.
   ═══════════════════════════════════════════════════════════════ */

import type { BrandConfig } from "./types";

export const ATLVS_BRAND: BrandConfig = {
    id: "atlvs",
    name: "ATLVS",
    shortName: "AV",
    tagline: "Experiential Project Management System",
    description:
        "Enterprise-grade production management platform for live events, fabrication, and experiential marketing.",

    colors: {
        light: {
            primary: "220 70% 50%",
            primaryForeground: "0 0% 100%",
            secondary: "220 14% 96%",
            secondaryForeground: "220 30% 10%",
            accent: "220 14% 93%",
            accentForeground: "220 30% 10%",
            background: "220 20% 97%",
            foreground: "220 30% 10%",
            muted: "220 14% 96%",
            mutedForeground: "215 16% 47%",
            card: "0 0% 100%",
            cardForeground: "220 30% 10%",
            border: "220 13% 91%",
            ring: "220 70% 50%",
        },
        dark: {
            primary: "220 70% 60%",
            primaryForeground: "222 30% 7%",
            secondary: "220 20% 16%",
            secondaryForeground: "220 14% 93%",
            accent: "220 20% 16%",
            accentForeground: "220 14% 93%",
            background: "222 30% 7%",
            foreground: "220 14% 93%",
            muted: "220 20% 16%",
            mutedForeground: "215 20% 55%",
            card: "222 25% 10%",
            cardForeground: "220 14% 93%",
            border: "220 18% 18%",
            ring: "220 70% 60%",
        },
    },

    typography: {
        fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontFamilyMono: "var(--font-geist-mono), ui-monospace, monospace",
    },

    assets: {
        logoIcon: "/logo-icon.svg",
        logoWordmark: "/logo-wordmark.svg",
        favicon: "/favicon.ico",
    },

    support: {
        email: "support@atlvs.one",
        url: "https://atlvs.one/support",
    },

    features: {
        enableDarkMode: true,
        enableAnimations: true,
        enableGlassEffects: true,
    },
};
