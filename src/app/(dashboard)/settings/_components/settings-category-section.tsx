"use client";

import React from "react";
import type { ResolvedSetting, SettingCategory } from "@/types/settings";
import { SettingRow } from "@/components/settings/setting-row";

/**
 * Renders all settings matching a given category, sorted by display_order.
 * Shared across all settings tabs.
 */
export function SettingsCategorySection({
    category,
    settings,
    onSave,
}: {
    category: SettingCategory;
    settings: Map<string, ResolvedSetting>;
    onSave: (category: SettingCategory, key: string, value: unknown) => Promise<void>;
}) {
    const filtered = Array.from(settings.values()).filter(
        (s) => s.definition.category === category
    );
    if (filtered.length === 0) return null;

    return (
        <div className="space-y-1">
            {filtered
                .sort((a, b) => a.definition.display_order - b.definition.display_order)
                .map((setting) => (
                    <SettingRow key={setting.definition.key} setting={setting} onSave={onSave} />
                ))}
        </div>
    );
}
