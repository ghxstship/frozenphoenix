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
import type { BrandColorPalette, BrandId } from "@/config/brands";

// ─── Theme Token Override Shape ───

export interface ThemeTokens {
    primary?: string | undefined;
    primaryForeground?: string | undefined;
    secondary?: string | undefined;
    secondaryForeground?: string | undefined;
    accent?: string | undefined;
    accentForeground?: string | undefined;
    background?: string | undefined;
    foreground?: string | undefined;
    muted?: string | undefined;
    mutedForeground?: string | undefined;
    card?: string | undefined;
    cardForeground?: string | undefined;
    border?: string | undefined;
    ring?: string | undefined;
    radius?: string | undefined;
}

export type ColorMode = "light" | "dark" | "system";
export type AccentColor = "blue" | "violet" | "rose" | "orange" | "emerald";
export type LayoutDensity = "compact" | "default" | "comfortable";

export const ACCENT_PRESETS: Record<
    AccentColor,
    { hsl: string; hslForeground: string; label: string }
> = {
    blue: { hsl: "220 70% 50%", hslForeground: "0 0% 100%", label: "Blue" },
    violet: { hsl: "262 83% 58%", hslForeground: "0 0% 100%", label: "Violet" },
    rose: { hsl: "347 77% 50%", hslForeground: "0 0% 100%", label: "Rose" },
    orange: { hsl: "31 97% 50%", hslForeground: "0 0% 100%", label: "Orange" },
    emerald: { hsl: "152 69% 40%", hslForeground: "0 0% 100%", label: "Emerald" },
};

export const DENSITY_SCALE: Record<LayoutDensity, { spacingFactor: number; fontSize: string }> = {
    compact: { spacingFactor: 0.75, fontSize: "13px" },
    default: { spacingFactor: 1, fontSize: "14px" },
    comfortable: { spacingFactor: 1.25, fontSize: "15px" },
};

// ─── Border Radius ───
export type BorderRadiusScale = "none" | "sharp" | "default" | "rounded" | "pill";
export const BORDER_RADIUS_PRESETS: Record<
    BorderRadiusScale,
    { value: string; label: string; preview: string }
> = {
    none: { value: "0", label: "None", preview: "0" },
    sharp: { value: "0.25rem", label: "Sharp", preview: "4px" },
    default: { value: "0.625rem", label: "Default", preview: "10px" },
    rounded: { value: "1rem", label: "Rounded", preview: "16px" },
    pill: { value: "9999px", label: "Pill", preview: "full" },
};

// ─── Font Family ───
export type FontFamilyChoice = "system" | "geometric" | "humanist" | "mono";
export const FONT_FAMILY_PRESETS: Record<
    FontFamilyChoice,
    { stack: string; label: string; sample: string }
> = {
    system: {
        stack: "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif",
        label: "System (Geist)",
        sample: "Aa",
    },
    geometric: {
        stack: "'Inter', 'SF Pro Display', ui-sans-serif, system-ui, sans-serif",
        label: "Geometric (Inter)",
        sample: "Aa",
    },
    humanist: {
        stack: "'Source Sans 3', 'Segoe UI', 'Helvetica Neue', sans-serif",
        label: "Humanist (Source)",
        sample: "Aa",
    },
    mono: {
        stack: "var(--font-geist-mono), 'JetBrains Mono', ui-monospace, monospace",
        label: "Monospace",
        sample: "Aa",
    },
};

// ─── Font Size Scale ───
export type FontSizeScale = "small" | "default" | "large";
export const FONT_SIZE_PRESETS: Record<FontSizeScale, { factor: number; label: string }> = {
    small: { factor: 0.9, label: "Small" },
    default: { factor: 1, label: "Default" },
    large: { factor: 1.12, label: "Large" },
};

