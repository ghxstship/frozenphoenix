"use client";

import React from "react";
import { capitalize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/lib/settings/settings-provider";
import { PermissionGate } from "@/components/app/permission-guard";
import {
    ACCENT_PRESETS,
    ANIMATION_PRESETS,
    BORDER_RADIUS_PRESETS,
    DENSITY_SCALE,
    FONT_FAMILY_PRESETS,
    FONT_SIZE_PRESETS,
    SHADOW_PRESETS,
    useTheme,
} from "@/components/app/theme-provider";
import type {
    AccentColor,
    AnimationSpeed,
    BorderRadiusScale,
    ColorMode,
    FontFamilyChoice,
    FontSizeScale,
    GlassEffect,
    ShadowIntensity,
} from "@/components/app/theme-provider";
import type { SettingCategory } from "@/types/settings";
import { Monitor, Moon, Sun } from "lucide-react";
import { SettingsCategorySection } from "../_components/settings-category-section";

interface AppearanceTabProps {
    handleSaveSetting: (category: SettingCategory, key: string, value: unknown) => Promise<void>;
}

export function AppearanceTab({ handleSaveSetting }: AppearanceTabProps) {
    const {
        colorMode,
        setColorMode,
        accentColor,
        setAccentColor,
        density: currentDensity,
        setDensity,
        borderRadius: currentRadius,
        setBorderRadius,
        fontFamily: currentFont,
        setFontFamily,
        fontSizeScale: currentFontSize,
        setFontSizeScale,
        shadowIntensity: currentShadow,
        setShadowIntensity,
        glassEffect: currentGlass,
        setGlassEffect,
        animationSpeed: currentAnimation,
        setAnimationSpeed,
    } = useTheme();
    const { settings, loading: settingsLoading } = useSettings();

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Theme Preferences</CardTitle>
                </CardHeader>
                <CardContent className="density-gap-page">
                    <div>
                        <p className="text-sm font-medium mb-3">Color Mode</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    id: "light" as ColorMode,
                                    label: "Light",
                                    icon: Sun,
                                },
                                {
                                    id: "dark" as ColorMode,
                                    label: "Dark",
                                    icon: Moon,
                                },
                                {
                                    id: "system" as ColorMode,
                                    label: "System",
                                    icon: Monitor,
                                },
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setColorMode(mode.id);
                                        handleSaveSetting("preferences", "theme", mode.id);
                                    }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                                        colorMode === mode.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    <mode.icon
                                        className={`h-6 w-6 ${colorMode === mode.id ? "text-primary" : "text-muted-foreground"}`}
                                    />
                                    <span className="text-sm font-medium">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Accent Color</p>
                        <div className="flex gap-3">
                            {(
                                Object.entries(ACCENT_PRESETS) as [
                                    AccentColor,
                                    (typeof ACCENT_PRESETS)[AccentColor],
                                ][]
                            ).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setAccentColor(key);
                                        handleSaveSetting("preferences", "accent_color", key);
                                    }}
                                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                                        accentColor === key
                                            ? "ring-foreground scale-110"
                                            : "ring-transparent hover:ring-muted-foreground"
                                    }`}
                                    style={{
                                        backgroundColor: `hsl(${preset.hsl})`,
                                    }}
                                    title={preset.label}
                                    aria-label={`Accent color: ${preset.label}`}
                                    aria-pressed={accentColor === key}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Density</p>
                        <div className="flex gap-2">
                            {(Object.keys(DENSITY_SCALE) as LayoutDensity[]).map((densityKey) => (
                                <button
                                    key={densityKey}
                                    onClick={() => {
                                        setDensity(densityKey);
                                        handleSaveSetting(
                                            "preferences",
                                            "layout_density",
                                            densityKey
                                        );
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentDensity === densityKey
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80"
                                    }`}
                                    aria-pressed={currentDensity === densityKey}
                                >
                                    {capitalize(densityKey)}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Shape & Typography</CardTitle>
                </CardHeader>
                <CardContent className="density-gap-page">
                    <div>
                        <p className="text-sm font-medium mb-3">Border Radius</p>
                        <div className="flex gap-2">
                            {(
                                Object.entries(BORDER_RADIUS_PRESETS) as [
                                    BorderRadiusScale,
                                    (typeof BORDER_RADIUS_PRESETS)[BorderRadiusScale],
                                ][]
                            ).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setBorderRadius(key);
                                        handleSaveSetting("preferences", "border_radius", key);
                                    }}
                                    className={`flex flex-col items-center gap-1.5 px-3 py-2.5 border-2 transition-colors ${
                                        currentRadius === key
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                    style={{
                                        borderRadius:
                                            preset.value === "9999px" ? "1rem" : preset.value,
                                    }}
                                    aria-pressed={currentRadius === key}
                                    aria-label={`Border radius: ${preset.label}`}
                                >
                                    <div
                                        className={`border-2 border-foreground/30 bg-muted ${
                                            key === "pill" ? "h-5 w-12" : "h-6 w-10"
                                        }`}
                                        style={{
                                            borderRadius: key === "pill" ? "9999px" : preset.value,
                                        }}
                                    />
                                    <span className="text-xs font-medium">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Font Family</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(
                                Object.entries(FONT_FAMILY_PRESETS) as [
                                    FontFamilyChoice,
                                    (typeof FONT_FAMILY_PRESETS)[FontFamilyChoice],
                                ][]
                            ).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setFontFamily(key);
                                        handleSaveSetting("preferences", "font_family", key);
                                    }}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
                                        currentFont === key
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                    aria-pressed={currentFont === key}
                                    aria-label={`Font: ${preset.label}`}
                                >
                                    <span
                                        className="text-2xl font-semibold leading-none"
                                        style={{ fontFamily: preset.stack }}
                                    >
                                        {preset.sample}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {preset.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Font Size</p>
                        <div className="flex gap-2">
                            {(
                                Object.entries(FONT_SIZE_PRESETS) as [
                                    FontSizeScale,
                                    (typeof FONT_SIZE_PRESETS)[FontSizeScale],
                                ][]
                            ).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setFontSizeScale(key);
                                        handleSaveSetting("preferences", "font_size_scale", key);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentFontSize === key
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80"
                                    }`}
                                    aria-pressed={currentFontSize === key}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Effects & Motion</CardTitle>
                </CardHeader>
                <CardContent className="density-gap-page">
                    <div>
                        <p className="text-sm font-medium mb-3">Shadow Intensity</p>
                        <div className="flex gap-2">
                            {(
                                Object.entries(SHADOW_PRESETS) as [
                                    ShadowIntensity,
                                    (typeof SHADOW_PRESETS)[ShadowIntensity],
                                ][]
                            ).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setShadowIntensity(key);
                                        handleSaveSetting("preferences", "shadow_intensity", key);
                                    }}
                                    className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border-2 transition-colors ${
                                        currentShadow === key
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                    aria-pressed={currentShadow === key}
                                    aria-label={`Shadow: ${preset.label}`}
                                >
                                    <div
                                        className="h-6 w-10 rounded bg-card border border-border"
                                        style={{
                                            boxShadow:
                                                key === "none"
                                                    ? "none"
                                                    : key === "subtle"
                                                      ? "0 2px 4px rgb(0 0 0 / 0.05)"
                                                      : key === "default"
                                                        ? "0 4px 8px rgb(0 0 0 / 0.1)"
                                                        : "0 8px 16px rgb(0 0 0 / 0.2)",
                                        }}
                                    />
                                    <span className="text-xs font-medium">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Glass / Blur Effects</p>
                        <div className="flex gap-2">
                            {(["on", "off"] as GlassEffect[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setGlassEffect(key);
                                        handleSaveSetting("preferences", "glass_effect", key);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentGlass === key
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80"
                                    }`}
                                    aria-pressed={currentGlass === key}
                                >
                                    {key === "on" ? "Enabled" : "Disabled"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Animation Speed</p>
                        <div className="flex gap-2">
                            {(
                                Object.entries(ANIMATION_PRESETS) as [
                                    AnimationSpeed,
                                    (typeof ANIMATION_PRESETS)[AnimationSpeed],
                                ][]
                            ).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setAnimationSpeed(key);
                                        handleSaveSetting("preferences", "animation_speed", key);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentAnimation === key
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80"
                                    }`}
                                    aria-pressed={currentAnimation === key}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branding settings (exec only) */}
            {!settingsLoading && (
                <PermissionGate resource="brand" action="write" silent>
                    <Card>
                        <CardHeader>
                            <CardTitle>Branding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SettingsCategorySection
                                category="branding"
                                settings={settings}
                                onSave={handleSaveSetting}
                            />
                        </CardContent>
                    </Card>
                </PermissionGate>
            )}
        </>
    );
}

// Re-export the LayoutDensity type needed by the component
import type { LayoutDensity } from "@/components/app/theme-provider";
