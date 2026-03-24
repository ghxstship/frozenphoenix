import type { PermissionLevel } from "@/types";

export interface Permission {
    resource: string;
    actions: ("read" | "write" | "delete" | "manage")[];
}

// ─── Canonical Role Labels ──────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
    exec: "Executive",
    director: "Director",
    pm: "Project Manager",
    member: "Team Member",
    client: "Client",
    collaborator: "Collaborator",
};

/**
 * Six-Tier Permissions Matrix
 *
 * Level 1 (exec):         Global access — margins, payroll, cross-project data, full admin
 * Level 2 (director):     Cross-project oversight — broad read, scoped write, no destructive admin
 * Level 3 (pm):           Project-scoped budgets, crew schedules, tasks
 * Level 4 (member):       Task execution — assigned work, time, limited resource access
 * Level 5 (client):       Approved deliverables, branded progress decks, public budgets
 * Level 6 (collaborator): External partner — task-specific WOs, site maps only
 */
export const PERMISSION_MATRIX: Record<PermissionLevel, Permission[]> = {
    exec: [{ resource: "*", actions: ["read", "write", "delete", "manage"] }],
    director: [
        // Command Center
        { resource: "dashboard", actions: ["read"] },
        { resource: "dashboards", actions: ["read", "write"] },
        { resource: "calendar", actions: ["read", "write"] },
        { resource: "reports", actions: ["read", "write"] },
        { resource: "forecasting", actions: ["read", "write"] },
        { resource: "scenarios", actions: ["read", "write"] },
        { resource: "saved_views", actions: ["read", "write"] },
        // Commercial
        { resource: "leads", actions: ["read", "write"] },
        { resource: "pipeline", actions: ["read", "write"] },
        { resource: "deals", actions: ["read", "write", "manage"] },
        { resource: "opportunities", actions: ["read", "write", "manage"] },
        { resource: "accounts", actions: ["read", "write", "manage"] },
        { resource: "revenue", actions: ["read", "write"] },
        { resource: "change_orders", actions: ["read", "write", "manage"] },
        { resource: "people", actions: ["read", "write"] },
        { resource: "case_studies", actions: ["read", "write"] },
        { resource: "service_requests", actions: ["read", "write", "manage"] },
        // Production
        { resource: "projects", actions: ["read", "write", "manage"] },
        { resource: "locations", actions: ["read", "write"] },
        { resource: "activations", actions: ["read", "write", "manage"] },
        { resource: "events", actions: ["read", "write", "manage"] },
        { resource: "tasks", actions: ["read", "write", "delete", "manage"] },
        { resource: "sow", actions: ["read", "write", "manage"] },
        { resource: "schedule", actions: ["read", "write"] },
        { resource: "advancing", actions: ["read", "write", "manage"] },
        // Resources
        { resource: "crew", actions: ["read", "write"] },
        { resource: "time_tracking", actions: ["read", "write"] },
        { resource: "time_off", actions: ["read", "write", "manage"] },
        { resource: "assets", actions: ["read", "write"] },
        { resource: "qr_generation", actions: ["read", "write"] },
        { resource: "nfc_write", actions: ["read", "write"] },
        { resource: "inventory", actions: ["read", "write"] },
        { resource: "fleet", actions: ["read", "write"] },
        { resource: "resource_planner", actions: ["read", "write"] },
        // Logistics
        { resource: "shipments", actions: ["read", "write"] },
        { resource: "warehouses", actions: ["read", "write"] },
        // Creative
        { resource: "brand", actions: ["read", "write"] },
        { resource: "decks", actions: ["read", "write"] },
        { resource: "templates", actions: ["read", "write"] },
        // Documents
        { resource: "documents", actions: ["read", "write"] },
        { resource: "contracts", actions: ["read", "write", "manage"] },
        { resource: "call_sheets", actions: ["read", "write"] },
        { resource: "tech_sheets", actions: ["read", "write"] },
        { resource: "proposals", actions: ["read", "write", "manage"] },
        // Finance
        { resource: "finance", actions: ["read", "write"] },
        { resource: "budgets", actions: ["read", "write", "manage"] },
        { resource: "rate_cards", actions: ["read", "write"] },
        { resource: "client_invoices", actions: ["read", "write", "manage"] },
        { resource: "invoices", actions: ["read", "write", "manage"] },
        { resource: "payments", actions: ["read", "write"] },
        { resource: "credit_notes", actions: ["read", "write"] },
        { resource: "recurring_invoices", actions: ["read", "write"] },
        { resource: "expenses", actions: ["read", "write", "manage"] },
        { resource: "estimates", actions: ["read", "write"] },
        { resource: "job_costing", actions: ["read", "write"] },
        { resource: "vendors", actions: ["read", "write", "manage"] },
        { resource: "procurement", actions: ["read", "write", "manage"] },
        // Vendor Management
        { resource: "vendor_onboarding", actions: ["read", "write", "manage"] },
        { resource: "vendor_compliance", actions: ["read", "write", "manage"] },
        { resource: "vendor_reviews", actions: ["read", "write", "manage"] },
        { resource: "work_orders", actions: ["read", "write", "manage"] },
        { resource: "dispatch", actions: ["read", "write"] },
        { resource: "checklists", actions: ["read", "write"] },
        // Safety & Compliance
        { resource: "incidents", actions: ["read", "write", "manage"] },
        { resource: "approvals", actions: ["read", "write", "manage"] },
        { resource: "automations", actions: ["read", "write"] },
        // Portals
        { resource: "client_portal", actions: ["read", "write"] },
        { resource: "vendor_portal", actions: ["read", "write"] },
        // Organization
        { resource: "org_chart", actions: ["read", "write"] },
        { resource: "sops", actions: ["read", "write"] },
        { resource: "vault", actions: ["read"] },
        { resource: "kb", actions: ["read", "write"] },
        { resource: "roles", actions: ["read"] },
        { resource: "settings", actions: ["read"] },
        // Workforce
        { resource: "workforce", actions: ["read", "write", "manage"] },
        { resource: "workforce_onboarding", actions: ["read", "write", "manage"] },
        { resource: "workforce_reviews", actions: ["read", "write", "manage"] },
        // Digital Assets
        { resource: "digital_assets", actions: ["read", "write"] },
        // User Management
        { resource: "user_management", actions: ["read", "write"] },
        { resource: "invitations", actions: ["read", "write"] },
        { resource: "access_reviews", actions: ["read", "write"] },
        { resource: "audit_log", actions: ["read"] },
        // Creative & Brand
        { resource: "creative_briefs", actions: ["read", "write", "manage"] },
        { resource: "brand_guidelines", actions: ["read", "write", "manage"] },
        { resource: "campaigns", actions: ["read", "write", "manage"] },
        { resource: "creative_reviews", actions: ["read", "write", "manage"] },
        // Legal & Governance
        { resource: "insurance_policies", actions: ["read", "write"] },
        { resource: "ip_rights", actions: ["read", "write"] },
        { resource: "clause_library", actions: ["read", "write"] },
        { resource: "obligations", actions: ["read", "write"] },
        // Compliance
        { resource: "permits", actions: ["read", "write"] },
        { resource: "engineering_approvals", actions: ["read", "write"] },
        { resource: "compliance_checklists", actions: ["read", "write"] },
        { resource: "certifications", actions: ["read", "write"] },
        // Finance Governance
        { resource: "gl_accounts", actions: ["read", "write"] },
        { resource: "budget_approvals", actions: ["read", "write", "manage"] },
        { resource: "payment_approvals", actions: ["read", "write"] },
        { resource: "purchase_requisitions", actions: ["read", "write", "manage"] },
        { resource: "goods_receipts", actions: ["read", "write"] },
        { resource: "vendor_risk", actions: ["read", "write"] },
        // Live Operations
        { resource: "live_events", actions: ["read", "write", "manage"] },
        { resource: "command_positions", actions: ["read", "write"] },
        { resource: "readiness_gates", actions: ["read", "write", "manage"] },
        { resource: "department_statuses", actions: ["read", "write"] },
        { resource: "ros_cues", actions: ["read", "write"] },
        { resource: "comm_channels", actions: ["read", "write"] },
        { resource: "comm_log", actions: ["read", "write"] },
        { resource: "live_crew", actions: ["read", "write"] },
        { resource: "equipment_check_ins", actions: ["read", "write"] },
        { resource: "environmental_readings", actions: ["read", "write"] },
        { resource: "live_financial", actions: ["read", "write"] },
        { resource: "foh_zones", actions: ["read", "write"] },
        { resource: "vip_guests", actions: ["read", "write"] },
        { resource: "guest_incidents", actions: ["read", "write"] },
        { resource: "strike_sequences", actions: ["read", "write"] },
        { resource: "asset_reconciliation", actions: ["read", "write"] },
        { resource: "post_event_reports", actions: ["read", "write"] },
        // Spatial Hierarchy
        { resource: "spatial_locations", actions: ["read", "write"] },
        { resource: "space_bookings", actions: ["read", "write"] },
        { resource: "location_documents", actions: ["read", "write"] },
        { resource: "location_inspections", actions: ["read", "write"] },
        { resource: "location_costs", actions: ["read", "write"] },
        // Asset Logistics
        { resource: "warehouse_zones", actions: ["read", "write"] },
        { resource: "warehouse_locations", actions: ["read", "write"] },
        { resource: "reservations", actions: ["read", "write"] },
        { resource: "kits", actions: ["read", "write"] },
        { resource: "scan_log", actions: ["read", "write"] },
        { resource: "load_plans", actions: ["read", "write"] },
        { resource: "logistics_events", actions: ["read"] },
        { resource: "asset_damage", actions: ["read", "write"] },
        { resource: "maintenance_schedules", actions: ["read", "write"] },
        { resource: "depreciation_schedules", actions: ["read"] },
        { resource: "inventory_audits", actions: ["read", "write"] },
        // System & Observability
        { resource: "system_health", actions: ["read"] },
        { resource: "data_export", actions: ["read", "write"] },
        { resource: "sla_definitions", actions: ["read", "write"] },
        { resource: "financial_periods", actions: ["read", "write"] },
        { resource: "exchange_rates", actions: ["read", "write"] },
        { resource: "domain_events", actions: ["read"] },
        // Production Lifecycle
        { resource: "production_verticals", actions: ["read", "write"] },
        { resource: "work_packages", actions: ["read", "write"] },
        { resource: "work_package_dependencies", actions: ["read", "write"] },
        { resource: "boms", actions: ["read", "write"] },
        { resource: "production_runs", actions: ["read", "write"] },
        { resource: "qc_gates", actions: ["read", "write"] },
        { resource: "technical_specs", actions: ["read", "write"] },
        { resource: "rights_licenses", actions: ["read", "write"] },
        { resource: "rental_agreements", actions: ["read", "write"] },
        // Credentialing & Ticketing
        { resource: "credential_types", actions: ["read", "write", "manage"] },
        { resource: "credential_pools", actions: ["read", "write", "manage"] },
        { resource: "credential_assignments", actions: ["read", "write", "manage"] },
        { resource: "credential_scans", actions: ["read", "write"] },
        { resource: "bulk_imports", actions: ["read", "write"] },
        { resource: "export_templates", actions: ["read", "write", "manage"] },
        // External Sync & POS
        { resource: "provider_connections", actions: ["read", "write", "manage"] },
        { resource: "provider_ticket_map", actions: ["read", "write"] },
        { resource: "pos_transactions", actions: ["read"] },
        { resource: "webhook_events", actions: ["read"] },
        { resource: "sync_events", actions: ["read"] },
        { resource: "sync_policies", actions: ["read", "write", "manage"] },
        { resource: "webhook_subscriptions", actions: ["read", "write", "manage"] },
        { resource: "webhook_deliveries", actions: ["read"] },
        { resource: "api_keys", actions: ["read", "write", "manage"] },
        { resource: "automation_dead_letters", actions: ["read", "write"] },
        { resource: "integration_catalog", actions: ["read"] },
        { resource: "gate_operations", actions: ["read", "write"] },
        // Messaging
        { resource: "messaging_dm", actions: ["read", "write"] },
        { resource: "messaging_group", actions: ["read", "write", "manage"] },
        { resource: "messaging_channel", actions: ["read", "write", "manage"] },
        { resource: "messaging_message", actions: ["read", "write", "delete"] },
        { resource: "messaging_announcement", actions: ["read", "write"] },
        { resource: "messaging_mandatory_read", actions: ["read", "write"] },
        { resource: "messaging_export", actions: ["read", "write"] },
        { resource: "messaging_ptt", actions: ["read", "write"] },
        // Teams
        { resource: "teams", actions: ["read", "write", "manage"] },
        { resource: "team_members", actions: ["read", "write", "manage"] },
    ],
    pm: [
        // Command Center
        { resource: "dashboard", actions: ["read"] },
        { resource: "dashboards", actions: ["read", "write"] },
        { resource: "calendar", actions: ["read", "write"] },
        { resource: "reports", actions: ["read"] },
        { resource: "forecasting", actions: ["read"] },
        { resource: "scenarios", actions: ["read", "write"] },
        { resource: "saved_views", actions: ["read", "write"] },
        // Commercial
        { resource: "leads", actions: ["read", "write"] },
        { resource: "pipeline", actions: ["read", "write"] },
        { resource: "deals", actions: ["read", "write"] },
        { resource: "opportunities", actions: ["read", "write"] },
        { resource: "accounts", actions: ["read", "write"] },
        { resource: "revenue", actions: ["read"] },
        { resource: "change_orders", actions: ["read", "write"] },
        { resource: "people", actions: ["read"] },
        { resource: "case_studies", actions: ["read", "write"] },
        { resource: "service_requests", actions: ["read", "write"] },
        // Production
        { resource: "projects", actions: ["read", "write"] },
        { resource: "locations", actions: ["read", "write"] },
        { resource: "activations", actions: ["read", "write"] },
        { resource: "events", actions: ["read", "write"] },
        { resource: "tasks", actions: ["read", "write", "delete"] },
        { resource: "sow", actions: ["read", "write"] },
        { resource: "schedule", actions: ["read", "write"] },
        { resource: "advancing", actions: ["read", "write"] },
        // Resources
        { resource: "crew", actions: ["read", "write"] },
        { resource: "time_tracking", actions: ["read", "write"] },
        { resource: "time_off", actions: ["read", "write"] },
        { resource: "assets", actions: ["read", "write"] },
        { resource: "qr_generation", actions: ["read", "write"] },
        { resource: "nfc_write", actions: ["read", "write"] },
        { resource: "inventory", actions: ["read", "write"] },
        { resource: "fleet", actions: ["read"] },
        { resource: "resource_planner", actions: ["read", "write"] },
        // Logistics
        { resource: "shipments", actions: ["read", "write"] },
        { resource: "warehouses", actions: ["read", "write"] },
        // Creative
        { resource: "brand", actions: ["read"] },
        { resource: "decks", actions: ["read", "write"] },
        { resource: "templates", actions: ["read", "write"] },
        // Documents
        { resource: "documents", actions: ["read", "write"] },
        { resource: "contracts", actions: ["read", "write"] },
        { resource: "call_sheets", actions: ["read", "write"] },
        { resource: "tech_sheets", actions: ["read", "write"] },
        { resource: "proposals", actions: ["read", "write"] },
        // Finance
        { resource: "finance", actions: ["read"] },
        { resource: "budgets", actions: ["read", "write"] },
        { resource: "rate_cards", actions: ["read"] },
        { resource: "client_invoices", actions: ["read", "write"] },
        { resource: "invoices", actions: ["read", "write"] },
        { resource: "payments", actions: ["read"] },
        { resource: "credit_notes", actions: ["read"] },
        { resource: "recurring_invoices", actions: ["read"] },
        { resource: "expenses", actions: ["read", "write"] },
        { resource: "estimates", actions: ["read", "write"] },
        { resource: "job_costing", actions: ["read"] },
        { resource: "vendors", actions: ["read", "write"] },
        { resource: "procurement", actions: ["read", "write"] },
        // Vendor Management
        { resource: "vendor_onboarding", actions: ["read", "write"] },
        { resource: "vendor_compliance", actions: ["read", "write"] },
        { resource: "vendor_reviews", actions: ["read", "write"] },
        { resource: "work_orders", actions: ["read", "write"] },
        { resource: "dispatch", actions: ["read", "write"] },
        { resource: "checklists", actions: ["read", "write"] },
        // Safety & Compliance
        { resource: "incidents", actions: ["read", "write"] },
        { resource: "approvals", actions: ["read", "write"] },
        { resource: "automations", actions: ["read"] },
        // Portals
        { resource: "client_portal", actions: ["read"] },
        { resource: "vendor_portal", actions: ["read"] },
        // Organization
        { resource: "org_chart", actions: ["read"] },
        { resource: "sops", actions: ["read"] },
        { resource: "vault", actions: ["read"] },
        { resource: "kb", actions: ["read"] },
        { resource: "roles", actions: ["read"] },
        { resource: "settings", actions: ["read"] },
        // Workforce
        { resource: "workforce", actions: ["read", "write"] },
        { resource: "workforce_onboarding", actions: ["read", "write"] },
        { resource: "workforce_reviews", actions: ["read", "write"] },
        // Digital Assets
        { resource: "digital_assets", actions: ["read", "write"] },
        // User Management
        { resource: "user_management", actions: ["read"] },
        { resource: "invitations", actions: ["read", "write"] },
        { resource: "access_reviews", actions: ["read"] },
        { resource: "audit_log", actions: ["read"] },
        // Creative & Brand
        { resource: "creative_briefs", actions: ["read", "write"] },
        { resource: "brand_guidelines", actions: ["read", "write"] },
        { resource: "campaigns", actions: ["read", "write"] },
        { resource: "creative_reviews", actions: ["read", "write"] },
        // Legal & Governance
        { resource: "insurance_policies", actions: ["read", "write"] },
        { resource: "ip_rights", actions: ["read", "write"] },
        { resource: "clause_library", actions: ["read", "write"] },
        { resource: "obligations", actions: ["read", "write"] },
        // Compliance
        { resource: "permits", actions: ["read", "write"] },
        { resource: "engineering_approvals", actions: ["read", "write"] },
        { resource: "compliance_checklists", actions: ["read", "write"] },
        { resource: "certifications", actions: ["read", "write"] },
        // Finance Governance
        { resource: "gl_accounts", actions: ["read"] },
        { resource: "budget_approvals", actions: ["read", "write"] },
        { resource: "payment_approvals", actions: ["read"] },
        { resource: "purchase_requisitions", actions: ["read", "write"] },
        { resource: "goods_receipts", actions: ["read", "write"] },
        { resource: "vendor_risk", actions: ["read"] },
        // Live Operations
        { resource: "live_events", actions: ["read", "write"] },
        { resource: "command_positions", actions: ["read", "write"] },
        { resource: "readiness_gates", actions: ["read", "write"] },
        { resource: "department_statuses", actions: ["read", "write"] },
        { resource: "ros_cues", actions: ["read", "write"] },
        { resource: "comm_channels", actions: ["read", "write"] },
        { resource: "comm_log", actions: ["read", "write"] },
        { resource: "live_crew", actions: ["read", "write"] },
        { resource: "equipment_check_ins", actions: ["read", "write"] },
        { resource: "environmental_readings", actions: ["read", "write"] },
        { resource: "live_financial", actions: ["read", "write"] },
        { resource: "foh_zones", actions: ["read", "write"] },
        { resource: "vip_guests", actions: ["read", "write"] },
        { resource: "guest_incidents", actions: ["read", "write"] },
        { resource: "strike_sequences", actions: ["read", "write"] },
        { resource: "asset_reconciliation", actions: ["read", "write"] },
        { resource: "post_event_reports", actions: ["read", "write"] },
        // Spatial Hierarchy
        { resource: "spatial_locations", actions: ["read", "write"] },
        { resource: "space_bookings", actions: ["read", "write"] },
        { resource: "location_documents", actions: ["read", "write"] },
        { resource: "location_inspections", actions: ["read", "write"] },
        { resource: "location_costs", actions: ["read", "write"] },
        // Asset Logistics
        { resource: "warehouse_zones", actions: ["read", "write"] },
        { resource: "warehouse_locations", actions: ["read", "write"] },
        { resource: "reservations", actions: ["read", "write"] },
        { resource: "kits", actions: ["read", "write"] },
        { resource: "scan_log", actions: ["read", "write"] },
        { resource: "load_plans", actions: ["read", "write"] },
        { resource: "logistics_events", actions: ["read"] },
        { resource: "asset_damage", actions: ["read", "write"] },
        { resource: "maintenance_schedules", actions: ["read", "write"] },
        { resource: "depreciation_schedules", actions: ["read"] },
        { resource: "inventory_audits", actions: ["read", "write"] },
        // System & Observability
        { resource: "system_health", actions: ["read"] },
        { resource: "data_export", actions: ["read", "write"] },
        { resource: "sla_definitions", actions: ["read", "write"] },
        { resource: "financial_periods", actions: ["read", "write"] },
        { resource: "exchange_rates", actions: ["read", "write"] },
        { resource: "domain_events", actions: ["read"] },
        // Production Lifecycle
        { resource: "production_verticals", actions: ["read", "write"] },
        { resource: "work_packages", actions: ["read", "write"] },
        { resource: "work_package_dependencies", actions: ["read", "write"] },
        { resource: "boms", actions: ["read", "write"] },
        { resource: "production_runs", actions: ["read", "write"] },
        { resource: "qc_gates", actions: ["read", "write"] },
        { resource: "technical_specs", actions: ["read", "write"] },
        { resource: "rights_licenses", actions: ["read", "write"] },
        { resource: "rental_agreements", actions: ["read", "write"] },
        // Credentialing & Ticketing
        { resource: "credential_types", actions: ["read", "write"] },
        { resource: "credential_pools", actions: ["read", "write"] },
        { resource: "credential_assignments", actions: ["read", "write"] },
        { resource: "credential_scans", actions: ["read", "write"] },
        { resource: "bulk_imports", actions: ["read", "write"] },
        { resource: "export_templates", actions: ["read", "write"] },
        // External Sync & POS
        { resource: "provider_connections", actions: ["read", "write"] },
        { resource: "provider_ticket_map", actions: ["read", "write"] },
        { resource: "pos_transactions", actions: ["read"] },
        { resource: "webhook_events", actions: ["read"] },
        { resource: "sync_events", actions: ["read"] },
        { resource: "sync_policies", actions: ["read", "write"] },
        { resource: "webhook_subscriptions", actions: ["read", "write"] },
        { resource: "webhook_deliveries", actions: ["read"] },
        { resource: "api_keys", actions: ["read", "write"] },
        { resource: "automation_dead_letters", actions: ["read"] },
        { resource: "integration_catalog", actions: ["read"] },
        { resource: "gate_operations", actions: ["read", "write"] },
        // Messaging
        { resource: "messaging_dm", actions: ["read", "write"] },
        { resource: "messaging_group", actions: ["read", "write", "manage"] },
        { resource: "messaging_channel", actions: ["read", "write"] },
        { resource: "messaging_message", actions: ["read", "write"] },
        { resource: "messaging_export", actions: ["read", "write"] },
        { resource: "messaging_ptt", actions: ["read", "write"] },
        // Teams
        { resource: "teams", actions: ["read", "write"] },
        { resource: "team_members", actions: ["read", "write"] },
    ],
    client: [
        { resource: "dashboard", actions: ["read"] },
        { resource: "projects", actions: ["read"] },
        { resource: "events", actions: ["read"] },
        { resource: "activations", actions: ["read"] },
        { resource: "advancing", actions: ["read"] },
        { resource: "decks", actions: ["read"] },
        { resource: "approvals", actions: ["read", "write"] },
        { resource: "brand", actions: ["read"] },
        { resource: "case_studies", actions: ["read"] },
        { resource: "calendar", actions: ["read"] },
        { resource: "org_chart", actions: ["read"] },
        { resource: "contracts", actions: ["read"] },
        { resource: "invoices", actions: ["read"] },
        { resource: "client_invoices", actions: ["read"] },
        { resource: "proposals", actions: ["read"] },
        { resource: "call_sheets", actions: ["read"] },
        { resource: "documents", actions: ["read"] },
        { resource: "client_portal", actions: ["read"] },
        // Settings (client view — personal preferences)
        { resource: "settings", actions: ["read"] },
        // CRM & Revenue (client view)
        { resource: "opportunities", actions: ["read"] },
        { resource: "accounts", actions: ["read"] },
        { resource: "revenue", actions: ["read"] },
        { resource: "change_orders", actions: ["read"] },
        // Digital Assets (client view)
        { resource: "digital_assets", actions: ["read"] },
        // User Management (client view — own profile only)
        { resource: "user_management", actions: ["read"] },
        { resource: "invitations", actions: ["read", "write"] },
        // Creative & Brand (client view)
        { resource: "creative_briefs", actions: ["read", "write"] },
        { resource: "brand_guidelines", actions: ["read", "write"] },
        { resource: "campaigns", actions: ["read", "write"] },
        { resource: "creative_reviews", actions: ["read", "write"] },
        // Legal (client view)
        { resource: "insurance_policies", actions: ["read"] },
        { resource: "obligations", actions: ["read"] },
        { resource: "permits", actions: ["read"] },
        // Live Operations (client view)
        { resource: "live_events", actions: ["read"] },
        { resource: "ros_cues", actions: ["read"] },
        { resource: "vip_guests", actions: ["read"] },
        { resource: "post_event_reports", actions: ["read"] },
        // Spatial Hierarchy (client view)
        { resource: "spatial_locations", actions: ["read"] },
        { resource: "space_bookings", actions: ["read"] },
        // System (client view)
        { resource: "data_export", actions: ["read", "write"] },
        // Production Lifecycle (client view)
        { resource: "work_packages", actions: ["read"] },
        { resource: "qc_gates", actions: ["read", "write"] },
        { resource: "rental_agreements", actions: ["read"] },
        { resource: "rights_licenses", actions: ["read"] },
        // Credentialing (client view — own credentials)
        { resource: "credential_assignments", actions: ["read"] },
        { resource: "credential_scans", actions: ["read"] },
        // Messaging (client — DM assigned PM only)
        { resource: "messaging", actions: ["read"] },
        { resource: "messaging_dm", actions: ["read", "write"] },
        { resource: "messaging_message", actions: ["read", "write"] },
        // Teams (client — read own team only)
        { resource: "teams", actions: ["read"] },
        { resource: "team_members", actions: ["read"] },
    ],
    member: [
        // Command Center (limited)
        { resource: "dashboard", actions: ["read"] },
        { resource: "calendar", actions: ["read", "write"] },
        // Production (task execution)
        { resource: "projects", actions: ["read"] },
        { resource: "events", actions: ["read"] },
        { resource: "activations", actions: ["read"] },
        { resource: "tasks", actions: ["read", "write"] },
        { resource: "sow", actions: ["read"] },
        { resource: "schedule", actions: ["read", "write"] },
        { resource: "locations", actions: ["read"] },
        { resource: "advancing", actions: ["read", "write"] },
        // Resources (own + assigned)
        { resource: "crew", actions: ["read"] },
        { resource: "time_tracking", actions: ["read", "write"] },
        { resource: "time_off", actions: ["read", "write"] },
        { resource: "assets", actions: ["read"] },
        { resource: "qr_generation", actions: ["read"] },
        { resource: "inventory", actions: ["read"] },
        { resource: "resource_planner", actions: ["read"] },
        // Documents (read + limited write)
        { resource: "documents", actions: ["read", "write"] },
        { resource: "call_sheets", actions: ["read"] },
        { resource: "tech_sheets", actions: ["read"] },
        // Finance (limited)
        { resource: "expenses", actions: ["read", "write"] },
        { resource: "budgets", actions: ["read"] },
        // Vendor Management (own assignments)
        { resource: "work_orders", actions: ["read", "write"] },
        { resource: "checklists", actions: ["read", "write"] },
        // Safety & Compliance
        { resource: "incidents", actions: ["read", "write"] },
        { resource: "approvals", actions: ["read", "write"] },
        // Organization
        { resource: "org_chart", actions: ["read"] },
        { resource: "sops", actions: ["read"] },
        { resource: "kb", actions: ["read"] },
        { resource: "settings", actions: ["read"] },
        // Workforce (own profile)
        { resource: "workforce", actions: ["read"] },
        // Digital Assets
        { resource: "digital_assets", actions: ["read", "write"] },
        // User Management (own profile)
        { resource: "user_management", actions: ["read"] },
        { resource: "invitations", actions: ["read", "write"] },
        // Creative & Brand
        { resource: "creative_briefs", actions: ["read"] },
        { resource: "brand_guidelines", actions: ["read"] },
        { resource: "campaigns", actions: ["read"] },
        { resource: "creative_reviews", actions: ["read", "write"] },
        // Legal (read-only)
        { resource: "contracts", actions: ["read"] },
        { resource: "insurance_policies", actions: ["read"] },
        { resource: "permits", actions: ["read"] },
        { resource: "compliance_checklists", actions: ["read"] },
        { resource: "certifications", actions: ["read"] },
        // Live Operations
        { resource: "live_events", actions: ["read"] },
        { resource: "live_crew", actions: ["read"] },
        { resource: "equipment_check_ins", actions: ["read", "write"] },
        { resource: "ros_cues", actions: ["read"] },
        { resource: "department_statuses", actions: ["read"] },
        { resource: "comm_channels", actions: ["read"] },
        { resource: "comm_log", actions: ["read", "write"] },
        { resource: "strike_sequences", actions: ["read"] },
        // Spatial Hierarchy
        { resource: "spatial_locations", actions: ["read"] },
        { resource: "space_bookings", actions: ["read"] },
        // Asset Logistics
        { resource: "scan_log", actions: ["read", "write"] },
        { resource: "asset_damage", actions: ["read", "write"] },
        // Production Lifecycle
        { resource: "work_packages", actions: ["read"] },
        { resource: "qc_gates", actions: ["read", "write"] },
        { resource: "technical_specs", actions: ["read"] },
        { resource: "production_runs", actions: ["read"] },
        // System
        { resource: "data_export", actions: ["read"] },
        // Credentialing & Ticketing (member — gate ops + read)
        { resource: "credential_types", actions: ["read"] },
        { resource: "credential_pools", actions: ["read"] },
        { resource: "credential_assignments", actions: ["read", "write"] },
        { resource: "credential_scans", actions: ["read", "write"] },
        { resource: "gate_operations", actions: ["read", "write"] },
        // Messaging
        { resource: "messaging", actions: ["read"] },
        { resource: "messaging_dm", actions: ["read", "write"] },
        { resource: "messaging_group", actions: ["read", "write"] },
        { resource: "messaging_channel", actions: ["read"] },
        { resource: "messaging_message", actions: ["read", "write"] },
        { resource: "messaging_ptt", actions: ["read", "write"] },
        // Teams
        { resource: "teams", actions: ["read"] },
        { resource: "team_members", actions: ["read"] },
    ],
    collaborator: [
        // Command Center — collaborator is also DEFAULT_LEVEL fallback,
        // so dashboard must be accessible to prevent false Access Denied.
        { resource: "dashboard", actions: ["read"] },
        { resource: "settings", actions: ["read"] },
        { resource: "tasks", actions: ["read"] },
        { resource: "schedule", actions: ["read"] },
        { resource: "vault", actions: ["read"] },
        { resource: "contracts", actions: ["read"] },
        { resource: "call_sheets", actions: ["read"] },
        { resource: "tech_sheets", actions: ["read"] },
        { resource: "work_orders", actions: ["read", "write"] },
        { resource: "dispatch", actions: ["read"] },
        { resource: "advancing", actions: ["read"] },
        { resource: "checklists", actions: ["read", "write"] },
        { resource: "vendor_compliance", actions: ["read", "write"] },
        { resource: "vendor_portal", actions: ["read"] },
        // User Management (collaborator view)
        { resource: "invitations", actions: ["read", "write"] },
        // Digital Assets (collaborator view)
        { resource: "digital_assets", actions: ["read"] },
        // Governance (collaborator view)
        { resource: "insurance_policies", actions: ["read", "write"] },
        { resource: "certifications", actions: ["read"] },
        { resource: "compliance_checklists", actions: ["read"] },
        // Live Operations (collaborator view)
        { resource: "live_events", actions: ["read"] },
        { resource: "equipment_check_ins", actions: ["read", "write"] },
        { resource: "strike_sequences", actions: ["read"] },
        { resource: "asset_reconciliation", actions: ["read"] },
        // Spatial Hierarchy (collaborator view)
        { resource: "spatial_locations", actions: ["read"] },
        // Asset Logistics (collaborator view)
        { resource: "scan_log", actions: ["read", "write"] },
        { resource: "asset_damage", actions: ["read", "write"] },
        // Production Lifecycle (collaborator view)
        { resource: "work_packages", actions: ["read"] },
        { resource: "qc_gates", actions: ["read", "write"] },
        { resource: "technical_specs", actions: ["read"] },
        { resource: "production_runs", actions: ["read"] },
        // Credentialing (collaborator — own credentials only)
        { resource: "credential_assignments", actions: ["read"] },
        { resource: "credential_scans", actions: ["read"] },
        // Messaging (collaborator — DM assigned PM only)
        { resource: "messaging", actions: ["read"] },
        { resource: "messaging_dm", actions: ["read", "write"] },
        { resource: "messaging_message", actions: ["read", "write"] },
        // Teams (collaborator — read own team only)
        { resource: "teams", actions: ["read"] },
        { resource: "team_members", actions: ["read"] },
    ],
};

