"use client";

import React from "react";
import { capitalize, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
                                <Button
                                    key={mode.id}
                                    variant={colorMode === mode.id ? "outline" : "ghost"}
                                    onClick={() => {
                                        setColorMode(mode.id);
                                        handleSaveSetting("preferences", "theme", mode.id);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-2 h-auto p-4 rounded-xl border-2",
                                        colorMode === mode.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                    aria-pressed={colorMode === mode.id}
                                >
                                    <mode.icon
                                        className={cn(
                                            "h-6 w-6",
                                            colorMode === mode.id
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                        )}
                                    />
                                    <span className="text-sm font-medium">{mode.label}</span>
                                </Button>
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
                                <Button
                                    key={key}
                                    variant="ghost"
                                    onClick={() => {
                                        setAccentColor(key);
                                        handleSaveSetting("preferences", "accent_color", key);
                                    }}
                                    className={cn(
                                        "h-8 w-8 rounded-full p-0 ring-2 ring-offset-2 ring-offset-background",
                                        accentColor === key
                                            ? "ring-foreground scale-110"
                                            : "ring-transparent hover:ring-muted-foreground"
                                    )}
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
                                <Button
                                    key={densityKey}
                                    variant={
                                        currentDensity === densityKey ? "default" : "secondary"
                                    }
                                    onClick={() => {
                                        setDensity(densityKey);
                                        handleSaveSetting(
                                            "preferences",
                                            "layout_density",
                                            densityKey
                                        );
                                    }}
                                    aria-pressed={currentDensity === densityKey}
                                >
                                    {capitalize(densityKey)}
                                </Button>
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
                                <Button
                                    key={key}
                                    variant="ghost"
                                    onClick={() => {
                                        setBorderRadius(key);
                                        handleSaveSetting("preferences", "border_radius", key);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 px-3 py-2.5 h-auto border-2",
                                        currentRadius === key
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                    style={{
                                        borderRadius:
                                            preset.value === "9999px" ? "1rem" : preset.value,
                                    }}
                                    aria-pressed={currentRadius === key}
                                    aria-label={`Border radius: ${preset.label}`}
                                >
                                    <div
                                        className={cn(
                                            "border-2 border-foreground/30 bg-muted",
                                            key === "pill" ? "h-5 w-12" : "h-6 w-10"
                                        )}
                                        style={{
                                            borderRadius: key === "pill" ? "9999px" : preset.value,
                                        }}
                                    />
                                    <span className="text-xs font-medium">{preset.label}</span>
                                </Button>
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
                                <Button
                                    key={key}
                                    variant="ghost"
                                    onClick={() => {
                                        setFontFamily(key);
                                        handleSaveSetting("preferences", "font_family", key);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 h-auto rounded-lg border-2",
                                        currentFont === key
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
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
                                </Button>
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
                                <Button
                                    key={key}
                                    variant={currentFontSize === key ? "default" : "secondary"}
                                    onClick={() => {
                                        setFontSizeScale(key);
                                        handleSaveSetting("preferences", "font_size_scale", key);
                                    }}
                                    aria-pressed={currentFontSize === key}
                                >
                                    {preset.label}
                                </Button>
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
                                <Button
                                    key={key}
                                    variant="ghost"
                                    onClick={() => {
                                        setShadowIntensity(key);
                                        handleSaveSetting("preferences", "shadow_intensity", key);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 px-4 py-3 h-auto rounded-lg border-2",
                                        currentShadow === key
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
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
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3">Glass / Blur Effects</p>
                        <div className="flex gap-2">
                            {(["on", "off"] as GlassEffect[]).map((key) => (
                                <Button
                                    key={key}
                                    variant={currentGlass === key ? "default" : "secondary"}
                                    onClick={() => {
                                        setGlassEffect(key);
                                        handleSaveSetting("preferences", "glass_effect", key);
                                    }}
                                    aria-pressed={currentGlass === key}
                                >
                                    {key === "on" ? "Enabled" : "Disabled"}
                                </Button>
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
                                <Button
                                    key={key}
                                    variant={currentAnimation === key ? "default" : "secondary"}
                                    onClick={() => {
                                        setAnimationSpeed(key);
                                        handleSaveSetting("preferences", "animation_speed", key);
                                    }}
                                    aria-pressed={currentAnimation === key}
                                >
                                    {preset.label}
                                </Button>
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
