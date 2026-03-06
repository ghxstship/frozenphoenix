/* ═══════════════════════════════════════════════════════════════
   PLAYBOOK — Default Platform Brand Configuration
   ═══════════════════════════════════════════════════════════════ */

import type { BrandConfig } from "./types";

export const PLAYBOOK_BRAND: BrandConfig = {
    id: "playbook",
    name: "Playbook",
    shortName: "PB",
    tagline: "Experiential Project Management System",
    description:
        "Enterprise-grade production management platform for live events, fabrication, and experiential marketing.",

    colors: {
        light: {
            primary: "220 70% 50%",
            primaryForeground: "0 0% 100%",
            secondary: "220 14% 96%",
            secondaryForeground: "220 30% 10%",
            accent: "31 97% 60%",
            accentForeground: "0 0% 100%",
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
            accent: "31 97% 55%",
            accentForeground: "0 0% 100%",
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
        email: "support@playbook.production",
        url: "https://playbook.production/support",
    },

    features: {
        enableDarkMode: true,
        enableAnimations: true,
        enableGlassEffects: true,
    },
};
