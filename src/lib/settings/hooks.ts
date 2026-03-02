"use client";

/* ═══════════════════════════════════════════════════════════════
   PLAYBOOK — Settings & Feature Flag React Query Hooks
   Supabase-backed CRUD for settings, feature flags, roles, brands
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
    AccessAuditLogEntry,
    FeatureFlag,
    FeatureFlagOverride,
    PermissionGrant,
    RoleDefinition,
    SettingChangeLogEntry,
    SettingDefinition,
    SettingValue,
} from "@/types/settings";

// ─── Setting Definitions ───

export function useSettingDefinitions(category?: string) {
    return useQuery({
        queryKey: ["setting_definitions", category],
        queryFn: async () => {
            let query = fromTable("setting_definitions")
                .select("*")
                .is("deprecated_at", null)
                .order("category")
                .order("display_order");
            if (category) {
                query = query.eq("category", category);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as SettingDefinition[];
        },
        enabled: isSupabaseConfigured,
    });
}

// ─── Settings (Scoped Values) ───

export function useSettingsForScope(scopeType: string, scopeId: string | null) {
    return useQuery({
        queryKey: ["settings", scopeType, scopeId],
        queryFn: async () => {
            let query = fromTable("settings")
                .select("*, setting_definitions(*)")
                .eq("scope_type", scopeType);
            if (scopeId) {
                query = query.eq("scope_id", scopeId);
            } else {
                query = query.is("scope_id", null);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as (SettingValue & { setting_definitions: SettingDefinition })[];
        },
        enabled: isSupabaseConfigured,
    });
}

export function useUpsertSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            definition_id: string;
            scope_type: string;
            scope_id: string | null;
            value: unknown;
            changed_by: string;
        }) => {
            const { data, error } = await fromTable("settings")
                .upsert(
                    {
                        definition_id: params.definition_id,
                        scope_type: params.scope_type,
                        scope_id: params.scope_id,
                        value: JSON.stringify(params.value),
                        changed_by: params.changed_by,
                    },
                    { onConflict: "definition_id,scope_type,scope_id" }
                )
                .select("*")
                .single();
            if (error) throw error;
            return data as SettingValue;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}

export function useLockSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            settingId: string;
            locked: boolean;
            lockedBy: string;
            reason?: string;
        }) => {
            const { data, error } = await fromTable("settings")
                .update({
                    is_locked: params.locked,
                    locked_by: params.locked ? params.lockedBy : null,
                    locked_at: params.locked ? new Date().toISOString() : null,
                    locked_reason: params.locked ? (params.reason ?? null) : null,
                })
                .eq("id", params.settingId)
                .select("*")
                .single();
            if (error) throw error;
            return data as SettingValue;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}

// ─── Settings Change Log ───

export function useSettingsChangeLog(settingId?: string) {
    return useQuery({
        queryKey: ["settings_change_log", settingId],
        queryFn: async () => {
            let query = fromTable("settings_change_log")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);
            if (settingId) {
                query = query.eq("setting_id", settingId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as SettingChangeLogEntry[];
        },
        enabled: isSupabaseConfigured,
    });
}

// ─── Feature Flags ───

export function useFeatureFlags() {
    return useQuery({
        queryKey: ["feature_flags"],
        queryFn: async () => {
            const { data, error } = await fromTable("feature_flags").select("*").order("key");
            if (error) throw error;
            return data as FeatureFlag[];
        },
        enabled: isSupabaseConfigured,
    });
}

export function useFeatureFlagOverrides(flagId?: string) {
    return useQuery({
        queryKey: ["feature_flag_overrides", flagId],
        queryFn: async () => {
            let query = fromTable("feature_flag_overrides")
                .select("*")
                .order("created_at", { ascending: false });
            if (flagId) {
                query = query.eq("flag_id", flagId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as FeatureFlagOverride[];
        },
        enabled: isSupabaseConfigured,
    });
}

export function useCreateFeatureFlag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: Partial<FeatureFlag> & { key: string; label: string }) => {
            const { data, error } = await fromTable("feature_flags")
                .insert(params)
                .select("*")
                .single();
            if (error) throw error;
            return data as FeatureFlag;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feature_flags"] });
        },
    });
}

export function useUpdateFeatureFlag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: { id: string } & Partial<FeatureFlag>) => {
            const { id, ...updates } = params;
            const { data, error } = await fromTable("feature_flags")
                .update(updates)
                .eq("id", id)
                .select("*")
                .single();
            if (error) throw error;
            return data as FeatureFlag;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feature_flags"] });
        },
    });
}

export function useUpsertFlagOverride() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            flag_id: string;
            scope_type: string;
            scope_id: string;
            value: unknown;
            reason?: string;
            created_by?: string;
            expires_at?: string;
        }) => {
            const { data, error } = await fromTable("feature_flag_overrides")
                .upsert(
                    {
                        flag_id: params.flag_id,
                        scope_type: params.scope_type,
                        scope_id: params.scope_id,
                        value: JSON.stringify(params.value),
                        reason: params.reason ?? null,
                        created_by: params.created_by ?? null,
                        expires_at: params.expires_at ?? null,
                    },
                    { onConflict: "flag_id,scope_type,scope_id" }
                )
                .select("*")
                .single();
            if (error) throw error;
            return data as FeatureFlagOverride;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feature_flag_overrides"] });
            qc.invalidateQueries({ queryKey: ["feature_flags"] });
        },
    });
}

// ─── Role Definitions ───

export function useRoleDefinitions(orgId?: string) {
    return useQuery({
        queryKey: ["role_definitions", orgId],
        queryFn: async () => {
            let query = fromTable("role_definitions")
                .select("*, permission_grants(*)")
                .eq("is_active", true)
                .order("priority");
            if (orgId) {
                query = query.or(`organization_id.eq.${orgId},organization_id.is.null`);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as (RoleDefinition & { permission_grants: PermissionGrant[] })[];
        },
        enabled: isSupabaseConfigured,
    });
}

export function useCreateRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            organization_id: string;
            key: string;
            label: string;
            description?: string;
            parent_role_id?: string;
            priority?: number;
        }) => {
            const { data, error } = await fromTable("role_definitions")
                .insert({
                    ...params,
                    is_system: false,
                })
                .select("*")
                .single();
            if (error) throw error;
            return data as RoleDefinition;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["role_definitions"] });
        },
    });
}

export function useUpdateRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: { id: string } & Partial<RoleDefinition>) => {
            const { id, ...updates } = params;
            const { data, error } = await fromTable("role_definitions")
                .update(updates)
                .eq("id", id)
                .eq("is_system", false)
                .select("*")
                .single();
            if (error) throw error;
            return data as RoleDefinition;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["role_definitions"] });
        },
    });
}

export function useUpsertPermissionGrant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            role_definition_id: string;
            resource: string;
            action: string;
            scope_type?: string;
            scope_id?: string;
        }) => {
            const { data, error } = await fromTable("permission_grants")
                .upsert(
                    {
                        role_definition_id: params.role_definition_id,
                        resource: params.resource,
                        action: params.action,
                        scope_type: params.scope_type ?? "global",
                        scope_id: params.scope_id ?? null,
                    },
                    { onConflict: "role_definition_id,resource,action,scope_type,scope_id" }
                )
                .select("*")
                .single();
            if (error) throw error;
            return data as PermissionGrant;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["role_definitions"] });
        },
    });
}

export function useDeletePermissionGrant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (grantId: string) => {
            const { error } = await fromTable("permission_grants").delete().eq("id", grantId);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["role_definitions"] });
        },
    });
}

// ─── Access Audit Log ───

export function useAccessAuditLog(limit = 50) {
    return useQuery({
        queryKey: ["access_audit_log", limit],
        queryFn: async () => {
            const { data, error } = await fromTable("access_audit_log")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data as AccessAuditLogEntry[];
        },
        enabled: isSupabaseConfigured,
    });
}

// ─── Notification Preferences ───

export function useNotificationPreferences(userId: string | null) {
    return useQuery({
        queryKey: ["notification_preferences", userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await fromTable("notification_preferences")
                .select("*")
                .eq("user_id", userId)
                .single();
            if (error && error.code !== "PGRST116") throw error;
            return data;
        },
        enabled: isSupabaseConfigured && !!userId,
    });
}

export function useUpsertNotificationPreferences() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            user_id: string;
            email_enabled?: boolean;
            push_enabled?: boolean;
            sms_enabled?: boolean;
            in_app_enabled?: boolean;
            category_preferences?: Record<string, unknown>;
        }) => {
            const { data, error } = await fromTable("notification_preferences")
                .upsert(params, { onConflict: "user_id" })
                .select("*")
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ["notification_preferences", vars.user_id] });
        },
    });
}

// ─── Brands ───

export function useBrands() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const { data, error } = await fromTable("brands").select("*").order("key");
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured,
    });
}

// ─── User Sessions ───

export function useUserSessions(userId: string | null) {
    return useQuery({
        queryKey: ["user_sessions", userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await fromTable("user_sessions")
                .select("*")
                .eq("user_id", userId)
                .order("last_active_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: isSupabaseConfigured && !!userId,
    });
}

export function useRevokeSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const { error } = await fromTable("user_sessions")
                .update({ is_active: false, ended_at: new Date().toISOString() })
                .eq("id", sessionId);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user_sessions"] });
        },
    });
}
