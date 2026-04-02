/**
 * Shells & Layout Chrome — i18n string definitions
 * Covers: ListPageShell, DetailLayout, FormPageShell, PageShell,
 *         topbar, sidebar, command bar, cookie consent, error pages,
 *         network status, confirm dialog, user menu
 */

export const SHELLS_STRINGS = {
    // ─── ListPageShell ──────────────────────────────────────────
    list_import: "Import",
    list_new: "New {entity}",
    list_total: "Total {title}",
    list_active: "Active",
    list_recent_30d: "Recent (30d)",
    list_status: "Status",
    list_created: "Created",
    list_search_placeholder: "Search {title}...",
    list_empty_title: "No {title} found",
    list_empty_search: "Try adjusting your search or filters",
    list_empty_create: "Create your first {entity}",
    list_manage: "Manage {title}",
    list_view_details: "View Details",
    list_edit: "Edit",
    list_delete: "Delete",
    list_delete_title: "Delete {entity}",
    list_delete_confirm:
        "Are you sure you want to delete this {entity}? This action cannot be undone.",
    list_delete_selected: "Delete Selected",
    list_delete_count: "Delete {count} {entity}",
    list_delete_count_confirm:
        "Are you sure you want to delete {count} {entity}? This action cannot be undone.",
    list_delete_all: "Delete All",

    // ─── FormPageShell ──────────────────────────────────────────
    form_back: "Back",
    form_cancel: "Cancel",
    form_save_changes: "Save Changes",
    form_create: "Create",
    form_saving: "Saving...",
    form_save_shortcut: "to save",
    form_save_shortcut_sr: "Press Command+S or Control+S to save",
    form_required_suffix: "is required",
    form_add_item: "Add Item",
    form_no_items: "No items added yet.",
    form_remove_item: "Remove item {index}",
    form_go_back: "Go back to {label}",
    form_next: "Next",
    form_wizard_back: "Back",

    // ─── DetailLayout ───────────────────────────────────────────
    detail_back: "Back to {title}",
    detail_edit: "Edit",
    detail_delete: "Delete",
    detail_loading: "Loading...",
    detail_not_found: "Not found",
    detail_not_found_desc: "The {entity} you're looking for doesn't exist or has been removed.",
    detail_overview: "Overview",
    detail_activity: "Activity",

    // ─── Topbar ─────────────────────────────────────────────────
    topbar_search: "Search or type a command...",
    topbar_search_label: "Search or type a command",
    topbar_create_new: "Create New",
    topbar_help_title: "Help & Resources",
    topbar_help_docs: "Documentation",
    topbar_help_shortcuts: "Keyboard shortcuts",
    topbar_help_support: "Contact support",
    topbar_help_whats_new: "What's new",
    topbar_language: "Language",
    topbar_open_nav: "Open navigation menu",
    topbar_more: "More actions",
    topbar_help: "Help",
    topbar_settings: "Settings",
    topbar_quick_create: "Quick create",
    topbar_messages: "Messages",

    // ─── Theme ──────────────────────────────────────────────────
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    theme_label: "Theme: {mode} — click for {next}",

    // ─── User Menu ──────────────────────────────────────────────
    user_menu: "User menu",
    user_organization: "Organization",
    user_profile_settings: "Profile & Settings",
    user_security: "Security",
    user_sign_out: "Sign out",

    // ─── Sidebar ────────────────────────────────────────────────
    sidebar_collapse: "Collapse sidebar",
    sidebar_expand: "Expand sidebar",
    sidebar_pin: "Pin {item}",
    sidebar_unpin: "Unpin {item}",
    sidebar_filter: "Filter navigation…",

    // ─── Command Bar ────────────────────────────────────────────
    command_placeholder: "Type a command or search…",
    command_no_results: "No results found.",
    command_pages: "Pages",
    command_actions: "Actions",
    command_recent: "Recent",

    // ─── Error Boundary / Error Pages ───────────────────────────
    error_title: "Something went wrong",
    error_description: "An unexpected error occurred. Please try again.",
    error_try_again: "Try Again",
    error_go_home: "Go to Dashboard",
    error_page_not_found: "Page Not Found",
    error_page_not_found_desc: "The page you're looking for doesn't exist or has been moved.",

    // ─── Network Status ─────────────────────────────────────────
    network_offline:
        "You are offline. Changes will not be saved until your connection is restored.",
    network_reconnected: "Connection restored.",
    network_disconnected: "Offline — data may be stale",
    network_reconnecting: "Reconnecting...",

    // ─── Cookie Consent ─────────────────────────────────────────
    cookie_title: "Cookie Preferences",
    cookie_description:
        "We use essential cookies for authentication and security. Analytics cookies help us improve your experience.",
    cookie_accept_all: "Accept All",
    cookie_essential_only: "Essential Only",
    cookie_customize: "Customize",
    cookie_save: "Save Preferences",
    cookie_essential: "Essential",
    cookie_essential_desc: "Authentication, security, CSRF (always active)",
    cookie_functional: "Functional",
    cookie_functional_desc: "Preferences, locale, theme",
    cookie_analytics: "Analytics",
    cookie_analytics_desc: "Usage data to improve the product",
    cookie_privacy: "Privacy Policy",

    // ─── WizardShell ────────────────────────────────────────────
    wizard_continue: "Continue",
    wizard_back: "Back",
    wizard_complete: "Complete",
    wizard_skip: "Skip",
    wizard_cancel: "Cancel",
    wizard_validation_default: "Please complete this step before continuing.",
    wizard_progress_label: "Wizard progress",
    wizard_step_of: "Step {current} of {total}",

    // ─── Dashboard Mode ──────────────────────────────────────
    dashboard_no_data: "No data",
    dashboard_no_data_desc: "No records found matching your criteria.",
    dashboard_search_placeholder: "Search...",

    // ─── Confirm Dialog ─────────────────────────────────────────
    confirm_cancel: "Cancel",
    confirm_ok: "Confirm",

    // ─── Environment Badge ──────────────────────────────────────
    env_dev: "Dev",
    env_preview: "Preview",

    // ─── Connection Indicator ────────────────────────────────────
    conn_disconnected: "Disconnected",
    conn_reconnecting: "Reconnecting",

    // ─── Quick Create Groups ────────────────────────────────────
    qc_production: "Production",
    qc_business: "Business",
    qc_people: "People",
    qc_finance: "Finance",
    qc_creative_docs: "Creative & Docs",
    qc_vendors_ops: "Vendors & Operations",
    qc_resources: "Resources & Logistics",
    qc_legal: "Legal & Compliance",
    qc_team: "Team",
} as const;

export type ShellsStringKey = keyof typeof SHELLS_STRINGS;
