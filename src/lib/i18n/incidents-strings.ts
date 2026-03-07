/**
 * Incidents & Safety — i18n string definitions
 * Covers: incidents, locations, safety checklists
 */

export const INCIDENTS_STRINGS = {
    // ─── Incidents ─────────────────────────────────────────────
    incidents_title: "Incidents",
    incidents_empty: "No incidents reported",
    incidents_search: "Search incidents...",
    incidents_create: "Report Incident",
    incident_title_field: "Title",
    incident_type: "Incident Type",
    incident_severity: "Severity",
    incident_status: "Status",
    incident_location: "Location",
    incident_reported_by: "Reported By",
    incident_reported_at: "Reported At",
    incident_description: "Description",
    incident_root_cause: "Root Cause",
    incident_corrective_action: "Corrective Action",
    incident_resolved_at: "Resolved At",

    // ─── Severity Levels ──────────────────────────────────────
    severity_low: "Low",
    severity_medium: "Medium",
    severity_high: "High",
    severity_critical: "Critical",

    // ─── Locations ─────────────────────────────────────────────
    locations_title: "Locations",
    locations_empty: "No locations",
    locations_search: "Search locations...",
    locations_create: "New Location",
    location_name: "Location Name",
    location_address: "Address",
    location_city: "City",
    location_state: "State/Region",
    location_country: "Country",
    location_type: "Type",
    location_capacity: "Capacity",
    location_contact: "Contact",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_incident_list: "Incident list",
    a11y_severity_badge: "{severity} severity",
    a11y_location_list: "Location list",
    a11y_incident_timeline: "Incident timeline",
} as const;

export type IncidentsStringKey = keyof typeof INCIDENTS_STRINGS;
