// ═══════════════════════════════════════════════════════════════
// Settings & Feature Flags — Barrel Export
// ═══════════════════════════════════════════════════════════════

export { SettingsProvider, useSettings, useSetting, useSettingMeta, useFeatureFlag } from "./settings-provider";
export { evaluateFlag, evaluateFlagBoolean, evaluateAllFlags } from "./feature-flags";
export {
    useSettingDefinitions,
    useSettingsForScope,
    useUpsertSetting,
    useLockSetting,
    useSettingsChangeLog,
    useFeatureFlags,
    useFeatureFlagOverrides,
    useCreateFeatureFlag,
    useUpdateFeatureFlag,
    useUpsertFlagOverride,
    useRoleDefinitions,
    useCreateRole,
    useUpdateRole,
    useUpsertPermissionGrant,
    useDeletePermissionGrant,
    useAccessAuditLog,
    useNotificationPreferences,
    useUpsertNotificationPreferences,
    useBrands,
    useUserSessions,
    useRevokeSession,
} from "./hooks";
