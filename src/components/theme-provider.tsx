"use client";

/* ═══════════════════════════════════════════════════════════════
   THEME PROVIDER — White-Label Appearance Hierarchy System
   ═══════════════════════════════════════════════════════════════
   
   Cascading inheritance priority (highest → lowest):
   1. User preferences
   2. Activation/Event override
   3. Project-level theme
   4. Organization-level theme
   5. Platform defaults (CSS :root)
   
   Design Principles:
   - Runtime theme switching without page reload
   - CSS custom property injection for zero re-render cost
   - Brand isolation across tenants
   - Reduced motion / high contrast awareness
   ═══════════════════════════════════════════════════════════════ */

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getBrand } from "@/config/brands";
import type { BrandId, BrandColorPalette } from "@/config/brands";

// ─── Theme Token Override Shape ───

export interface ThemeTokens {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    accent?: string;
    accentForeground?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    mutedForeground?: string;
    card?: string;
    cardForeground?: string;
    border?: string;
    ring?: string;
    radius?: string;
}

export type ColorMode = "light" | "dark" | "system";

export interface ThemeConfig {
    colorMode: ColorMode;
    brandId?: string;
    tokens?: ThemeTokens;
}

// ─── Theme Store (Zustand + Persist) ───

interface ThemeStore {
    colorMode: ColorMode;
    resolvedMode: "light" | "dark";
    brandId: string;
    orgTokens: ThemeTokens | null;
    projectTokens: ThemeTokens | null;
    userTokens: ThemeTokens | null;
    setColorMode: (mode: ColorMode) => void;
    setBrandId: (id: string) => void;
    setOrgTokens: (tokens: ThemeTokens | null) => void;
    setProjectTokens: (tokens: ThemeTokens | null) => void;
    setUserTokens: (tokens: ThemeTokens | null) => void;
    setResolvedMode: (mode: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            colorMode: "dark",
            resolvedMode: "dark",
            brandId: "playbook",
            orgTokens: null,
            projectTokens: null,
            userTokens: null,
            setColorMode: (colorMode) => set({ colorMode }),
            setBrandId: (brandId) => set({ brandId }),
            setOrgTokens: (orgTokens) => set({ orgTokens }),
            setProjectTokens: (projectTokens) => set({ projectTokens }),
            setUserTokens: (userTokens) => set({ userTokens }),
            setResolvedMode: (resolvedMode) => set({ resolvedMode }),
        }),
        {
            name: "pb-theme",
            partialize: (state) => ({
                colorMode: state.colorMode,
                brandId: state.brandId,
                userTokens: state.userTokens,
            }),
        }
    )
);

// ─── Theme Context ───

