"use client";

/* ═══════════════════════════════════════════════════════════════
   PLAYBOOK — Settings & Feature Flag Provider
   Provides hierarchical settings + feature flags via React context
   Resolves inheritance chain: User > Team > Project > Org > Platform
   ═══════════════════════════════════════════════════════════════ */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { evaluateAllFlags } from "./feature-flags";
import type {
    SettingCategory,
    SettingDefinition,
    SettingValue,
    ResolvedSetting,
    FeatureFlag,
    FeatureFlagOverride,
    SettingsContextValue,
    SettingScope,
} from "@/types/settings";

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// ─── Scope hierarchy (most-specific first) ───
const SCOPE_PRIORITY: SettingScope[] = [
    "user",
    "team",
    "activation",
    "project",
    "department",
    "brand",
    "organization",
    "environment",
    "platform",
];

function buildScopeChain(userId: string | null, orgId: string | null): Array<{ scope_type: SettingScope; scope_id: string | null }> {
    const chain: Array<{ scope_type: SettingScope; scope_id: string | null }> = [];
    if (userId) chain.push({ scope_type: "user", scope_id: userId });
    if (orgId) chain.push({ scope_type: "organization", scope_id: orgId });
    chain.push({ scope_type: "platform", scope_id: null });
    return chain;
}

