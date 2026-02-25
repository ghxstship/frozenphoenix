/* ═══════════════════════════════════════════════════════════════
   RILLA — Sales Coaching AI Platform Brand Configuration
   ═══════════════════════════════════════════════════════════════
   
   Brand Identity:
   - "The End of Ridealongs" - AI-powered sales coaching
   - Virtual ridealongs with recordings, transcriptions, analytics
   - Premium, professional aesthetic with jungle-themed events
   - Target: Home services, auto, HVAC, and field sales teams
   
   Rilla Masters: Flagship conference for mastering in-person sales
   ═══════════════════════════════════════════════════════════════ */

import type { BrandConfig } from "./types";

export const RILLA_BRAND: BrandConfig = {
    id: "rilla",
    name: "Rilla",
    shortName: "RILLA",
    tagline: "The End of Ridealongs",
    description: "AI-powered sales coaching platform. Making offline commerce as searchable and easy to understand as the internet.",
    
    colors: {
        light: {
            // Deep purple/indigo primary with warm coral accents
            primary: "262 83% 58%",            // Vibrant purple #8B5CF6
            primaryForeground: "0 0% 100%",
            secondary: "260 20% 96%",          // Soft lavender background
            secondaryForeground: "262 30% 15%",
            accent: "16 100% 66%",             // Warm coral/orange #FF7849
            accentForeground: "0 0% 100%",
            background: "0 0% 100%",           // Clean white
            foreground: "262 40% 10%",         // Near-black with purple tint
            muted: "260 15% 95%",
            mutedForeground: "260 10% 45%",
            card: "0 0% 100%",
            cardForeground: "262 40% 10%",
            border: "260 15% 90%",
            ring: "262 83% 58%",
        },
        dark: {
            // Rich purple with vibrant accents for dark mode
            primary: "262 83% 65%",            // Brighter purple for dark mode
            primaryForeground: "0 0% 100%",
            secondary: "262 30% 12%",          // Dark purple
            secondaryForeground: "260 15% 90%",
            accent: "16 100% 60%",             // Coral accent
            accentForeground: "0 0% 100%",
            background: "262 40% 6%",          // Deep purple-black
            foreground: "260 10% 95%",
            muted: "262 25% 12%",
            mutedForeground: "260 15% 55%",
            card: "262 35% 9%",
            cardForeground: "260 10% 95%",
            border: "262 25% 15%",
            ring: "262 83% 65%",
        },
    },
    
    typography: {
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontFamilyDisplay: "'Plus Jakarta Sans', 'Inter', sans-serif",
        fontFamilyMono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    },
    
    assets: {
        logoIcon: "/brands/rilla/logo-icon.svg",
        logoWordmark: "/brands/rilla/logo-wordmark.svg",
        logoFull: "/brands/rilla/logo-full.svg",
        favicon: "/brands/rilla/favicon.ico",
        ogImage: "/brands/rilla/og-image.png",
    },
    
    support: {
        email: "hello@rilla.com",
        url: "https://www.rilla.com/faq",
        phone: "(914) 873-5454",
    },
    
    social: {
        twitter: "https://twitter.com/rillavoice",
    },
    
    features: {
        enableDarkMode: true,
        enableAnimations: true,
        enableGlassEffects: true,
    },
};

// ─── Rilla-Specific Design Tokens ───
// Extended tokens for sales coaching platform UI elements

export const RILLA_TOKENS = {
    // Sales performance tiers
    performanceTiers: {
        needsCoaching: { bg: "0 84% 60%", text: "0 0% 100%" },
        developing: { bg: "38 92% 50%", text: "0 0% 0%" },
        proficient: { bg: "199 89% 48%", text: "0 0% 100%" },
        topPerformer: { bg: "142 70% 45%", text: "0 0% 100%" },
        elite: { bg: "262 83% 58%", text: "0 0% 100%" },
    },
    
    // Coaching session status
    sessionStatus: {
        scheduled: { bg: "199 89% 48%", variant: "info" },
        inProgress: { bg: "38 92% 50%", variant: "warning" },
        completed: { bg: "142 70% 45%", variant: "success" },
        reviewed: { bg: "262 83% 58%", variant: "default" },
    },
    
    // Metrics indicators
    metrics: {
        closeRate: "142 70% 45%",
        ticketPrice: "262 83% 58%",
        timeSaved: "199 89% 48%",
        coachingScore: "16 100% 60%",
    },
    
    // Conference/event theming (Jungle Afterparty inspired)
    jungle: {
        primary: "142 76% 36%",
        accent: "75 100% 50%",
        dark: "150 40% 8%",
    },
} as const;

// ─── Rilla Masters Conference Tracks ───
export const RILLA_MASTERS_TRACKS = [
    { id: "sales-leadership", label: "Sales Leadership", icon: "users" },
    { id: "coaching", label: "The Art of Coaching", icon: "message-circle" },
    { id: "ai-technology", label: "AI & Technology", icon: "cpu" },
    { id: "performance", label: "High Performance", icon: "trending-up" },
    { id: "culture", label: "Culture & Teams", icon: "heart" },
] as const;

export type RillaMastersTrack = typeof RILLA_MASTERS_TRACKS[number]["id"];

// ─── Industry Verticals ───
export const RILLA_VERTICALS = [
    { id: "home-services", label: "Home Services", examples: ["HVAC", "Plumbing", "Roofing"] },
    { id: "auto", label: "Automotive", examples: ["Auto Service", "Dealerships"] },
    { id: "home-building", label: "Home Building", examples: ["Builders", "Remodeling"] },
    { id: "windows-doors", label: "Windows & Doors", examples: ["Replacement", "Installation"] },
    { id: "solar", label: "Solar & Energy", examples: ["Solar Installation", "Energy Efficiency"] },
] as const;

export type RillaVertical = typeof RILLA_VERTICALS[number]["id"];