interface ThemeContextValue {
    colorMode: ColorMode;
    resolvedMode: "light" | "dark";
    brandId: string;
    setColorMode: (mode: ColorMode) => void;
    setBrandId: (id: string) => void;
    setOrgTokens: (tokens: ThemeTokens | null) => void;
    setProjectTokens: (tokens: ThemeTokens | null) => void;
    setUserTokens: (tokens: ThemeTokens | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    colorMode: "dark",
    resolvedMode: "dark",
    brandId: "playbook",
    setColorMode: () => {},
    setBrandId: () => {},
    setOrgTokens: () => {},
    setProjectTokens: () => {},
    setUserTokens: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

// ─── Token Application Logic ───

const TOKEN_CSS_MAP: Record<keyof ThemeTokens, string> = {
    primary: "--primary",
    primaryForeground: "--primary-foreground",
    secondary: "--secondary",
    secondaryForeground: "--secondary-foreground",
    accent: "--accent",
    accentForeground: "--accent-foreground",
    background: "--background",
    foreground: "--foreground",
    muted: "--muted",
    mutedForeground: "--muted-foreground",
    card: "--card",
    cardForeground: "--card-foreground",
    border: "--border",
    ring: "--ring",
    radius: "--radius",
};

function applyTokensToDOM(tokens: ThemeTokens) {
    const root = document.documentElement;
    for (const [key, cssVar] of Object.entries(TOKEN_CSS_MAP)) {
        const value = tokens[key as keyof ThemeTokens];
        if (value) {
            root.style.setProperty(cssVar, value);
        }
    }
}

function brandPaletteToTokens(palette: BrandColorPalette): ThemeTokens {
    return {
        primary: palette.primary,
        primaryForeground: palette.primaryForeground,
        secondary: palette.secondary,
        secondaryForeground: palette.secondaryForeground,
        accent: palette.accent,
        accentForeground: palette.accentForeground,
        background: palette.background,
        foreground: palette.foreground,
        muted: palette.muted,
        mutedForeground: palette.mutedForeground,
        card: palette.card,
        cardForeground: palette.cardForeground,
        border: palette.border,
        ring: palette.ring,
    };
}

function clearCustomTokensFromDOM() {
    const root = document.documentElement;
    const vars = [
        "--primary", "--primary-foreground", "--secondary", "--secondary-foreground",
        "--accent", "--accent-foreground", "--background", "--foreground",
        "--muted", "--muted-foreground", "--card", "--card-foreground",
        "--border", "--ring", "--radius",
    ];
    vars.forEach((v) => root.style.removeProperty(v));
}

function mergeTokens(...layers: (ThemeTokens | null | undefined)[]): ThemeTokens {
    const merged: ThemeTokens = {};
    for (const layer of layers) {
        if (!layer) continue;
        for (const [key, value] of Object.entries(layer)) {
            if (value) {
                (merged as Record<string, string>)[key] = value;
            }
        }
    }
    return merged;
}

// ─── Theme Provider Component ───

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const colorMode = useThemeStore((s) => s.colorMode);
    const brandId = useThemeStore((s) => s.brandId);
    const orgTokens = useThemeStore((s) => s.orgTokens);
    const projectTokens = useThemeStore((s) => s.projectTokens);
    const userTokens = useThemeStore((s) => s.userTokens);
    const setResolvedMode = useThemeStore((s) => s.setResolvedMode);

    // Apply theme to DOM — runs only when input values change (not resolvedMode)
    useEffect(() => {
        const html = document.documentElement;

        // Enable smooth theme transition (except on first paint)
        html.classList.add("theme-transition");
        const transitionTimer = setTimeout(() => html.classList.remove("theme-transition"), 300);

        // Resolve color mode
        let resolved: "light" | "dark" = "dark";
        if (colorMode === "system") {
            resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
            resolved = colorMode;
        }
        setResolvedMode(resolved);

        // Apply color mode class
        html.classList.remove("light", "dark");
        html.classList.add(resolved);

        // Persist resolved mode as cookie for potential SSR usage
        document.cookie = `pb-theme-resolved=${resolved};path=/;max-age=31536000;SameSite=Lax`;

        // Apply brand attribute
        if (brandId !== "playbook") {
            html.setAttribute("data-brand", brandId);
        } else {
            html.removeAttribute("data-brand");
        }

        // Apply cascading token overrides: brand → org → project → user
        clearCustomTokensFromDOM();

        // Inject brand palette as base layer
        let brandTokens: ThemeTokens | null = null;
        try {
            const brand = getBrand(brandId as BrandId);
            if (brand && brandId !== "playbook") {
                brandTokens = brandPaletteToTokens(brand.colors[resolved]);
            }
        } catch {
            // Brand not found — use platform defaults
        }

        const merged = mergeTokens(brandTokens, orgTokens, projectTokens, userTokens);
        if (Object.keys(merged).length > 0) {
            applyTokensToDOM(merged);
        }

        return () => clearTimeout(transitionTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colorMode, brandId, orgTokens, projectTokens, userTokens]);

    // Listen for system color scheme changes
    useEffect(() => {
        if (colorMode !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const resolved = mq.matches ? "dark" : "light";
            setResolvedMode(resolved);
            const html = document.documentElement;
            html.classList.add("theme-transition");
            html.classList.remove("light", "dark");
            html.classList.add(resolved);
            document.cookie = `pb-theme-resolved=${resolved};path=/;max-age=31536000;SameSite=Lax`;

            // Re-apply brand tokens for the new resolved mode
            clearCustomTokensFromDOM();
            let brandTokens: ThemeTokens | null = null;
            try {
                const store = useThemeStore.getState();
                const brand = getBrand(store.brandId as BrandId);
                if (brand && store.brandId !== "playbook") {
                    brandTokens = brandPaletteToTokens(brand.colors[resolved]);
                }
            } catch { /* use defaults */ }
            const merged = mergeTokens(brandTokens, useThemeStore.getState().orgTokens, useThemeStore.getState().projectTokens, useThemeStore.getState().userTokens);
            if (Object.keys(merged).length > 0) {
                applyTokensToDOM(merged);
            }

            setTimeout(() => html.classList.remove("theme-transition"), 300);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colorMode]);

    // Cross-tab synchronization via storage event
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === "pb-theme" && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    const newMode = parsed.state?.colorMode;
                    if (newMode && newMode !== useThemeStore.getState().colorMode) {
                        useThemeStore.getState().setColorMode(newMode);
                    }
                } catch { /* ignore parse errors */ }
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const resolvedMode = useThemeStore((s) => s.resolvedMode);
    const setColorModeStore = useThemeStore((s) => s.setColorMode);
    const setBrandIdStore = useThemeStore((s) => s.setBrandId);
    const setOrgTokensStore = useThemeStore((s) => s.setOrgTokens);
    const setProjectTokensStore = useThemeStore((s) => s.setProjectTokens);
    const setUserTokensStore = useThemeStore((s) => s.setUserTokens);

    const contextValue = useMemo<ThemeContextValue>(
        () => ({
            colorMode,
            resolvedMode,
            brandId,
            setColorMode: setColorModeStore,
            setBrandId: setBrandIdStore,
            setOrgTokens: setOrgTokensStore,
            setProjectTokens: setProjectTokensStore,
            setUserTokens: setUserTokensStore,
        }),
        [
            colorMode,
            resolvedMode,
            brandId,
            setColorModeStore,
            setBrandIdStore,
            setOrgTokensStore,
            setProjectTokensStore,
            setUserTokensStore,
        ]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}
