/* ═══════════════════════════════════════════════════════════════
   ATLVS — Settings, Feature Flags & RBAC Types
   ═══════════════════════════════════════════════════════════════ */

// ─── Setting Scope ───
export type SettingScope =
    | "platform"
    | "environment"
    | "organization"
    | "brand"
    | "department"
    | "project"
    | "activation"
    | "team"
    | "role"
    | "user";

// ─── Setting Value Type ───
export type SettingValueType =
    | "boolean"
    | "integer"
    | "float"
    | "text"
    | "enum"
    | "text_array"
    | "jsonb";

// ─── Setting Category ───
export type SettingCategory =
    | "governance"
    | "security"
    | "operational"
    | "branding"
    | "feature_access"
    | "notifications"
    | "preferences";

// ─── Setting Definition ───
export interface SettingDefinition {
    id: string;
    category: SettingCategory;
    key: string;
    label: string;
    description: string | null;
    value_type: SettingValueType;
    default_value: unknown;
    allowed_values: unknown | null;
    min_value: number | null;
    max_value: number | null;
    min_scope: SettingScope;
    max_scope: SettingScope;
    is_sensitive: boolean;
    requires_restart: boolean;
    display_order: number;
    deprecated_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Setting Value ───
export interface SettingValue {
    id: string;
    definition_id: string;
    scope_type: SettingScope;
    scope_id: string | null;
    value: unknown;
    is_locked: boolean;
    locked_by: string | null;
    locked_at: string | null;
    locked_reason: string | null;
    inherit_from_parent: boolean;
    version: number;
    previous_value: unknown | null;
    changed_by: string | null;
    changed_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Setting Change Log Entry ───
export interface SettingChangeLogEntry {
    id: string;
    setting_id: string;
    definition_id: string;
    scope_type: SettingScope;
    scope_id: string | null;
    old_value: unknown | null;
    new_value: unknown;
    changed_by: string;
    change_reason: string | null;
    ip_address: string | null;
    created_at: string;
}

// ─── Resolved Setting ───
export interface ResolvedSetting {
    definition: SettingDefinition;
    value: unknown;
    source_scope: SettingScope;
    source_scope_id: string | null;
    is_inherited: boolean;
    is_locked: boolean;
    locked_by_scope: SettingScope | null;
    can_edit: boolean;
}

// ─── Setting With Definition (joined query) ───
export interface SettingWithDefinition extends SettingValue {
    setting_definitions: SettingDefinition;
}

// ─── Feature Flag Type ───
export type FeatureFlagType = "boolean" | "percentage" | "variant";
export type FeatureFlagOverrideScope = "organization" | "project" | "user" | "role";

// ─── Feature Flag ───
export interface FeatureFlag {
    id: string;
    key: string;
    label: string;
    description: string | null;
    flag_type: FeatureFlagType;
    default_value: unknown;
    is_active: boolean;
    target_orgs: string[];
    target_roles: string[];
    target_environments: string[];
    target_regions: string[];
    target_user_ids: string[];
    rollout_percentage: number;
    variants: unknown[];
    starts_at: string | null;
    expires_at: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Feature Flag Override ───
export interface FeatureFlagOverride {
    id: string;
    flag_id: string;
    scope_type: FeatureFlagOverrideScope;
    scope_id: string;
    value: unknown;
    reason: string | null;
    created_by: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Role Definition ───
export interface RoleDefinition {
    id: string;
    organization_id: string | null;
    key: string;
    label: string;
    description: string | null;
    is_system: boolean;
    is_active: boolean;
    parent_role_id: string | null;
    priority: number;
    created_at: string;
    updated_at: string;
}

// ─── Permission Grant ───
export type PermissionAction = "read" | "write" | "delete" | "manage";
export type PermissionScopeType = "global" | "organization" | "project" | "activation" | "team";

export interface PermissionGrant {
    id: string;
    role_definition_id: string;
    resource: string;
    action: PermissionAction;
    scope_type: PermissionScopeType;
    scope_id: string | null;
    conditions: Record<string, unknown>;
    field_restrictions: string[];
    field_exclusions: string[];
    is_active: boolean;
    created_at: string;
}

// ─── Access Audit Log Entry ───
export interface AccessAuditLogEntry {
    id: string;
    user_id: string;
    resource: string;
    action: string;
    scope_type: string | null;
    scope_id: string | null;
    granted: boolean;
    role_key: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

// ─── Role With Permissions (joined) ───
export interface RoleWithPermissions extends RoleDefinition {
    permission_grants: PermissionGrant[];
}

// ─── Settings Context Shape ───
export interface SettingsContextValue {
    settings: Map<string, ResolvedSetting>;
    featureFlags: Map<string, boolean>;
    loading: boolean;
    getSetting: <T = unknown>(category: SettingCategory, key: string) => T | undefined;
    getSettingMeta: (category: SettingCategory, key: string) => ResolvedSetting | undefined;
    updateSetting: (category: SettingCategory, key: string, value: unknown) => Promise<void>;
    getFlag: (key: string) => boolean;
    canEditSetting: (category: SettingCategory, key: string) => boolean;
    refreshSettings: () => Promise<void>;
}

// ─── Scope Chain Entry ───
export interface ScopeChainEntry {
    scope_type: SettingScope;
    scope_id: string | null;
}