// ─── DB-backed Permission Grant shape (mirrors permission_grants table) ───
export interface DbPermissionGrant {
    role_definition_id: string;
    resource: string;
    action: string;
    scope_type: string;
    scope_id: string | null;
    effect: "allow" | "deny";
    conditions: Record<string, unknown> | null;
}

// ─── Permission check: DB grants first, static fallback ───

export function hasPermission(
    level: PermissionLevel,
    resource: string,
    action: "read" | "write" | "delete" | "manage",
    options?: { scopeId?: string; dbGrants?: DbPermissionGrant[] }
): boolean {
    // If DB grants are provided, check them first (allows deny rules)
    if (options?.dbGrants && options.dbGrants.length > 0) {
        const denied = options.dbGrants.some(
            (g) =>
                g.effect === "deny" &&
                (g.resource === "*" || g.resource === resource) &&
                g.action === action
        );
        if (denied) return false;

        const allowed = options.dbGrants.some(
            (g) =>
                g.effect === "allow" &&
                (g.resource === "*" || g.resource === resource) &&
                g.action === action
        );
        if (allowed) return true;

        // DB grants exist but none match — fall through to static matrix
    }

    // Static fallback: check the hardcoded PERMISSION_MATRIX
    const permissions = PERMISSION_MATRIX[level];
    const result = permissions.some(
        (p) => (p.resource === "*" || p.resource === resource) && p.actions.includes(action)
    );
    return result;
}

