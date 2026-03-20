/**
 * Common / Shared — i18n string definitions
 * Covers: shared UI labels, actions, confirmations, pagination,
 *         empty states, and generic patterns used across all domains.
 */

export const COMMON_STRINGS = {
    // ─── Actions ───────────────────────────────────────────────
    action_create: "Create",
    action_creating: "Creating…",
    action_save: "Save",
    action_saving: "Saving…",
    action_update: "Update",
    action_updating: "Updating…",
    action_delete: "Delete",
    action_deleting: "Deleting…",
    action_cancel: "Cancel",
    action_close: "Close",
    action_confirm: "Confirm",
    action_edit: "Edit",
    action_duplicate: "Duplicate",
    action_archive: "Archive",
    action_restore: "Restore",
    action_export: "Export",
    action_import: "Import",
    action_search: "Search",
    action_filter: "Filter",
    action_sort: "Sort",
    action_refresh: "Refresh",
    action_retry: "Retry",
    action_back: "Back",
    action_next: "Next",
    action_previous: "Previous",
    action_view_all: "View All",
    action_view_details: "View Details",
    action_download: "Download",
    action_upload: "Upload",
    action_submit: "Submit",
    action_submitting: "Submitting…",
    action_copy: "Copy",
    action_share: "Share",

    // ─── Confirmations ────────────────────────────────────────
    confirm_delete_title: "Confirm Deletion",
    confirm_delete_message: "Are you sure you want to delete {name}? This action cannot be undone.",
    confirm_archive_title: "Confirm Archive",
    confirm_archive_message: "Are you sure you want to archive {name}?",
    confirm_discard_title: "Discard Changes",
    confirm_discard_message: "You have unsaved changes. Are you sure you want to discard them?",

    // ─── Empty States ──────────────────────────────────────────
    empty_no_results: "No results found",
    empty_no_data: "No data available",
    empty_search_no_match: "No items match your search",
    empty_filter_no_match: "No items match the selected filters",
    empty_no_items_added: "No items added yet",
    empty_no_items_in: "No items in this {entity}",
    empty_try_different: "Try adjusting your search or filters",

    // ─── Pagination ────────────────────────────────────────────
    pagination_showing: "Showing {start} to {end} of {total}",
    pagination_page: "Page {current} of {total}",
    pagination_per_page: "Per page",
    pagination_first: "First",
    pagination_last: "Last",

    // ─── Table ─────────────────────────────────────────────────
    table_no_columns: "No columns selected",
    table_select_all: "Select all",
    table_selected: "{count} selected",
    table_bulk_actions: "Bulk Actions",

    // ─── Form ──────────────────────────────────────────────────
    form_required: "Required",
    form_optional: "Optional",
    form_invalid: "Invalid value",
    form_too_short: "Must be at least {min} characters",
    form_too_long: "Must be at most {max} characters",
    form_select_option: "Select an option",
    form_no_options: "No options available",

    // ─── Toast / Notifications ─────────────────────────────────
    toast_created: "{entity} created successfully",
    toast_updated: "{entity} updated successfully",
    toast_deleted: "{entity} deleted successfully",
    toast_archived: "{entity} archived successfully",
    toast_restored: "{entity} restored successfully",
    toast_error: "Something went wrong. Please try again.",
    toast_copied: "Copied to clipboard",

    // ─── Loading ───────────────────────────────────────────────
    loading_generic: "Loading…",
    loading_data: "Loading data…",
    loading_saving: "Saving changes…",

    // ─── Time ──────────────────────────────────────────────────
    time_just_now: "Just now",
    time_minutes_ago: "{count} minutes ago",
    time_hours_ago: "{count} hours ago",
    time_days_ago: "{count} days ago",
    time_today: "Today",
    time_yesterday: "Yesterday",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_close_dialog: "Close dialog",
    a11y_open_menu: "Open menu",
    a11y_sort_ascending: "Sort ascending",
    a11y_sort_descending: "Sort descending",
    a11y_required_field: "Required field",
    a11y_loading: "Loading content",
    a11y_skip_nav: "Skip to main content",
} as const;

export type CommonStringKey = keyof typeof COMMON_STRINGS;
