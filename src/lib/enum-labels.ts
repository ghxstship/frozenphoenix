/**
 * Shared label maps for enum/status values displayed in the UI.
 * Avoids raw `.toUpperCase()` on DB enum strings.
 */

// ─── Scan Actions ───
export const SCAN_ACTION_LABELS: Record<string, string> = {
    check_in: "Check In",
    check_out: "Check Out",
    transfer: "Transfer",
    audit: "Audit",
    maintenance: "Maintenance",
    return: "Return",
    assign: "Assign",
    unassign: "Unassign",
    locate: "Locate",
    inspect: "Inspect",
};

// ─── Scan / Credential Verification Results ───
export const SCAN_RESULT_LABELS: Record<string, string> = {
    valid: "Valid",
    invalid: "Invalid",
    expired: "Expired",
    revoked: "Revoked",
    not_found: "Not Found",
    pending: "Pending",
    admitted: "Admitted",
    denied: "Denied",
    already_scanned: "Already Scanned",
    capacity_reached: "Capacity Reached",
};

// ─── Survey Template Types ───
export const SURVEY_TYPE_LABELS: Record<string, string> = {
    csat: "CSAT",
    nps: "NPS",
    ces: "CES",
    custom: "Custom",
    post_event: "Post Event",
    onboarding: "Onboarding",
    feedback: "Feedback",
};

/**
 * Generic fallback: converts a snake_case or lowercase enum value
 * to Title Case. Use only when no explicit label map entry exists.
 */
export function enumLabel(value: string, labelMap?: Record<string, string>): string {
    if (labelMap?.[value]) return labelMap[value];
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