// ─── Batch check: resolve all permissions for a role from DB grants ───

export function resolvePermissionsFromGrants(grants: DbPermissionGrant[]): Permission[] {
    const byResource = new Map<string, Set<string>>();
    const denied = new Map<string, Set<string>>();

    for (const g of grants) {
        if (g.effect === "deny") {
            const set = denied.get(g.resource) ?? new Set();
            set.add(g.action);
            denied.set(g.resource, set);
        } else {
            const set = byResource.get(g.resource) ?? new Set();
            set.add(g.action);
            byResource.set(g.resource, set);
        }
    }

    // Remove denied actions
    for (const [resource, actions] of denied) {
        const allowed = byResource.get(resource);
        if (allowed) {
            for (const a of actions) allowed.delete(a);
            if (allowed.size === 0) byResource.delete(resource);
        }
    }

    return Array.from(byResource.entries()).map(([resource, actions]) => ({
        resource,
        actions: Array.from(actions) as Permission["actions"],
    }));
}

// ─── Field-Level Permission Masks ───
// Sensitive fields that require elevated permissions to view.
// Fields not in this map are visible to all tiers with resource read access.
export const FIELD_VISIBILITY_MASKS: Record<string, PermissionLevel[]> = {
    // Financial fields — exec + director + pm only
    hourly_rate: ["exec", "director", "pm"],
    internal_rate: ["exec", "director"],
    cost_rate: ["exec", "director", "pm"],
    margin: ["exec", "director"],
    margin_percent: ["exec", "director"],
    profit: ["exec", "director"],
    internal_cost: ["exec", "director"],
    vendor_cost: ["exec", "director", "pm"],
    markup: ["exec", "director"],
    payroll_rate: ["exec"],
    overtime_rate: ["exec", "director", "pm"],
    // PII fields — exec only (director excluded for data minimization)
    ssn: ["exec"],
    tax_id: ["exec"],
    bank_account: ["exec"],
    salary: ["exec"],
    compensation: ["exec"],
};

export function isFieldVisible(level: PermissionLevel, fieldName: string): boolean {
    const allowedLevels = FIELD_VISIBILITY_MASKS[fieldName];
    if (!allowedLevels) return true; // No restriction
    return allowedLevels.includes(level);
}

export function maskSensitiveFields<T extends Record<string, unknown>>(
    data: T,
    level: PermissionLevel
): T {
    const masked = { ...data };
    for (const key of Object.keys(masked)) {
        if (!isFieldVisible(level, key)) {
            (masked as Record<string, unknown>)[key] = null;
        }
    }
    return masked;
}

/**
 * Kill Switch — auto-revoke external access 48hrs post Load-Out
 */
export function shouldRevokeAccess(
    userLevel: PermissionLevel,
    projectLoadOutDate: string | null
): boolean {
    // Internal roles retain access post-load-out
    if (
        userLevel === "exec" ||
        userLevel === "director" ||
        userLevel === "pm" ||
        userLevel === "member"
    )
        return false;
    if (!projectLoadOutDate) return false;

    const loadOut = new Date(projectLoadOutDate);
    const now = new Date();
    const hoursElapsed = (now.getTime() - loadOut.getTime()) / (1000 * 60 * 60);
    return hoursElapsed >= 48;
}