// ─── Shadow Intensity ───
export type ShadowIntensity = "none" | "subtle" | "default" | "dramatic";
export const SHADOW_PRESETS: Record<ShadowIntensity, { label: string; multiplier: number }> = {
    none: { label: "None", multiplier: 0 },
    subtle: { label: "Subtle", multiplier: 0.5 },
    default: { label: "Default", multiplier: 1 },
    dramatic: { label: "Dramatic", multiplier: 2 },
};

// ─── Glass/Blur Effects ───
export type GlassEffect = "on" | "off";

// ─── Animation Speed ───
export type AnimationSpeed = "off" | "reduced" | "default" | "playful";
export const ANIMATION_PRESETS: Record<AnimationSpeed, { label: string; durationFactor: number }> =
    {
        off: { label: "Off", durationFactor: 0 },
        reduced: { label: "Reduced", durationFactor: 2 },
        default: { label: "Default", durationFactor: 1 },
        playful: { label: "Playful", durationFactor: 0.7 },
    };

export interface ThemeConfig {
    colorMode: ColorMode;
    brandId?: string | undefined;
    tokens?: ThemeTokens | undefined;
}

// ─── Theme Store (Zustand + Persist) ───

interface ThemeStore {
    colorMode: ColorMode;
    resolvedMode: "light" | "dark";
    accentColor: AccentColor;
    density: LayoutDensity;
    borderRadius: BorderRadiusScale;
    fontFamily: FontFamilyChoice;
    fontSizeScale: FontSizeScale;
    shadowIntensity: ShadowIntensity;
    glassEffect: GlassEffect;
    animationSpeed: AnimationSpeed;
    brandId: string;
    orgTokens: ThemeTokens | null;
    projectTokens: ThemeTokens | null;
    userTokens: ThemeTokens | null;
    setColorMode: (mode: ColorMode) => void;
    setAccentColor: (accent: AccentColor) => void;
    setDensity: (density: LayoutDensity) => void;
    setBorderRadius: (radius: BorderRadiusScale) => void;
    setFontFamily: (font: FontFamilyChoice) => void;
    setFontSizeScale: (scale: FontSizeScale) => void;
    setShadowIntensity: (shadow: ShadowIntensity) => void;
    setGlassEffect: (glass: GlassEffect) => void;
    setAnimationSpeed: (speed: AnimationSpeed) => void;
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
            accentColor: "blue",
            density: "default",
            borderRadius: "default",
            fontFamily: "system",
            fontSizeScale: "default",
            shadowIntensity: "default",
            glassEffect: "on",
            animationSpeed: "default",
            brandId: "atlvs",
            orgTokens: null,
            projectTokens: null,
            userTokens: null,
            setColorMode: (colorMode) => set({ colorMode }),
            setAccentColor: (accentColor) => set({ accentColor }),
            setDensity: (density) => set({ density }),
            setBorderRadius: (borderRadius) => set({ borderRadius }),
            setFontFamily: (fontFamily) => set({ fontFamily }),
            setFontSizeScale: (fontSizeScale) => set({ fontSizeScale }),
            setShadowIntensity: (shadowIntensity) => set({ shadowIntensity }),
            setGlassEffect: (glassEffect) => set({ glassEffect }),
            setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
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
                accentColor: state.accentColor,
                density: state.density,
                borderRadius: state.borderRadius,
                fontFamily: state.fontFamily,
                fontSizeScale: state.fontSizeScale,
                shadowIntensity: state.shadowIntensity,
                glassEffect: state.glassEffect,
                animationSpeed: state.animationSpeed,
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
    accentColor: AccentColor;
    density: LayoutDensity;
    borderRadius: BorderRadiusScale;
    fontFamily: FontFamilyChoice;
    fontSizeScale: FontSizeScale;
    shadowIntensity: ShadowIntensity;
    glassEffect: GlassEffect;
    animationSpeed: AnimationSpeed;
    brandId: string;
    setColorMode: (mode: ColorMode) => void;
    setAccentColor: (accent: AccentColor) => void;
    setDensity: (density: LayoutDensity) => void;
    setBorderRadius: (radius: BorderRadiusScale) => void;
    setFontFamily: (font: FontFamilyChoice) => void;
    setFontSizeScale: (scale: FontSizeScale) => void;
    setShadowIntensity: (shadow: ShadowIntensity) => void;
    setGlassEffect: (glass: GlassEffect) => void;
    setAnimationSpeed: (speed: AnimationSpeed) => void;
    setBrandId: (id: string) => void;
    setOrgTokens: (tokens: ThemeTokens | null) => void;
    setProjectTokens: (tokens: ThemeTokens | null) => void;
    setUserTokens: (tokens: ThemeTokens | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    colorMode: "dark",
    resolvedMode: "dark",
    accentColor: "blue",
    density: "default",
    borderRadius: "default",
    fontFamily: "system",
    fontSizeScale: "default",
    shadowIntensity: "default",
    glassEffect: "on",
    animationSpeed: "default",
    brandId: "atlvs",
    setColorMode: () => {},
    setAccentColor: () => {},
    setDensity: () => {},
    setBorderRadius: () => {},
    setFontFamily: () => {},
    setFontSizeScale: () => {},
    setShadowIntensity: () => {},
    setGlassEffect: () => {},
    setAnimationSpeed: () => {},
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
        "--primary",
        "--primary-foreground",
        "--secondary",
        "--secondary-foreground",
        "--accent",
        "--accent-foreground",
        "--background",
        "--foreground",
        "--muted",
        "--muted-foreground",
        "--card",
        "--card-foreground",
        "--border",
        "--ring",
        "--radius",
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

// ─── View Transition Helper ───
// Uses the View Transition API for a smooth crossfade screenshot overlay
// instead of transitioning every CSS property on every DOM element.
// Falls back to instant swap when API unavailable or motion is reduced.

let isFirstPaint = true;

function applyThemeWithTransition(applyFn: () => void) {
    // Skip transition on initial hydration
    if (isFirstPaint) {
        isFirstPaint = false;
        applyFn();
        return;
    }

    // Respect reduced motion at OS level and app level
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animationOff = document.documentElement.getAttribute("data-animation") === "off";
    if (reducedMotion || animationOff) {
        applyFn();
        return;
    }

    // View Transition API: composites a screenshot crossfade — single texture swap,
    // no per-element style recalculation, no layout thrashing
    if (document.startViewTransition) {
        const transition = document.startViewTransition(applyFn);
        transition.finished.catch(() => {
            // Swallow abort errors (rapid toggles)
        });
    } else {
        // Fallback: add targeted transition class on color-bearing elements only
        const html = document.documentElement;
        html.classList.add("theme-transition");
        applyFn();
        // Remove after transition settles
        const timer = setTimeout(() => html.classList.remove("theme-transition"), 350);
        // Allow GC if component unmounts mid-transition
        return () => clearTimeout(timer);
    }
}

// ─── Theme Provider Component ───

function accentTint(hsl: string, resolvedMode: "light" | "dark"): string {
    // Extract H S L from "220 70% 50%" format
    const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) return hsl;
    const [, h, s] = match;
    // Light mode: very light tint; Dark mode: low-lightness tint
    return resolvedMode === "light"
        ? `${h} ${Math.min(Number(s), 30)}% 95%`
        : `${h} ${Math.min(Number(s), 40)}% 16%`;
}

function applyAccentToDOM(accent: AccentColor, resolvedMode: "light" | "dark") {
    const root = document.documentElement;
    const preset = ACCENT_PRESETS[accent];
    if (accent === "blue") {
        // Blue is the platform default — remove overrides so CSS :root / .dark values apply
        root.style.removeProperty("--primary");
        root.style.removeProperty("--primary-foreground");
        root.style.removeProperty("--ring");
        root.style.removeProperty("--sidebar-primary");
        root.style.removeProperty("--sidebar-ring");
        root.style.removeProperty("--accent");
        root.style.removeProperty("--accent-foreground");
    } else {
        // Dark mode: lighten the accent slightly for better contrast
        const hsl =
            resolvedMode === "dark"
                ? preset.hsl.replace(/(\d+)%$/, (_, p) => `${Math.min(Number(p) + 10, 70)}%`)
                : preset.hsl;
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--primary-foreground", preset.hslForeground);
        root.style.setProperty("--ring", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
        root.style.setProperty("--sidebar-ring", hsl);

        // Accent token: subtle tint of the chosen color for hover/cursor highlights
        root.style.setProperty("--accent", accentTint(preset.hsl, resolvedMode));
        root.style.setProperty(
            "--accent-foreground",
            resolvedMode === "dark" ? "220 14% 96%" : "220 30% 10%"
        );
    }
}

function applyDensityToDOM(density: LayoutDensity) {
    const root = document.documentElement;
    const scale = DENSITY_SCALE[density];
    root.style.setProperty("--density-spacing", String(scale.spacingFactor));
    root.style.setProperty("--density-font-size", scale.fontSize);
    root.setAttribute("data-density", density);
}

function applyBorderRadiusToDOM(radius: BorderRadiusScale) {
    const root = document.documentElement;
    const preset = BORDER_RADIUS_PRESETS[radius];
    root.style.setProperty("--radius", preset.value);
    root.setAttribute("data-radius", radius);
}

function applyFontFamilyToDOM(font: FontFamilyChoice) {
    const root = document.documentElement;
    const preset = FONT_FAMILY_PRESETS[font];
    if (font === "system") {
        root.style.removeProperty("--font-sans");
    } else {
        root.style.setProperty("--font-sans", preset.stack);
    }
    root.setAttribute("data-font", font);
}

function applyFontSizeScaleToDOM(scale: FontSizeScale) {
    const root = document.documentElement;
    root.setAttribute("data-font-size", scale);
}

function applyShadowIntensityToDOM(shadow: ShadowIntensity) {
    const root = document.documentElement;
    root.setAttribute("data-shadow", shadow);
}

function applyGlassEffectToDOM(glass: GlassEffect) {
    const root = document.documentElement;
    root.setAttribute("data-glass", glass);
}

function applyAnimationSpeedToDOM(speed: AnimationSpeed) {
    const root = document.documentElement;
    root.setAttribute("data-animation", speed);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const colorMode = useThemeStore((s) => s.colorMode);
    const accentColor = useThemeStore((s) => s.accentColor);
    const density = useThemeStore((s) => s.density);
    const borderRadius = useThemeStore((s) => s.borderRadius);
    const fontFamily = useThemeStore((s) => s.fontFamily);
    const fontSizeScale = useThemeStore((s) => s.fontSizeScale);
    const shadowIntensity = useThemeStore((s) => s.shadowIntensity);
    const glassEffect = useThemeStore((s) => s.glassEffect);
    const animationSpeed = useThemeStore((s) => s.animationSpeed);
    const brandId = useThemeStore((s) => s.brandId);
    const orgTokens = useThemeStore((s) => s.orgTokens);
    const projectTokens = useThemeStore((s) => s.projectTokens);
    const userTokens = useThemeStore((s) => s.userTokens);
    const setResolvedMode = useThemeStore((s) => s.setResolvedMode);

    // Apply theme to DOM — runs only when input values change (not resolvedMode)
    useEffect(() => {
        const applyAll = () => {
            const html = document.documentElement;

            // Resolve color mode
            let resolved: "light" | "dark" = "dark";
            if (colorMode === "system") {
                resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
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
            if (brandId !== "atlvs") {
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

            // Apply accent color (after token merge so accent overrides brand primary)
            applyAccentToDOM(accentColor, resolved);

            // Apply user-level appearance customizations
            applyDensityToDOM(density);
            applyBorderRadiusToDOM(borderRadius);
            applyFontFamilyToDOM(fontFamily);
            applyFontSizeScaleToDOM(fontSizeScale);
            applyShadowIntensityToDOM(shadowIntensity);
            applyGlassEffectToDOM(glassEffect);
            applyAnimationSpeedToDOM(animationSpeed);
        };

        // Wrap DOM mutations in View Transition API for smooth crossfade
        applyThemeWithTransition(applyAll);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- setResolvedMode is a stable Zustand setter; mergeTokens/applyTokensToDOM are stable module-level functions
    }, [
        colorMode,
        accentColor,
        density,
        borderRadius,
        fontFamily,
        fontSizeScale,
        shadowIntensity,
        glassEffect,
        animationSpeed,
        brandId,
        orgTokens,
        projectTokens,
        userTokens,
    ]);

    // Listen for system color scheme changes
    useEffect(() => {
        if (colorMode !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            applyThemeWithTransition(() => {
                const resolved = mq.matches ? "dark" : "light";
                setResolvedMode(resolved);
                const html = document.documentElement;
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
                } catch {
                    /* use defaults */
                }
                const merged = mergeTokens(
                    brandTokens,
                    useThemeStore.getState().orgTokens,
                    useThemeStore.getState().projectTokens,
                    useThemeStore.getState().userTokens
                );
                if (Object.keys(merged).length > 0) {
                    applyTokensToDOM(merged);
                }
            });
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [colorMode]); // eslint-disable-line react-hooks/exhaustive-deps -- handler reads Zustand store directly; only colorMode determines if this effect is active

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
                } catch {
                    /* ignore parse errors */
                }
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const resolvedMode = useThemeStore((s) => s.resolvedMode);
    const setColorModeStore = useThemeStore((s) => s.setColorMode);
    const setAccentColorStore = useThemeStore((s) => s.setAccentColor);
    const setDensityStore = useThemeStore((s) => s.setDensity);
    const setBorderRadiusStore = useThemeStore((s) => s.setBorderRadius);
    const setFontFamilyStore = useThemeStore((s) => s.setFontFamily);
    const setFontSizeScaleStore = useThemeStore((s) => s.setFontSizeScale);
    const setShadowIntensityStore = useThemeStore((s) => s.setShadowIntensity);
    const setGlassEffectStore = useThemeStore((s) => s.setGlassEffect);
    const setAnimationSpeedStore = useThemeStore((s) => s.setAnimationSpeed);
    const setBrandIdStore = useThemeStore((s) => s.setBrandId);
    const setOrgTokensStore = useThemeStore((s) => s.setOrgTokens);
    const setProjectTokensStore = useThemeStore((s) => s.setProjectTokens);
    const setUserTokensStore = useThemeStore((s) => s.setUserTokens);

    const contextValue = useMemo<ThemeContextValue>(
        () => ({
            colorMode,
            resolvedMode,
            accentColor,
            density,
            borderRadius,
            fontFamily,
            fontSizeScale,
            shadowIntensity,
            glassEffect,
            animationSpeed,
            brandId,
            setColorMode: setColorModeStore,
            setAccentColor: setAccentColorStore,
            setDensity: setDensityStore,
            setBorderRadius: setBorderRadiusStore,
            setFontFamily: setFontFamilyStore,
            setFontSizeScale: setFontSizeScaleStore,
            setShadowIntensity: setShadowIntensityStore,
            setGlassEffect: setGlassEffectStore,
            setAnimationSpeed: setAnimationSpeedStore,
            setBrandId: setBrandIdStore,
            setOrgTokens: setOrgTokensStore,
            setProjectTokens: setProjectTokensStore,
            setUserTokens: setUserTokensStore,
        }),
        [
            colorMode,
            resolvedMode,
            accentColor,
            density,
            borderRadius,
            fontFamily,
            fontSizeScale,
            shadowIntensity,
            glassEffect,
            animationSpeed,
            brandId,
            setColorModeStore,
            setAccentColorStore,
            setDensityStore,
            setBorderRadiusStore,
            setFontFamilyStore,
            setFontSizeScaleStore,
            setShadowIntensityStore,
            setGlassEffectStore,
            setAnimationSpeedStore,
            setBrandIdStore,
            setOrgTokensStore,
            setProjectTokensStore,
            setUserTokensStore,
        ]
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