function resolveSettings(
    definitions: SettingDefinition[],
    settingValues: SettingValue[],
    scopeChain: Array<{ scope_type: SettingScope; scope_id: string | null }>,
    userRole: string | null
): Map<string, ResolvedSetting> {
    const resolved = new Map<string, ResolvedSetting>();

    for (const def of definitions) {
        const compositeKey = `${def.category}:${def.key}`;

        // Walk scope chain from most-specific to least-specific
        let foundValue: SettingValue | null = null;
        let lockedByScope: SettingScope | null = null;

        // First pass: find any locked value (highest scope wins lock)
        for (const scope of [...scopeChain].reverse()) {
            const locked = settingValues.find(
                (sv) =>
                    sv.definition_id === def.id &&
                    sv.scope_type === scope.scope_type &&
                    sv.scope_id === scope.scope_id &&
                    sv.is_locked
            );
            if (locked) {
                foundValue = locked;
                lockedByScope = scope.scope_type;
                break;
            }
        }

        // Second pass: find most-specific value if not locked
        if (!foundValue) {
            for (const scope of scopeChain) {
                const match = settingValues.find(
                    (sv) =>
                        sv.definition_id === def.id &&
                        sv.scope_type === scope.scope_type &&
                        (sv.scope_id === scope.scope_id || (sv.scope_id === null && scope.scope_id === null))
                );
                if (match) {
                    foundValue = match;
                    break;
                }
            }
        }

        const value = foundValue ? foundValue.value : def.default_value;
        const sourceScope = foundValue ? foundValue.scope_type : "platform";
        const sourceScopeId = foundValue ? foundValue.scope_id : null;
        const isInherited = !foundValue || foundValue.scope_type !== scopeChain[0]?.scope_type;
        const isLocked = lockedByScope !== null;

        // Determine edit capability
        const scopePriority = SCOPE_PRIORITY.indexOf(sourceScope);
        const userScopePriority = SCOPE_PRIORITY.indexOf("user");
        const canEdit = !isLocked && (
            userRole === "exec" ||
            (sourceScope === "user" && scopePriority >= userScopePriority)
        );

        resolved.set(compositeKey, {
            definition: def,
            value,
            source_scope: sourceScope,
            source_scope_id: sourceScopeId,
            is_inherited: isInherited,
            is_locked: isLocked,
            locked_by_scope: lockedByScope,
            can_edit: canEdit,
        });
    }

    return resolved;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { user, activeOrg } = useAuth();
    const [definitions, setDefinitions] = useState<SettingDefinition[]>([]);
    const [settingValues, setSettingValues] = useState<SettingValue[]>([]);
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [flagOverrides, setFlagOverrides] = useState<FeatureFlagOverride[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = useMemo(() => createClient(), []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromTable = useCallback((table: string) => (supabase as any)?.from(table), [supabase]);

    const userId = user?.id ?? null;
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = activeOrg?.role ?? null;

    const fetchSettings = useCallback(async () => {
        if (!supabase || !isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        try {
            // Fetch setting definitions
            const { data: defs } = await fromTable("setting_definitions")
                .select("*")
                .is("deprecated_at", null)
                .order("category")
                .order("display_order");

            if (defs) setDefinitions(defs as SettingDefinition[]);

            // Fetch setting values for the user's scope chain
            const scopeFilters: Array<{ type: string; id: string | null }> = [];
            if (userId) scopeFilters.push({ type: "user", id: userId });
            if (orgId) scopeFilters.push({ type: "organization", id: orgId });
            scopeFilters.push({ type: "platform", id: null });

            const { data: values } = await fromTable("settings")
                .select("*");

            if (values) setSettingValues(values as SettingValue[]);

            // Fetch feature flags
            const { data: flagData } = await fromTable("feature_flags")
                .select("*")
                .eq("is_active", true);

            if (flagData) setFlags(flagData as FeatureFlag[]);

            // Fetch flag overrides
            const { data: overrideData } = await fromTable("feature_flag_overrides")
                .select("*");

            if (overrideData) setFlagOverrides(overrideData as FeatureFlagOverride[]);
        } catch {
            // Settings fetch failed — fall back to defaults silently
        } finally {
            setLoading(false);
        }
    }, [fromTable, supabase, userId, orgId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Build scope chain
    const scopeChain = useMemo(
        () => buildScopeChain(userId, orgId),
        [userId, orgId]
    );

    // Resolve settings through inheritance
    const settings = useMemo(
        () => resolveSettings(definitions, settingValues, scopeChain, userRole),
        [definitions, settingValues, scopeChain, userRole]
    );

    // Evaluate feature flags
    const featureFlags = useMemo(
        () =>
            evaluateAllFlags(flags, flagOverrides, {
                userId: userId ?? undefined,
                orgId: orgId ?? undefined,
                role: userRole ?? undefined,
                environment: process.env.NODE_ENV,
            }),
        [flags, flagOverrides, userId, orgId, userRole]
    );

    const getSetting = useCallback(
        <T = unknown>(category: SettingCategory, key: string): T | undefined => {
            const resolved = settings.get(`${category}:${key}`);
            return resolved ? (resolved.value as T) : undefined;
        },
        [settings]
    );

    const getSettingMeta = useCallback(
        (category: SettingCategory, key: string): ResolvedSetting | undefined => {
            return settings.get(`${category}:${key}`);
        },
        [settings]
    );

    const canEditSetting = useCallback(
        (category: SettingCategory, key: string): boolean => {
            const resolved = settings.get(`${category}:${key}`);
            return resolved?.can_edit ?? false;
        },
        [settings]
    );

    const updateSetting = useCallback(
        async (category: SettingCategory, key: string, value: unknown): Promise<void> => {
            if (!supabase || !userId) return;

            const resolved = settings.get(`${category}:${key}`);
            if (!resolved || !resolved.can_edit) return;

            const scopeType: SettingScope =
                resolved.definition.min_scope === "user" ? "user" : "organization";
            const scopeId = scopeType === "user" ? userId : orgId;

            // Upsert setting value
            const { error } = await fromTable("settings").upsert(
                {
                    definition_id: resolved.definition.id,
                    scope_type: scopeType,
                    scope_id: scopeId,
                    value: JSON.stringify(value),
                    changed_by: userId,
                },
                { onConflict: "definition_id,scope_type,scope_id" }
            );

            if (!error) {
                // Refresh settings
                await fetchSettings();
            }
        },
        [fromTable, supabase, userId, orgId, settings, fetchSettings]
    );

    const getFlag = useCallback(
        (key: string): boolean => {
            return featureFlags.get(key) ?? false;
        },
        [featureFlags]
    );

    const refreshSettings = useCallback(async () => {
        setLoading(true);
        await fetchSettings();
    }, [fetchSettings]);

    const contextValue: SettingsContextValue = useMemo(
        () => ({
            settings,
            featureFlags,
            loading,
            getSetting,
            getSettingMeta,
            updateSetting,
            getFlag,
            canEditSetting,
            refreshSettings,
        }),
        [settings, featureFlags, loading, getSetting, getSettingMeta, updateSetting, getFlag, canEditSetting, refreshSettings]
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}

export function useSetting<T = unknown>(category: SettingCategory, key: string): T | undefined {
    const { getSetting } = useSettings();
    return getSetting<T>(category, key);
}

export function useSettingMeta(category: SettingCategory, key: string): ResolvedSetting | undefined {
    const { getSettingMeta } = useSettings();
    return getSettingMeta(category, key);
}

export function useFeatureFlag(key: string): boolean {
    const { getFlag } = useSettings();
    return getFlag(key);
}
