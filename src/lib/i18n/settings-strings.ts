/**
 * Settings & Administration — i18n string definitions
 * Covers: user-management, feature-flags, integrations, automations,
 *         data-export, dashboards, credentials, calendar
 */

export const SETTINGS_STRINGS = {
    // ─── User Management ──────────────────────────────────────
    user_management_title: "User Management",
    user_management_empty: "No users",
    user_management_search: "Search users...",
    user_management_invite: "Invite User",
    user_name: "Name",
    user_email: "Email",
    user_role: "Role",
    user_status: "Status",
    user_last_active: "Last Active",
    user_invitations: "Invitations",
    user_access_reviews: "Access Reviews",
    user_audit_log: "Audit Log",

    // ─── Feature Flags ────────────────────────────────────────
    feature_flags_title: "Feature Flags",
    feature_flags_empty: "No feature flags",
    feature_flag_name: "Flag Name",
    feature_flag_status: "Status",
    feature_flag_enabled: "Enabled",
    feature_flag_disabled: "Disabled",
    feature_flag_rollout: "Rollout Percentage",
    feature_flag_description: "Description",

    // ─── Integrations ──────────────────────────────────────────
    integrations_title: "Integrations",
    integrations_empty: "No integrations configured",
    integration_name: "Integration",
    integration_status: "Status",
    integration_connected: "Connected",
    integration_disconnected: "Disconnected",
    integration_last_sync: "Last Sync",
    integration_configure: "Configure",

    // ─── Automations ───────────────────────────────────────────
    automations_title: "Automations",
    automations_empty: "No automations",
    automations_create: "New Automation",
    automation_name: "Name",
    automation_trigger: "Trigger",
    automation_action: "Action",
    automation_status: "Status",
    automation_last_run: "Last Run",

    // ─── Data Export ───────────────────────────────────────────
    data_export_title: "Data Export",
    data_export_empty: "No exports",
    data_export_create: "New Export",
    data_export_format: "Format",
    data_export_scope: "Scope",
    data_export_status: "Status",
    data_export_download: "Download",

    // ─── Dashboards ────────────────────────────────────────────
    dashboards_title: "Dashboards",
    dashboards_empty: "No dashboards",
    dashboards_create: "New Dashboard",
    dashboard_name: "Dashboard Name",
    dashboard_widgets: "Widgets",
    dashboard_shared: "Shared",

    // ─── Credentials ───────────────────────────────────────────
    credentials_title: "Credentials",
    credentials_empty: "No credentials stored",
    credential_name: "Name",
    credential_type: "Type",
    credential_expiry: "Expiry",
    credential_last_used: "Last Used",

    // ─── Calendar ──────────────────────────────────────────────
    calendar_title: "Calendar",
    calendar_today: "Today",
    calendar_week: "Week",
    calendar_month: "Month",
    calendar_no_events: "No events for this period",
    calendar_create_event: "New Event",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_user_list: "User list",
    a11y_feature_flag_toggle: "Toggle feature flag {name}",
    a11y_calendar_view: "Calendar {view} view",
} as const;

export type SettingsStringKey = keyof typeof SETTINGS_STRINGS;
