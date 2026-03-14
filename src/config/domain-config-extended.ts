/* ═══════════════════════════════════════════════════════════════
   DOMAIN CONFIGURATION (EXTENDED) — L1c 100% Coverage
   ═══════════════════════════════════════════════════════════════
   
   Supplemental enum maps for all PostgreSQL enum types not yet
   covered by domain-config.ts. Uses `as const` pattern for
   self-contained type inference.
   ═══════════════════════════════════════════════════════════════ */

type Variant = "default" | "secondary" | "destructive" | "ghost" | "info" | "success" | "warning";

interface EnumEntry {
    value: string;
    label: string;
    variant: Variant;
}

function toMap<T extends readonly EnumEntry[]>(entries: T): Record<string, EnumEntry> {
    return Object.fromEntries(entries.map((e) => [e.value, e]));
}

// ─── 003: Production Lifecycle ──────────────────────────────

export const ACTIVATION_STATUSES = [
    { value: "planning", label: "Planning", variant: "ghost" as const },
    { value: "design", label: "Design", variant: "info" as const },
    { value: "build", label: "Build", variant: "warning" as const },
    { value: "installed", label: "Installed", variant: "default" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "struck", label: "Struck", variant: "secondary" as const },
    { value: "stored", label: "Stored", variant: "ghost" as const },
] as const;
export const ACTIVATION_STATUS_MAP = toMap(ACTIVATION_STATUSES);

export const ACTIVITY_STATUSES = [
    { value: "planned", label: "Planned", variant: "ghost" as const },
    { value: "ready", label: "Ready", variant: "info" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "paused", label: "Paused", variant: "warning" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const ACTIVITY_STATUS_MAP = toMap(ACTIVITY_STATUSES);

export const ACTIVITY_TYPES = [
    { value: "performance", label: "Performance", variant: "default" as const },
    { value: "presentation", label: "Presentation", variant: "info" as const },
    { value: "demo", label: "Demo", variant: "info" as const },
    { value: "sampling", label: "Sampling", variant: "default" as const },
    { value: "photo_op", label: "Photo Op", variant: "secondary" as const },
    { value: "game", label: "Game", variant: "warning" as const },
    { value: "workshop", label: "Workshop", variant: "info" as const },
    { value: "meet_greet", label: "Meet & Greet", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const ACTIVITY_TYPE_MAP = toMap(ACTIVITY_TYPES);

export const DEPARTMENTS = [
    { value: "production", label: "Production", variant: "default" as const },
    { value: "construction", label: "Construction", variant: "default" as const },
    { value: "technical", label: "Technical", variant: "info" as const },
    { value: "fabrication", label: "Fabrication", variant: "warning" as const },
    { value: "print", label: "Print", variant: "secondary" as const },
    { value: "scenic", label: "Scenic", variant: "default" as const },
    { value: "props", label: "Props", variant: "default" as const },
    { value: "av", label: "AV", variant: "info" as const },
    { value: "lighting", label: "Lighting", variant: "warning" as const },
    { value: "rigging", label: "Rigging", variant: "warning" as const },
    { value: "food_beverage", label: "Food & Beverage", variant: "default" as const },
    { value: "staffing", label: "Staffing", variant: "default" as const },
    { value: "logistics", label: "Logistics", variant: "info" as const },
    { value: "finance", label: "Finance", variant: "secondary" as const },
    { value: "creative", label: "Creative", variant: "default" as const },
] as const;
export const DEPARTMENT_MAP = toMap(DEPARTMENTS);

export const PROCUREMENT_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "sent", label: "Sent", variant: "info" as const },
    { value: "acknowledged", label: "Acknowledged", variant: "info" as const },
    { value: "in_progress", label: "In Progress", variant: "default" as const },
    { value: "shipped", label: "Shipped", variant: "info" as const },
    { value: "received", label: "Received", variant: "success" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
    { value: "disputed", label: "Disputed", variant: "destructive" as const },
] as const;
export const PROCUREMENT_STATUS_MAP = toMap(PROCUREMENT_STATUSES);

export const EMPLOYMENT_TYPES = [
    { value: "employee", label: "Employee", variant: "default" as const },
    { value: "contractor", label: "Contractor", variant: "info" as const },
    { value: "freelance", label: "Freelance", variant: "info" as const },
    { value: "temp", label: "Temp", variant: "warning" as const },
    { value: "intern", label: "Intern", variant: "secondary" as const },
    { value: "volunteer", label: "Volunteer", variant: "ghost" as const },
] as const;
export const EMPLOYMENT_TYPE_MAP = toMap(EMPLOYMENT_TYPES);

export const CREW_STATUSES = [
    { value: "active", label: "Active", variant: "success" as const },
    { value: "inactive", label: "Inactive", variant: "ghost" as const },
    { value: "on_leave", label: "On Leave", variant: "warning" as const },
    { value: "terminated", label: "Terminated", variant: "destructive" as const },
    { value: "do_not_rehire", label: "Do Not Rehire", variant: "destructive" as const },
] as const;
export const CREW_STATUS_MAP = toMap(CREW_STATUSES);

export const SHIFT_STATUSES = [
    { value: "scheduled", label: "Scheduled", variant: "ghost" as const },
    { value: "confirmed", label: "Confirmed", variant: "info" as const },
    { value: "checked_in", label: "Checked In", variant: "success" as const },
    { value: "on_break", label: "On Break", variant: "warning" as const },
    { value: "checked_out", label: "Checked Out", variant: "secondary" as const },
    { value: "no_show", label: "No Show", variant: "destructive" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const SHIFT_STATUS_MAP = toMap(SHIFT_STATUSES);

export const ASSET_OWNERSHIP_TYPES = [
    { value: "owned", label: "Owned", variant: "success" as const },
    { value: "rental", label: "Rental", variant: "info" as const },
    { value: "client_provided", label: "Client Provided", variant: "default" as const },
    { value: "vendor_provided", label: "Vendor Provided", variant: "default" as const },
] as const;
export const ASSET_OWNERSHIP_MAP = toMap(ASSET_OWNERSHIP_TYPES);

export const ASSET_ASSIGNMENT_STATUSES = [
    { value: "reserved", label: "Reserved", variant: "info" as const },
    { value: "checked_out", label: "Checked Out", variant: "warning" as const },
    { value: "in_use", label: "In Use", variant: "success" as const },
    { value: "returned", label: "Returned", variant: "secondary" as const },
    { value: "damaged", label: "Damaged", variant: "destructive" as const },
    { value: "lost", label: "Lost", variant: "destructive" as const },
] as const;
export const ASSET_ASSIGNMENT_STATUS_MAP = toMap(ASSET_ASSIGNMENT_STATUSES);

export const SHIPMENT_TYPES = [
    { value: "outbound", label: "Outbound", variant: "info" as const },
    { value: "inbound", label: "Inbound", variant: "success" as const },
    { value: "transfer", label: "Transfer", variant: "default" as const },
    { value: "return", label: "Return", variant: "warning" as const },
] as const;
export const SHIPMENT_TYPE_MAP = toMap(SHIPMENT_TYPES);

export const SHIPMENT_PRIORITIES = [
    { value: "standard", label: "Standard", variant: "ghost" as const },
    { value: "expedited", label: "Expedited", variant: "info" as const },
    { value: "rush", label: "Rush", variant: "warning" as const },
    { value: "hot", label: "Hot", variant: "destructive" as const },
] as const;
export const SHIPMENT_PRIORITY_MAP = toMap(SHIPMENT_PRIORITIES);

export const VEHICLE_STATUSES = [
    { value: "available", label: "Available", variant: "success" as const },
    { value: "in_use", label: "In Use", variant: "info" as const },
    { value: "maintenance", label: "Maintenance", variant: "warning" as const },
    { value: "out_of_service", label: "Out of Service", variant: "destructive" as const },
] as const;
export const VEHICLE_STATUS_MAP = toMap(VEHICLE_STATUSES);

export const VEHICLE_OWNERSHIP_TYPES = [
    { value: "owned", label: "Owned", variant: "success" as const },
    { value: "leased", label: "Leased", variant: "info" as const },
    { value: "rental", label: "Rental", variant: "default" as const },
] as const;
export const VEHICLE_OWNERSHIP_MAP = toMap(VEHICLE_OWNERSHIP_TYPES);

export const BUDGET_CATEGORIES = [
    { value: "labor", label: "Labor", variant: "default" as const },
    { value: "materials", label: "Materials", variant: "default" as const },
    { value: "equipment_rental", label: "Equipment Rental", variant: "info" as const },
    { value: "equipment_purchase", label: "Equipment Purchase", variant: "info" as const },
    { value: "fabrication", label: "Fabrication", variant: "warning" as const },
    { value: "print", label: "Print", variant: "default" as const },
    { value: "av", label: "AV", variant: "info" as const },
    { value: "lighting", label: "Lighting", variant: "default" as const },
    { value: "scenic", label: "Scenic", variant: "default" as const },
    { value: "travel", label: "Travel", variant: "secondary" as const },
    { value: "lodging", label: "Lodging", variant: "secondary" as const },
    { value: "per_diem", label: "Per Diem", variant: "secondary" as const },
    { value: "shipping", label: "Shipping", variant: "info" as const },
    { value: "trucking", label: "Trucking", variant: "info" as const },
    { value: "venue", label: "Venue", variant: "default" as const },
    { value: "permits", label: "Permits", variant: "warning" as const },
    { value: "insurance", label: "Insurance", variant: "warning" as const },
    { value: "talent", label: "Talent", variant: "default" as const },
    { value: "catering", label: "Catering", variant: "default" as const },
    { value: "staffing", label: "Staffing", variant: "default" as const },
    { value: "security", label: "Security", variant: "warning" as const },
    { value: "contingency", label: "Contingency", variant: "ghost" as const },
    { value: "overhead", label: "Overhead", variant: "ghost" as const },
    { value: "markup", label: "Markup", variant: "secondary" as const },
] as const;
export const BUDGET_CATEGORY_MAP = toMap(BUDGET_CATEGORIES);

export const EXPENSE_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "reimbursed", label: "Reimbursed", variant: "success" as const },
] as const;
export const EXPENSE_STATUS_MAP = toMap(EXPENSE_STATUSES);

export const PAYMENT_METHODS = [
    { value: "corporate_card", label: "Corporate Card", variant: "default" as const },
    { value: "personal_card", label: "Personal Card", variant: "default" as const },
    { value: "cash", label: "Cash", variant: "warning" as const },
    { value: "check", label: "Check", variant: "default" as const },
    { value: "wire", label: "Wire", variant: "info" as const },
    { value: "ach", label: "ACH", variant: "info" as const },
] as const;
export const PAYMENT_METHOD_MAP = toMap(PAYMENT_METHODS);

export const INVOICE_TYPES = [
    { value: "vendor", label: "Vendor", variant: "default" as const },
    { value: "client", label: "Client", variant: "info" as const },
] as const;
export const INVOICE_TYPE_MAP = toMap(INVOICE_TYPES);

export const TIME_ENTRY_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "processed", label: "Processed", variant: "success" as const },
] as const;
export const TIME_ENTRY_STATUS_MAP = toMap(TIME_ENTRY_STATUSES);

export const PAYROLL_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "processing", label: "Processing", variant: "info" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
] as const;
export const PAYROLL_STATUS_MAP = toMap(PAYROLL_STATUSES);

export const INCIDENT_TYPES = [
    { value: "safety", label: "Safety", variant: "destructive" as const },
    { value: "injury", label: "Injury", variant: "destructive" as const },
    { value: "property_damage", label: "Property Damage", variant: "warning" as const },
    { value: "theft", label: "Theft", variant: "destructive" as const },
    { value: "security", label: "Security", variant: "warning" as const },
    { value: "weather", label: "Weather", variant: "info" as const },
    { value: "equipment_failure", label: "Equipment Failure", variant: "warning" as const },
    { value: "vendor_issue", label: "Vendor Issue", variant: "warning" as const },
    { value: "client_complaint", label: "Client Complaint", variant: "warning" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const INCIDENT_TYPE_MAP = toMap(INCIDENT_TYPES);

export const INCIDENT_STATUSES = [
    { value: "reported", label: "Reported", variant: "warning" as const },
    { value: "investigating", label: "Investigating", variant: "info" as const },
    { value: "pending_action", label: "Pending Action", variant: "warning" as const },
    { value: "resolved", label: "Resolved", variant: "success" as const },
    { value: "closed", label: "Closed", variant: "ghost" as const },
] as const;
export const INCIDENT_STATUS_MAP = toMap(INCIDENT_STATUSES);

export const SOP_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "under_review", label: "Under Review", variant: "warning" as const },
    { value: "superseded", label: "Superseded", variant: "secondary" as const },
    { value: "archived", label: "Archived", variant: "ghost" as const },
] as const;
export const SOP_STATUS_MAP = toMap(SOP_STATUSES);

export const CHECKLIST_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "overdue", label: "Overdue", variant: "destructive" as const },
] as const;
export const CHECKLIST_STATUS_MAP = toMap(CHECKLIST_STATUSES);

export const MILESTONE_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "overdue", label: "Overdue", variant: "destructive" as const },
] as const;
export const MILESTONE_STATUS_MAP = toMap(MILESTONE_STATUSES);

export const DELIVERABLE_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
] as const;
export const DELIVERABLE_STATUS_MAP = toMap(DELIVERABLE_STATUSES);

export const AVAILABILITY_STATUSES = [
    { value: "available", label: "Available", variant: "success" as const },
    { value: "unavailable", label: "Unavailable", variant: "destructive" as const },
    { value: "tentative", label: "Tentative", variant: "warning" as const },
    { value: "booked", label: "Booked", variant: "info" as const },
] as const;
export const AVAILABILITY_STATUS_MAP = toMap(AVAILABILITY_STATUSES);

export const ASSIGNMENT_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "confirmed", label: "Confirmed", variant: "info" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const ASSIGNMENT_STATUS_MAP = toMap(ASSIGNMENT_STATUSES);

export const RATE_TYPES = [
    { value: "hourly", label: "Hourly", variant: "default" as const },
    { value: "daily", label: "Daily", variant: "default" as const },
    { value: "weekly", label: "Weekly", variant: "default" as const },
    { value: "flat", label: "Flat", variant: "info" as const },
] as const;
export const RATE_TYPE_MAP = toMap(RATE_TYPES);

export const EVENT_TYPES = [
    { value: "show", label: "Show", variant: "success" as const },
    { value: "rehearsal", label: "Rehearsal", variant: "info" as const },
    { value: "setup", label: "Setup", variant: "warning" as const },
    { value: "strike", label: "Strike", variant: "warning" as const },
    { value: "meeting", label: "Meeting", variant: "default" as const },
    { value: "walkthrough", label: "Walkthrough", variant: "default" as const },
    { value: "training", label: "Training", variant: "info" as const },
    { value: "press", label: "Press", variant: "secondary" as const },
    { value: "vip", label: "VIP", variant: "default" as const },
] as const;
export const EVENT_TYPE_MAP = toMap(EVENT_TYPES);

export const EVENT_STATUSES = [
    { value: "scheduled", label: "Scheduled", variant: "ghost" as const },
    { value: "confirmed", label: "Confirmed", variant: "info" as const },
    { value: "in_progress", label: "In Progress", variant: "success" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
    { value: "postponed", label: "Postponed", variant: "warning" as const },
] as const;
export const EVENT_STATUS_MAP = toMap(EVENT_STATUSES);

export const PRODUCTION_PHASES = [
    { value: "discovery", label: "Discovery", variant: "ghost" as const },
    { value: "design", label: "Design", variant: "info" as const },
    { value: "pre_production", label: "Pre-Production", variant: "info" as const },
    { value: "procurement", label: "Procurement", variant: "default" as const },
    { value: "fabrication", label: "Fabrication", variant: "warning" as const },
    { value: "logistics", label: "Logistics", variant: "default" as const },
    { value: "load_in", label: "Load-In", variant: "warning" as const },
    { value: "rehearsal", label: "Rehearsal", variant: "info" as const },
    { value: "show", label: "Show", variant: "success" as const },
    { value: "strike", label: "Strike", variant: "warning" as const },
    { value: "load_out", label: "Load-Out", variant: "ghost" as const },
    { value: "wrap", label: "Wrap", variant: "secondary" as const },
] as const;
export const PRODUCTION_PHASE_MAP = toMap(PRODUCTION_PHASES);

export const PROJECT_TYPES = [
    { value: "tour", label: "Tour", variant: "default" as const },
    { value: "festival", label: "Festival", variant: "success" as const },
    { value: "activation", label: "Activation", variant: "info" as const },
    { value: "installation", label: "Installation", variant: "default" as const },
    { value: "broadcast", label: "Broadcast", variant: "info" as const },
    { value: "corporate", label: "Corporate", variant: "secondary" as const },
    { value: "retail", label: "Retail", variant: "default" as const },
    { value: "experiential", label: "Experiential", variant: "default" as const },
] as const;
export const PROJECT_TYPE_MAP = toMap(PROJECT_TYPES);

// ─── 004: CRM ───────────────────────────────────────────────

export const LEAD_STATUSES = [
    { value: "new", label: "New", variant: "info" as const },
    { value: "contacted", label: "Contacted", variant: "default" as const },
    { value: "qualified", label: "Qualified", variant: "info" as const },
    { value: "proposal_sent", label: "Proposal Sent", variant: "warning" as const },
    { value: "won", label: "Won", variant: "success" as const },
    { value: "lost", label: "Lost", variant: "destructive" as const },
    { value: "nurturing", label: "Nurturing", variant: "secondary" as const },
] as const;
export const LEAD_STATUS_MAP = toMap(LEAD_STATUSES);

export const PROJECT_TYPE_INTERESTS = [
    { value: "brand_activation", label: "Brand Activation", variant: "default" as const },
    { value: "stage_set_design", label: "Stage/Set Design", variant: "default" as const },
    { value: "immersive_installation", label: "Immersive Installation", variant: "info" as const },
    { value: "touring_production", label: "Touring Production", variant: "default" as const },
    { value: "corporate_event", label: "Corporate Event", variant: "secondary" as const },
    { value: "festival_production", label: "Festival Production", variant: "success" as const },
    { value: "broadcast_studio", label: "Broadcast/Studio", variant: "info" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const PROJECT_TYPE_INTEREST_MAP = toMap(PROJECT_TYPE_INTERESTS);

export const BUDGET_RANGES = [
    { value: "under_50k", label: "Under $50K", variant: "ghost" as const },
    { value: "50k_150k", label: "$50K–$150K", variant: "default" as const },
    { value: "150k_500k", label: "$150K–$500K", variant: "info" as const },
    { value: "500k_1m", label: "$500K–$1M", variant: "warning" as const },
    { value: "1m_5m", label: "$1M–$5M", variant: "success" as const },
    { value: "over_5m", label: "Over $5M", variant: "success" as const },
] as const;
export const BUDGET_RANGE_MAP = toMap(BUDGET_RANGES);

export const TESTIMONIAL_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "featured", label: "Featured", variant: "info" as const },
    { value: "archived", label: "Archived", variant: "secondary" as const },
] as const;
export const TESTIMONIAL_STATUS_MAP = toMap(TESTIMONIAL_STATUSES);

// ─── 005: Productive Features ───────────────────────────────

export const CUSTOM_FIELD_TYPES = [
    { value: "text", label: "Text", variant: "default" as const },
    { value: "number", label: "Number", variant: "default" as const },
    { value: "date", label: "Date", variant: "default" as const },
    { value: "datetime", label: "Date/Time", variant: "default" as const },
    { value: "boolean", label: "Boolean", variant: "default" as const },
    { value: "select", label: "Select", variant: "info" as const },
    { value: "multi_select", label: "Multi Select", variant: "info" as const },
    { value: "url", label: "URL", variant: "default" as const },
    { value: "email", label: "Email", variant: "default" as const },
    { value: "phone", label: "Phone", variant: "default" as const },
    { value: "currency", label: "Currency", variant: "default" as const },
    { value: "user", label: "User", variant: "info" as const },
    { value: "file", label: "File", variant: "default" as const },
] as const;
export const CUSTOM_FIELD_TYPE_MAP = toMap(CUSTOM_FIELD_TYPES);

export const ENTITY_TYPES = [
    { value: "project", label: "Project", variant: "default" as const },
    { value: "task", label: "Task", variant: "default" as const },
    { value: "deal", label: "Deal", variant: "info" as const },
    { value: "contact", label: "Contact", variant: "default" as const },
    { value: "company", label: "Company", variant: "default" as const },
    { value: "crew_member", label: "Crew Member", variant: "default" as const },
    { value: "asset", label: "Asset", variant: "default" as const },
    { value: "invoice", label: "Invoice", variant: "default" as const },
    { value: "proposal", label: "Proposal", variant: "default" as const },
    { value: "document", label: "Document", variant: "default" as const },
] as const;
export const ENTITY_TYPE_MAP = toMap(ENTITY_TYPES);

export const AUTOMATION_TRIGGERS = [
    { value: "created", label: "Created", variant: "info" as const },
    { value: "updated", label: "Updated", variant: "default" as const },
    { value: "status_changed", label: "Status Changed", variant: "warning" as const },
    { value: "assigned", label: "Assigned", variant: "default" as const },
    { value: "due_date_approaching", label: "Due Date Approaching", variant: "warning" as const },
    { value: "overdue", label: "Overdue", variant: "destructive" as const },
    { value: "field_changed", label: "Field Changed", variant: "default" as const },
    { value: "time_logged", label: "Time Logged", variant: "info" as const },
    { value: "budget_threshold", label: "Budget Threshold", variant: "warning" as const },
    { value: "scheduled", label: "Scheduled", variant: "ghost" as const },
] as const;
export const AUTOMATION_TRIGGER_MAP = toMap(AUTOMATION_TRIGGERS);

export const AUTOMATION_ACTIONS = [
    { value: "send_notification", label: "Send Notification", variant: "default" as const },
    { value: "send_email", label: "Send Email", variant: "default" as const },
    { value: "update_field", label: "Update Field", variant: "info" as const },
    { value: "create_task", label: "Create Task", variant: "info" as const },
    { value: "assign_user", label: "Assign User", variant: "default" as const },
    { value: "move_stage", label: "Move Stage", variant: "warning" as const },
    { value: "add_comment", label: "Add Comment", variant: "default" as const },
    { value: "webhook", label: "Webhook", variant: "info" as const },
    { value: "slack_message", label: "Slack Message", variant: "default" as const },
] as const;
export const AUTOMATION_ACTION_MAP = toMap(AUTOMATION_ACTIONS);

export const BOOKING_STATUSES = [
    { value: "tentative", label: "Tentative", variant: "warning" as const },
    { value: "confirmed", label: "Confirmed", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const BOOKING_STATUS_MAP = toMap(BOOKING_STATUSES);

export const BOOKING_TYPES = [
    { value: "project_work", label: "Project Work", variant: "default" as const },
    { value: "internal", label: "Internal", variant: "info" as const },
    { value: "time_off", label: "Time Off", variant: "warning" as const },
    { value: "training", label: "Training", variant: "info" as const },
    { value: "admin", label: "Admin", variant: "ghost" as const },
] as const;
export const BOOKING_TYPE_MAP = toMap(BOOKING_TYPES);

export const TIME_OFF_TYPES = [
    { value: "vacation", label: "Vacation", variant: "info" as const },
    { value: "sick", label: "Sick", variant: "warning" as const },
    { value: "personal", label: "Personal", variant: "default" as const },
    { value: "parental", label: "Parental", variant: "info" as const },
    { value: "bereavement", label: "Bereavement", variant: "ghost" as const },
    { value: "jury_duty", label: "Jury Duty", variant: "default" as const },
    { value: "holiday", label: "Holiday", variant: "success" as const },
    { value: "unpaid", label: "Unpaid", variant: "ghost" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const TIME_OFF_TYPE_MAP = toMap(TIME_OFF_TYPES);

export const TIME_OFF_STATUSES = [
    { value: "pending", label: "Pending", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "cancelled", label: "Cancelled", variant: "ghost" as const },
] as const;
export const TIME_OFF_STATUS_MAP = toMap(TIME_OFF_STATUSES);

export const PROPOSAL_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "sent", label: "Sent", variant: "info" as const },
    { value: "viewed", label: "Viewed", variant: "default" as const },
    { value: "accepted", label: "Accepted", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "warning" as const },
    { value: "revised", label: "Revised", variant: "info" as const },
] as const;
export const PROPOSAL_STATUS_MAP = toMap(PROPOSAL_STATUSES);

export const BILLING_TYPES = [
    { value: "fixed_price", label: "Fixed Price", variant: "default" as const },
    { value: "time_and_materials", label: "Time & Materials", variant: "info" as const },
    { value: "retainer", label: "Retainer", variant: "info" as const },
    { value: "non_billable", label: "Non-Billable", variant: "ghost" as const },
    { value: "milestone", label: "Milestone", variant: "warning" as const },
] as const;
export const BILLING_TYPE_MAP = toMap(BILLING_TYPES);

export const PAYMENT_STATUSES = [
    { value: "pending", label: "Pending", variant: "warning" as const },
    { value: "partial", label: "Partial", variant: "info" as const },
    { value: "paid", label: "Paid", variant: "success" as const },
    { value: "refunded", label: "Refunded", variant: "ghost" as const },
    { value: "failed", label: "Failed", variant: "destructive" as const },
] as const;
export const PAYMENT_STATUS_MAP = toMap(PAYMENT_STATUSES);

export const WIDGET_TYPES = [
    { value: "number", label: "Number", variant: "default" as const },
    { value: "chart_bar", label: "Bar Chart", variant: "info" as const },
    { value: "chart_line", label: "Line Chart", variant: "info" as const },
    { value: "chart_pie", label: "Pie Chart", variant: "info" as const },
    { value: "chart_donut", label: "Donut Chart", variant: "info" as const },
    { value: "table", label: "Table", variant: "default" as const },
    { value: "list", label: "List", variant: "default" as const },
    { value: "progress", label: "Progress", variant: "warning" as const },
    { value: "gauge", label: "Gauge", variant: "warning" as const },
    { value: "calendar", label: "Calendar", variant: "default" as const },
    { value: "timeline", label: "Timeline", variant: "default" as const },
] as const;
export const WIDGET_TYPE_MAP = toMap(WIDGET_TYPES);

// ─── 006: Workflow / Documents ──────────────────────────────

export const APPROVAL_STEP_TYPES = [
    { value: "single", label: "Single", variant: "default" as const },
    { value: "all", label: "All", variant: "info" as const },
    { value: "any", label: "Any", variant: "default" as const },
    { value: "sequential", label: "Sequential", variant: "warning" as const },
] as const;
export const APPROVAL_STEP_TYPE_MAP = toMap(APPROVAL_STEP_TYPES);

// ─── 007: SOW Lifecycle ─────────────────────────────────────

export const SOW_DELIVERABLE_STATUSES = [
    { value: "not_started", label: "Not Started", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "submitted", label: "Submitted", variant: "default" as const },
    { value: "client_review", label: "Client Review", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "invoiced", label: "Invoiced", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const SOW_DELIVERABLE_STATUS_MAP = toMap(SOW_DELIVERABLE_STATUSES);

export const SOW_DELIVERABLE_TYPES = [
    { value: "milestone", label: "Milestone", variant: "default" as const },
    { value: "fixed_fee", label: "Fixed Fee", variant: "info" as const },
    { value: "time_and_materials", label: "Time & Materials", variant: "info" as const },
    { value: "recurring", label: "Recurring", variant: "warning" as const },
    { value: "expense_passthrough", label: "Expense Passthrough", variant: "ghost" as const },
] as const;
export const SOW_DELIVERABLE_TYPE_MAP = toMap(SOW_DELIVERABLE_TYPES);

export const INVOICE_LINE_ITEM_TYPES = [
    { value: "deliverable", label: "Deliverable", variant: "default" as const },
    { value: "time_and_materials", label: "Time & Materials", variant: "info" as const },
    { value: "expense", label: "Expense", variant: "default" as const },
    { value: "change_order", label: "Change Order", variant: "warning" as const },
    { value: "discount", label: "Discount", variant: "success" as const },
    { value: "tax", label: "Tax", variant: "ghost" as const },
] as const;
export const INVOICE_LINE_ITEM_TYPE_MAP = toMap(INVOICE_LINE_ITEM_TYPES);

export const CLIENT_INVOICE_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "sent", label: "Sent", variant: "info" as const },
    { value: "overdue", label: "Overdue", variant: "destructive" as const },
    { value: "paid", label: "Paid", variant: "success" as const },
    { value: "void", label: "Void", variant: "ghost" as const },
] as const;
export const CLIENT_INVOICE_STATUS_MAP = toMap(CLIENT_INVOICE_STATUSES);

// ─── 008: Vendor / Contractor ───────────────────────────────

export const VENDOR_TYPES = [
    { value: "vendor", label: "Vendor", variant: "default" as const },
    { value: "subcontractor", label: "Subcontractor", variant: "info" as const },
    { value: "independent_contractor", label: "Independent Contractor", variant: "info" as const },
    { value: "freelancer", label: "Freelancer", variant: "default" as const },
    { value: "agency", label: "Agency", variant: "secondary" as const },
    { value: "supplier", label: "Supplier", variant: "default" as const },
] as const;
export const VENDOR_TYPE_MAP = toMap(VENDOR_TYPES);

export const VENDOR_STATUSES = [
    { value: "prospect", label: "Prospect", variant: "ghost" as const },
    { value: "onboarding", label: "Onboarding", variant: "info" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "suspended", label: "Suspended", variant: "warning" as const },
    { value: "archived", label: "Archived", variant: "ghost" as const },
] as const;
export const VENDOR_STATUS_MAP = toMap(VENDOR_STATUSES);

export const ONBOARDING_STATUSES = [
    { value: "invited", label: "Invited", variant: "ghost" as const },
    { value: "application_submitted", label: "Application Submitted", variant: "info" as const },
    { value: "under_review", label: "Under Review", variant: "warning" as const },
    { value: "documents_pending", label: "Documents Pending", variant: "warning" as const },
    { value: "documents_received", label: "Documents Received", variant: "info" as const },
    { value: "background_check", label: "Background Check", variant: "info" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "archived", label: "Archived", variant: "ghost" as const },
] as const;
export const ONBOARDING_STATUS_MAP = toMap(ONBOARDING_STATUSES);

export const COMPLIANCE_DOC_TYPES = [
    { value: "coi", label: "COI", variant: "default" as const },
    { value: "w9", label: "W-9", variant: "default" as const },
    { value: "w8ben", label: "W-8BEN", variant: "default" as const },
    { value: "nda", label: "NDA", variant: "info" as const },
    { value: "msa", label: "MSA", variant: "info" as const },
    { value: "business_license", label: "Business License", variant: "default" as const },
    { value: "workers_comp", label: "Workers Comp", variant: "warning" as const },
    { value: "auto_insurance", label: "Auto Insurance", variant: "default" as const },
    { value: "professional_license", label: "Professional License", variant: "default" as const },
    { value: "union_card", label: "Union Card", variant: "default" as const },
    { value: "background_check", label: "Background Check", variant: "info" as const },
    { value: "drug_test", label: "Drug Test", variant: "info" as const },
    { value: "safety_cert", label: "Safety Cert", variant: "warning" as const },
    { value: "equipment_cert", label: "Equipment Cert", variant: "default" as const },
    { value: "diversity_cert", label: "Diversity Cert", variant: "default" as const },
    { value: "tax_exempt", label: "Tax Exempt", variant: "default" as const },
    { value: "bank_info", label: "Bank Info", variant: "info" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const COMPLIANCE_DOC_TYPE_MAP = toMap(COMPLIANCE_DOC_TYPES);

export const COMPLIANCE_DOC_STATUSES = [
    { value: "not_submitted", label: "Not Submitted", variant: "ghost" as const },
    { value: "pending_review", label: "Pending Review", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "destructive" as const },
    { value: "expiring_soon", label: "Expiring Soon", variant: "warning" as const },
] as const;
export const COMPLIANCE_DOC_STATUS_MAP = toMap(COMPLIANCE_DOC_STATUSES);

export const WORK_ORDER_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "posted", label: "Posted", variant: "info" as const },
    { value: "bidding", label: "Bidding", variant: "info" as const },
    { value: "assigned", label: "Assigned", variant: "default" as const },
    { value: "accepted", label: "Accepted", variant: "success" as const },
    { value: "scheduled", label: "Scheduled", variant: "info" as const },
    { value: "in_progress", label: "In Progress", variant: "warning" as const },
    { value: "on_hold", label: "On Hold", variant: "warning" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "verified", label: "Verified", variant: "success" as const },
    { value: "invoiced", label: "Invoiced", variant: "info" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
    { value: "disputed", label: "Disputed", variant: "destructive" as const },
] as const;
export const WORK_ORDER_STATUS_MAP = toMap(WORK_ORDER_STATUSES);

export const DISPATCH_STATUSES = [
    { value: "unassigned", label: "Unassigned", variant: "ghost" as const },
    { value: "offered", label: "Offered", variant: "info" as const },
    { value: "accepted", label: "Accepted", variant: "success" as const },
    { value: "declined", label: "Declined", variant: "destructive" as const },
    { value: "en_route", label: "En Route", variant: "info" as const },
    { value: "on_site", label: "On Site", variant: "success" as const },
    { value: "in_progress", label: "In Progress", variant: "warning" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "no_show", label: "No Show", variant: "destructive" as const },
] as const;
export const DISPATCH_STATUS_MAP = toMap(DISPATCH_STATUSES);

export const BID_STATUSES = [
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "under_review", label: "Under Review", variant: "warning" as const },
    { value: "accepted", label: "Accepted", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "withdrawn", label: "Withdrawn", variant: "ghost" as const },
] as const;
export const BID_STATUS_MAP = toMap(BID_STATUSES);

export const VENDOR_REVIEW_TYPES = [
    { value: "project_completion", label: "Project Completion", variant: "default" as const },
    { value: "periodic", label: "Periodic", variant: "info" as const },
    { value: "incident", label: "Incident", variant: "destructive" as const },
    { value: "self_assessment", label: "Self Assessment", variant: "ghost" as const },
] as const;
export const VENDOR_REVIEW_TYPE_MAP = toMap(VENDOR_REVIEW_TYPES);

export const JOB_CHECKLIST_STATUSES = [
    { value: "not_started", label: "Not Started", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "skipped", label: "Skipped", variant: "secondary" as const },
    { value: "blocked", label: "Blocked", variant: "destructive" as const },
] as const;
export const JOB_CHECKLIST_STATUS_MAP = toMap(JOB_CHECKLIST_STATUSES);

// ─── 010: Service Requests ──────────────────────────────────

export const SERVICE_REQUEST_STATUSES = [
    { value: "new", label: "New", variant: "info" as const },
    { value: "acknowledged", label: "Acknowledged", variant: "default" as const },
    { value: "assessment_scheduled", label: "Assessment Scheduled", variant: "info" as const },
    { value: "quoted", label: "Quoted", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "converted", label: "Converted", variant: "success" as const },
    { value: "declined", label: "Declined", variant: "destructive" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
    { value: "archived", label: "Archived", variant: "ghost" as const },
] as const;
export const SERVICE_REQUEST_STATUS_MAP = toMap(SERVICE_REQUEST_STATUSES);

export const SERVICE_REQUEST_SOURCES = [
    { value: "client_portal", label: "Client Portal", variant: "default" as const },
    { value: "online_booking", label: "Online Booking", variant: "info" as const },
    { value: "phone", label: "Phone", variant: "default" as const },
    { value: "email", label: "Email", variant: "default" as const },
    { value: "walk_in", label: "Walk-In", variant: "default" as const },
    { value: "referral", label: "Referral", variant: "info" as const },
    { value: "social_media", label: "Social Media", variant: "info" as const },
    { value: "website_form", label: "Website Form", variant: "default" as const },
    { value: "vendor_portal", label: "Vendor Portal", variant: "default" as const },
    { value: "internal", label: "Internal", variant: "ghost" as const },
] as const;
export const SERVICE_REQUEST_SOURCE_MAP = toMap(SERVICE_REQUEST_SOURCES);

// ─── 011: Unified Workforce ────────────────────────────────

export const WORKER_LIFECYCLE_STATUSES = [
    { value: "prospect", label: "Prospect", variant: "ghost" as const },
    { value: "onboarding", label: "Onboarding", variant: "info" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "on_leave", label: "On Leave", variant: "warning" as const },
    { value: "suspended", label: "Suspended", variant: "destructive" as const },
    { value: "offboarding", label: "Offboarding", variant: "warning" as const },
    { value: "alumni", label: "Alumni", variant: "ghost" as const },
    { value: "do_not_engage", label: "Do Not Engage", variant: "destructive" as const },
] as const;
export const WORKER_LIFECYCLE_STATUS_MAP = toMap(WORKER_LIFECYCLE_STATUSES);

export const WORKER_CLASSIFICATIONS = [
    { value: "full_time_employee", label: "Full-Time Employee", variant: "success" as const },
    { value: "part_time_employee", label: "Part-Time Employee", variant: "default" as const },
    { value: "seasonal_employee", label: "Seasonal Employee", variant: "info" as const },
    { value: "contract_employee", label: "Contract Employee", variant: "info" as const },
    {
        value: "independent_contractor",
        label: "Independent Contractor",
        variant: "warning" as const,
    },
    { value: "subcontractor", label: "Subcontractor", variant: "warning" as const },
    { value: "freelancer", label: "Freelancer", variant: "default" as const },
    { value: "agency_worker", label: "Agency Worker", variant: "info" as const },
    { value: "temp_worker", label: "Temp Worker", variant: "ghost" as const },
    { value: "intern", label: "Intern", variant: "secondary" as const },
    { value: "volunteer", label: "Volunteer", variant: "ghost" as const },
] as const;
export const WORKER_CLASSIFICATION_MAP = toMap(WORKER_CLASSIFICATIONS);

export const TAX_CLASSIFICATIONS = [
    { value: "w2", label: "W-2", variant: "default" as const },
    { value: "w2_seasonal", label: "W-2 Seasonal", variant: "info" as const },
    { value: "1099", label: "1099", variant: "warning" as const },
    { value: "corp_to_corp", label: "Corp-to-Corp", variant: "info" as const },
    { value: "foreign", label: "Foreign", variant: "secondary" as const },
    { value: "exempt", label: "Exempt", variant: "ghost" as const },
] as const;
export const TAX_CLASSIFICATION_MAP = toMap(TAX_CLASSIFICATIONS);

export const LIFECYCLE_STEP_STATUSES = [
    { value: "not_started", label: "Not Started", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "skipped", label: "Skipped", variant: "secondary" as const },
    { value: "blocked", label: "Blocked", variant: "destructive" as const },
    { value: "overdue", label: "Overdue", variant: "destructive" as const },
] as const;
export const LIFECYCLE_STEP_STATUS_MAP = toMap(LIFECYCLE_STEP_STATUSES);

export const REVIEW_TARGET_TYPES = [
    { value: "employee", label: "Employee", variant: "default" as const },
    { value: "contractor", label: "Contractor", variant: "info" as const },
    { value: "vendor", label: "Vendor", variant: "default" as const },
    { value: "freelancer", label: "Freelancer", variant: "default" as const },
    { value: "intern", label: "Intern", variant: "secondary" as const },
] as const;
export const REVIEW_TARGET_TYPE_MAP = toMap(REVIEW_TARGET_TYPES);

export const COMPLIANCE_SCOPES = [
    { value: "employment", label: "Employment", variant: "default" as const },
    { value: "vendor", label: "Vendor", variant: "default" as const },
    { value: "universal", label: "Universal", variant: "info" as const },
] as const;
export const COMPLIANCE_SCOPE_MAP = toMap(COMPLIANCE_SCOPES);

export const IC_ASSESSMENT_METHODS = [
    { value: "irs_20_factor", label: "IRS 20-Factor", variant: "default" as const },
    { value: "abc_test", label: "ABC Test", variant: "default" as const },
    { value: "economic_reality", label: "Economic Reality", variant: "default" as const },
    { value: "common_law", label: "Common Law", variant: "default" as const },
    { value: "custom", label: "Custom", variant: "ghost" as const },
] as const;
export const IC_ASSESSMENT_METHOD_MAP = toMap(IC_ASSESSMENT_METHODS);

export const IC_ASSESSMENT_RESULTS = [
    { value: "properly_classified", label: "Properly Classified", variant: "success" as const },
    { value: "at_risk", label: "At Risk", variant: "warning" as const },
    { value: "misclassified", label: "Misclassified", variant: "destructive" as const },
    { value: "needs_review", label: "Needs Review", variant: "info" as const },
] as const;
export const IC_ASSESSMENT_RESULT_MAP = toMap(IC_ASSESSMENT_RESULTS);

// ─── 013: CRM Revenue Pipeline ─────────────────────────────

export const OPPORTUNITY_ACTIVITY_TYPES = [
    { value: "call", label: "Call", variant: "default" as const },
    { value: "email", label: "Email", variant: "default" as const },
    { value: "meeting", label: "Meeting", variant: "info" as const },
    { value: "site_visit", label: "Site Visit", variant: "info" as const },
    { value: "proposal", label: "Proposal", variant: "warning" as const },
    { value: "negotiation", label: "Negotiation", variant: "warning" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const OPPORTUNITY_ACTIVITY_TYPE_MAP = toMap(OPPORTUNITY_ACTIVITY_TYPES);

export const REVENUE_RECOGNITION_TYPES = [
    { value: "milestone", label: "Milestone", variant: "default" as const },
    { value: "percentage_of_completion", label: "% of Completion", variant: "info" as const },
    { value: "time_based", label: "Time-Based", variant: "default" as const },
    { value: "event_based", label: "Event-Based", variant: "info" as const },
] as const;
export const REVENUE_RECOGNITION_TYPE_MAP = toMap(REVENUE_RECOGNITION_TYPES);

// ─── 015: Creative / Brand / Campaign ──────────────────────

export const CREATIVE_REVIEW_GATES = [
    { value: "creative_director", label: "Creative Director", variant: "default" as const },
    { value: "brand_compliance", label: "Brand Compliance", variant: "info" as const },
    { value: "legal", label: "Legal", variant: "warning" as const },
    { value: "stakeholder", label: "Stakeholder", variant: "default" as const },
    { value: "client", label: "Client", variant: "info" as const },
] as const;
export const CREATIVE_REVIEW_GATE_MAP = toMap(CREATIVE_REVIEW_GATES);

export const CAMPAIGN_CHANNEL_TYPES = [
    { value: "social_meta", label: "Meta Social", variant: "info" as const },
    { value: "social_tiktok", label: "TikTok", variant: "info" as const },
    { value: "social_linkedin", label: "LinkedIn", variant: "info" as const },
    { value: "social_x", label: "X (Twitter)", variant: "info" as const },
    { value: "social_youtube", label: "YouTube", variant: "info" as const },
    { value: "email_marketing", label: "Email Marketing", variant: "default" as const },
    { value: "display", label: "Display", variant: "default" as const },
    { value: "search", label: "Search", variant: "default" as const },
    { value: "ooh", label: "OOH", variant: "default" as const },
    { value: "event", label: "Event", variant: "warning" as const },
    { value: "influencer", label: "Influencer", variant: "info" as const },
    { value: "print", label: "Print", variant: "default" as const },
    { value: "broadcast", label: "Broadcast", variant: "default" as const },
    { value: "pr", label: "PR", variant: "default" as const },
] as const;
export const CAMPAIGN_CHANNEL_TYPE_MAP = toMap(CAMPAIGN_CHANNEL_TYPES);

export const CAMPAIGN_CHANNEL_STATUSES = [
    { value: "planned", label: "Planned", variant: "ghost" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "paused", label: "Paused", variant: "warning" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
] as const;
export const CAMPAIGN_CHANNEL_STATUS_MAP = toMap(CAMPAIGN_CHANNEL_STATUSES);

export const CAMPAIGN_ASSET_ROLES = [
    { value: "hero", label: "Hero", variant: "success" as const },
    { value: "supporting", label: "Supporting", variant: "default" as const },
    { value: "variant", label: "Variant", variant: "info" as const },
    { value: "thumbnail", label: "Thumbnail", variant: "ghost" as const },
    { value: "cutdown", label: "Cutdown", variant: "secondary" as const },
    { value: "localized", label: "Localized", variant: "info" as const },
    { value: "template", label: "Template", variant: "ghost" as const },
] as const;
export const CAMPAIGN_ASSET_ROLE_MAP = toMap(CAMPAIGN_ASSET_ROLES);

export const GUIDELINE_SECTION_TYPES = [
    { value: "visual_identity", label: "Visual Identity", variant: "default" as const },
    { value: "color_system", label: "Color System", variant: "info" as const },
    { value: "typography", label: "Typography", variant: "default" as const },
    { value: "imagery", label: "Imagery", variant: "default" as const },
    { value: "iconography", label: "Iconography", variant: "default" as const },
    { value: "motion", label: "Motion", variant: "info" as const },
    { value: "voice_tone", label: "Voice & Tone", variant: "default" as const },
    { value: "application", label: "Application", variant: "default" as const },
    { value: "layout", label: "Layout", variant: "default" as const },
] as const;
export const GUIDELINE_SECTION_TYPE_MAP = toMap(GUIDELINE_SECTION_TYPES);

export const ATTRIBUTION_MODELS = [
    { value: "first_touch", label: "First Touch", variant: "default" as const },
    { value: "last_touch", label: "Last Touch", variant: "default" as const },
    { value: "linear", label: "Linear", variant: "info" as const },
    { value: "time_decay", label: "Time Decay", variant: "info" as const },
    { value: "position_based", label: "Position-Based", variant: "warning" as const },
] as const;
export const ATTRIBUTION_MODEL_MAP = toMap(ATTRIBUTION_MODELS);

export const KPI_METRIC_TYPES = [
    { value: "percentage", label: "Percentage", variant: "default" as const },
    { value: "count", label: "Count", variant: "default" as const },
    { value: "currency", label: "Currency", variant: "info" as const },
    { value: "ratio", label: "Ratio", variant: "default" as const },
    { value: "duration", label: "Duration", variant: "default" as const },
] as const;
export const KPI_METRIC_TYPE_MAP = toMap(KPI_METRIC_TYPES);

// ─── 016: Legal / Compliance / Finance / Procurement ────────

export const GL_ACCOUNT_TYPES = [
    { value: "asset", label: "Asset", variant: "success" as const },
    { value: "liability", label: "Liability", variant: "warning" as const },
    { value: "equity", label: "Equity", variant: "info" as const },
    { value: "revenue", label: "Revenue", variant: "success" as const },
    { value: "expense", label: "Expense", variant: "destructive" as const },
] as const;
export const GL_ACCOUNT_TYPE_MAP = toMap(GL_ACCOUNT_TYPES);

export const CAPEX_OPEX_TYPES = [
    { value: "capex", label: "CapEx", variant: "info" as const },
    { value: "opex", label: "OpEx", variant: "default" as const },
] as const;
export const CAPEX_OPEX_MAP = toMap(CAPEX_OPEX_TYPES);

export const INSURANCE_POLICY_TYPES = [
    { value: "general_liability", label: "General Liability", variant: "default" as const },
    {
        value: "professional_liability",
        label: "Professional Liability",
        variant: "default" as const,
    },
    { value: "workers_compensation", label: "Workers Compensation", variant: "warning" as const },
    { value: "auto_liability", label: "Auto Liability", variant: "default" as const },
    { value: "equipment_floater", label: "Equipment Floater", variant: "info" as const },
    { value: "event_liability", label: "Event Liability", variant: "default" as const },
    { value: "umbrella", label: "Umbrella", variant: "info" as const },
    { value: "property", label: "Property", variant: "default" as const },
    { value: "cyber", label: "Cyber", variant: "info" as const },
    { value: "directors_officers", label: "D&O", variant: "warning" as const },
    { value: "event_cancellation", label: "Event Cancellation", variant: "warning" as const },
    { value: "riggers_liability", label: "Riggers Liability", variant: "warning" as const },
    { value: "pollution", label: "Pollution", variant: "destructive" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const INSURANCE_POLICY_TYPE_MAP = toMap(INSURANCE_POLICY_TYPES);

export const INSURANCE_POLICY_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "pending_verification", label: "Pending Verification", variant: "warning" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "expiring_soon", label: "Expiring Soon", variant: "warning" as const },
    { value: "expired", label: "Expired", variant: "destructive" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
    { value: "suspended", label: "Suspended", variant: "destructive" as const },
] as const;
export const INSURANCE_POLICY_STATUS_MAP = toMap(INSURANCE_POLICY_STATUSES);

export const INSURANCE_HOLDER_TYPES = [
    { value: "organization", label: "Organization", variant: "default" as const },
    { value: "vendor", label: "Vendor", variant: "default" as const },
    { value: "location", label: "Location", variant: "default" as const },
    { value: "subcontractor", label: "Subcontractor", variant: "info" as const },
] as const;
export const INSURANCE_HOLDER_TYPE_MAP = toMap(INSURANCE_HOLDER_TYPES);

export const CONTRACT_CATEGORIES = [
    { value: "msa", label: "MSA", variant: "info" as const },
    { value: "sow", label: "SOW", variant: "default" as const },
    { value: "nda", label: "NDA", variant: "warning" as const },
    { value: "venue_agreement", label: "Venue Agreement", variant: "default" as const },
    { value: "sponsorship", label: "Sponsorship", variant: "info" as const },
    { value: "talent_agreement", label: "Talent Agreement", variant: "default" as const },
    { value: "vendor_agreement", label: "Vendor Agreement", variant: "default" as const },
    {
        value: "subcontractor_agreement",
        label: "Subcontractor Agreement",
        variant: "default" as const,
    },
    { value: "equipment_rental", label: "Equipment Rental", variant: "info" as const },
    { value: "license_agreement", label: "License Agreement", variant: "default" as const },
    { value: "insurance_addendum", label: "Insurance Addendum", variant: "warning" as const },
    { value: "employment", label: "Employment", variant: "default" as const },
    { value: "independent_contractor", label: "Independent Contractor", variant: "info" as const },
    { value: "partnership", label: "Partnership", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const CONTRACT_CATEGORY_MAP = toMap(CONTRACT_CATEGORIES);

export const CONTRACT_CONFIDENTIALITIES = [
    { value: "public", label: "Public", variant: "ghost" as const },
    { value: "internal", label: "Internal", variant: "default" as const },
    { value: "confidential", label: "Confidential", variant: "warning" as const },
    { value: "highly_confidential", label: "Highly Confidential", variant: "destructive" as const },
] as const;
export const CONTRACT_CONFIDENTIALITY_MAP = toMap(CONTRACT_CONFIDENTIALITIES);

export const CONTRACT_AMENDMENT_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "pending_review", label: "Pending Review", variant: "warning" as const },
    { value: "pending_signature", label: "Pending Signature", variant: "warning" as const },
    { value: "executed", label: "Executed", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "void", label: "Void", variant: "ghost" as const },
] as const;
export const CONTRACT_AMENDMENT_STATUS_MAP = toMap(CONTRACT_AMENDMENT_STATUSES);

export const CLAUSE_TYPES = [
    { value: "indemnification", label: "Indemnification", variant: "warning" as const },
    {
        value: "limitation_of_liability",
        label: "Limitation of Liability",
        variant: "warning" as const,
    },
    {
        value: "insurance_requirements",
        label: "Insurance Requirements",
        variant: "default" as const,
    },
    { value: "ip_ownership", label: "IP Ownership", variant: "info" as const },
    { value: "ip_usage_rights", label: "IP Usage Rights", variant: "info" as const },
    { value: "confidentiality", label: "Confidentiality", variant: "warning" as const },
    { value: "non_compete", label: "Non-Compete", variant: "warning" as const },
    { value: "force_majeure", label: "Force Majeure", variant: "destructive" as const },
    { value: "termination", label: "Termination", variant: "destructive" as const },
    { value: "payment_terms", label: "Payment Terms", variant: "default" as const },
    { value: "dispute_resolution", label: "Dispute Resolution", variant: "default" as const },
    { value: "governing_law", label: "Governing Law", variant: "default" as const },
    { value: "assignment", label: "Assignment", variant: "default" as const },
    { value: "warranty", label: "Warranty", variant: "info" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const CLAUSE_TYPE_MAP = toMap(CLAUSE_TYPES);

export const CLAUSE_RISK_LEVELS = [
    { value: "low", label: "Low", variant: "success" as const },
    { value: "medium", label: "Medium", variant: "warning" as const },
    { value: "high", label: "High", variant: "destructive" as const },
    { value: "critical", label: "Critical", variant: "destructive" as const },
] as const;
export const CLAUSE_RISK_LEVEL_MAP = toMap(CLAUSE_RISK_LEVELS);

export const OBLIGATION_PARTIES = [
    { value: "us", label: "Us", variant: "info" as const },
    { value: "counterparty", label: "Counterparty", variant: "default" as const },
    { value: "mutual", label: "Mutual", variant: "warning" as const },
    { value: "third_party", label: "Third Party", variant: "ghost" as const },
] as const;
export const OBLIGATION_PARTY_MAP = toMap(OBLIGATION_PARTIES);

export const OBLIGATION_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "fulfilled", label: "Fulfilled", variant: "success" as const },
    { value: "breached", label: "Breached", variant: "destructive" as const },
    { value: "waived", label: "Waived", variant: "secondary" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
] as const;
export const OBLIGATION_STATUS_MAP = toMap(OBLIGATION_STATUSES);

export const IP_ASSET_TYPES = [
    { value: "logo", label: "Logo", variant: "default" as const },
    { value: "trademark", label: "Trademark", variant: "info" as const },
    { value: "design", label: "Design", variant: "default" as const },
    { value: "photograph", label: "Photograph", variant: "default" as const },
    { value: "video", label: "Video", variant: "default" as const },
    { value: "music", label: "Music", variant: "default" as const },
    { value: "software", label: "Software", variant: "info" as const },
    { value: "content", label: "Content", variant: "default" as const },
    { value: "invention", label: "Invention", variant: "info" as const },
    { value: "trade_secret", label: "Trade Secret", variant: "warning" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const IP_ASSET_TYPE_MAP = toMap(IP_ASSET_TYPES);

export const IP_LICENSE_TYPES = [
    { value: "exclusive", label: "Exclusive", variant: "success" as const },
    { value: "non_exclusive", label: "Non-Exclusive", variant: "default" as const },
    { value: "sole", label: "Sole", variant: "info" as const },
    { value: "sublicensable", label: "Sublicensable", variant: "info" as const },
    { value: "work_for_hire", label: "Work for Hire", variant: "warning" as const },
    { value: "assignment", label: "Assignment", variant: "default" as const },
    { value: "creative_commons", label: "Creative Commons", variant: "ghost" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const IP_LICENSE_TYPE_MAP = toMap(IP_LICENSE_TYPES);

export const PERMIT_TYPES = [
    { value: "business_license", label: "Business License", variant: "default" as const },
    { value: "reseller_permit", label: "Reseller Permit", variant: "default" as const },
    { value: "temporary_event", label: "Temporary Event", variant: "info" as const },
    { value: "street_closure", label: "Street Closure", variant: "warning" as const },
    { value: "fire", label: "Fire", variant: "destructive" as const },
    { value: "building", label: "Building", variant: "default" as const },
    { value: "electrical", label: "Electrical", variant: "default" as const },
    { value: "noise", label: "Noise", variant: "warning" as const },
    { value: "health", label: "Health", variant: "default" as const },
    { value: "pyrotechnics", label: "Pyrotechnics", variant: "destructive" as const },
    { value: "drone", label: "Drone", variant: "info" as const },
    { value: "food_service", label: "Food Service", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const PERMIT_TYPE_MAP = toMap(PERMIT_TYPES);

export const PERMIT_STATUSES = [
    { value: "required", label: "Required", variant: "warning" as const },
    { value: "application_draft", label: "Application Draft", variant: "ghost" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "under_review", label: "Under Review", variant: "warning" as const },
    { value: "conditions_issued", label: "Conditions Issued", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "active", label: "Active", variant: "success" as const },
    { value: "expired", label: "Expired", variant: "destructive" as const },
    { value: "revoked", label: "Revoked", variant: "destructive" as const },
    { value: "renewed", label: "Renewed", variant: "success" as const },
    { value: "not_required", label: "Not Required", variant: "ghost" as const },
] as const;
export const PERMIT_STATUS_MAP = toMap(PERMIT_STATUSES);

export const PERMIT_ENTITY_TYPES = [
    { value: "organization", label: "Organization", variant: "default" as const },
    { value: "project", label: "Project", variant: "default" as const },
    { value: "location", label: "Location", variant: "default" as const },
    { value: "activation", label: "Activation", variant: "default" as const },
    { value: "event", label: "Event", variant: "default" as const },
] as const;
export const PERMIT_ENTITY_TYPE_MAP = toMap(PERMIT_ENTITY_TYPES);

export const ENGINEERING_APPROVAL_TYPES = [
    { value: "structural", label: "Structural", variant: "default" as const },
    { value: "electrical", label: "Electrical", variant: "default" as const },
    { value: "mechanical", label: "Mechanical", variant: "default" as const },
    { value: "fire_safety", label: "Fire Safety", variant: "destructive" as const },
    { value: "rigging", label: "Rigging", variant: "warning" as const },
] as const;
export const ENGINEERING_APPROVAL_TYPE_MAP = toMap(ENGINEERING_APPROVAL_TYPES);

export const ENGINEERING_APPROVAL_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "under_review", label: "Under Review", variant: "warning" as const },
    { value: "conditions_issued", label: "Conditions Issued", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "destructive" as const },
    { value: "inspection_required", label: "Inspection Required", variant: "warning" as const },
    { value: "inspection_passed", label: "Inspection Passed", variant: "success" as const },
    { value: "inspection_failed", label: "Inspection Failed", variant: "destructive" as const },
] as const;
export const ENGINEERING_APPROVAL_STATUS_MAP = toMap(ENGINEERING_APPROVAL_STATUSES);

export const COMPLIANCE_CHECKLIST_TYPES = [
    { value: "ada", label: "ADA", variant: "default" as const },
    { value: "osha", label: "OSHA", variant: "warning" as const },
    { value: "fire_safety", label: "Fire Safety", variant: "destructive" as const },
    { value: "health_safety", label: "Health & Safety", variant: "warning" as const },
    { value: "noise", label: "Noise", variant: "default" as const },
    { value: "environmental", label: "Environmental", variant: "info" as const },
    { value: "electrical_safety", label: "Electrical Safety", variant: "warning" as const },
    { value: "crowd_management", label: "Crowd Management", variant: "warning" as const },
    { value: "food_safety", label: "Food Safety", variant: "default" as const },
    { value: "alcohol_service", label: "Alcohol Service", variant: "default" as const },
    { value: "general", label: "General", variant: "ghost" as const },
] as const;
export const COMPLIANCE_CHECKLIST_TYPE_MAP = toMap(COMPLIANCE_CHECKLIST_TYPES);

export const COMPLIANCE_CHECKLIST_STATUSES = [
    { value: "not_started", label: "Not Started", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "failed", label: "Failed", variant: "destructive" as const },
    { value: "requires_remediation", label: "Requires Remediation", variant: "warning" as const },
    { value: "waived", label: "Waived", variant: "secondary" as const },
] as const;
export const COMPLIANCE_CHECKLIST_STATUS_MAP = toMap(COMPLIANCE_CHECKLIST_STATUSES);

export const ASSET_CERTIFICATION_TYPES = [
    { value: "structural_integrity", label: "Structural Integrity", variant: "default" as const },
    { value: "electrical_safety", label: "Electrical Safety", variant: "warning" as const },
    { value: "fire_resistance", label: "Fire Resistance", variant: "destructive" as const },
    { value: "rigging_inspection", label: "Rigging Inspection", variant: "warning" as const },
    { value: "pressure_vessel", label: "Pressure Vessel", variant: "default" as const },
    { value: "load_test", label: "Load Test", variant: "default" as const },
    { value: "calibration", label: "Calibration", variant: "info" as const },
    { value: "safety_inspection", label: "Safety Inspection", variant: "warning" as const },
    { value: "dot_inspection", label: "DOT Inspection", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const ASSET_CERTIFICATION_TYPE_MAP = toMap(ASSET_CERTIFICATION_TYPES);

export const ASSET_CERTIFICATION_STATUSES = [
    { value: "current", label: "Current", variant: "success" as const },
    { value: "expiring_soon", label: "Expiring Soon", variant: "warning" as const },
    { value: "expired", label: "Expired", variant: "destructive" as const },
    { value: "pending_inspection", label: "Pending Inspection", variant: "info" as const },
    { value: "failed", label: "Failed", variant: "destructive" as const },
] as const;
export const ASSET_CERTIFICATION_STATUS_MAP = toMap(ASSET_CERTIFICATION_STATUSES);

export const APPROVAL_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "revision_requested", label: "Revision Requested", variant: "warning" as const },
    { value: "escalated", label: "Escalated", variant: "warning" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
    { value: "delegated", label: "Delegated", variant: "info" as const },
] as const;
export const APPROVAL_STATUS_MAP = toMap(APPROVAL_STATUSES);

export const APPROVAL_ENTITY_TYPES = [
    { value: "budget", label: "Budget", variant: "default" as const },
    { value: "budget_line_item", label: "Budget Line Item", variant: "default" as const },
    { value: "change_order", label: "Change Order", variant: "warning" as const },
    { value: "purchase_order", label: "Purchase Order", variant: "default" as const },
    { value: "expense", label: "Expense", variant: "default" as const },
    { value: "payment", label: "Payment", variant: "default" as const },
    { value: "contract", label: "Contract", variant: "info" as const },
    { value: "permit_waiver", label: "Permit Waiver", variant: "warning" as const },
] as const;
export const APPROVAL_ENTITY_TYPE_MAP = toMap(APPROVAL_ENTITY_TYPES);

export const PAYMENT_APPROVAL_TYPES = [
    { value: "vendor_invoice", label: "Vendor Invoice", variant: "default" as const },
    { value: "expense_reimbursement", label: "Expense Reimbursement", variant: "default" as const },
    { value: "payroll", label: "Payroll", variant: "info" as const },
    { value: "advance", label: "Advance", variant: "warning" as const },
    { value: "refund", label: "Refund", variant: "ghost" as const },
] as const;
export const PAYMENT_APPROVAL_TYPE_MAP = toMap(PAYMENT_APPROVAL_TYPES);

export const REQUISITION_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "converted_to_po", label: "Converted to PO", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const REQUISITION_STATUS_MAP = toMap(REQUISITION_STATUSES);

export const REQUISITION_URGENCIES = [
    { value: "low", label: "Low", variant: "ghost" as const },
    { value: "normal", label: "Normal", variant: "default" as const },
    { value: "high", label: "High", variant: "warning" as const },
    { value: "critical", label: "Critical", variant: "destructive" as const },
] as const;
export const REQUISITION_URGENCY_MAP = toMap(REQUISITION_URGENCIES);

export const GOODS_RECEIPT_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "partial", label: "Partial", variant: "warning" as const },
    { value: "complete", label: "Complete", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "discrepancy", label: "Discrepancy", variant: "destructive" as const },
] as const;
export const GOODS_RECEIPT_STATUS_MAP = toMap(GOODS_RECEIPT_STATUSES);

export const THREE_WAY_MATCH_STATUSES = [
    { value: "not_applicable", label: "N/A", variant: "ghost" as const },
    { value: "pending_receipt", label: "Pending Receipt", variant: "warning" as const },
    { value: "pending_invoice", label: "Pending Invoice", variant: "warning" as const },
    { value: "matched", label: "Matched", variant: "success" as const },
    { value: "variance_flagged", label: "Variance Flagged", variant: "destructive" as const },
    { value: "override_approved", label: "Override Approved", variant: "info" as const },
] as const;
export const THREE_WAY_MATCH_STATUS_MAP = toMap(THREE_WAY_MATCH_STATUSES);

export const VENDOR_RISK_LEVELS = [
    { value: "low", label: "Low", variant: "success" as const },
    { value: "medium", label: "Medium", variant: "warning" as const },
    { value: "high", label: "High", variant: "destructive" as const },
    { value: "critical", label: "Critical", variant: "destructive" as const },
] as const;
export const VENDOR_RISK_LEVEL_MAP = toMap(VENDOR_RISK_LEVELS);

export const DEPENDENCY_TYPES = [
    { value: "hard_block", label: "Hard Block", variant: "destructive" as const },
    { value: "soft_warning", label: "Soft Warning", variant: "warning" as const },
] as const;
export const DEPENDENCY_TYPE_MAP = toMap(DEPENDENCY_TYPES);

export const DEPENDENCY_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "satisfied", label: "Satisfied", variant: "success" as const },
    { value: "waived", label: "Waived", variant: "secondary" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
    { value: "not_applicable", label: "N/A", variant: "ghost" as const },
] as const;
export const DEPENDENCY_STATUS_MAP = toMap(DEPENDENCY_STATUSES);

export const GOVERNANCE_DOMAINS = [
    { value: "legal", label: "Legal", variant: "warning" as const },
    { value: "compliance", label: "Compliance", variant: "info" as const },
    { value: "finance", label: "Finance", variant: "default" as const },
    { value: "procurement", label: "Procurement", variant: "default" as const },
] as const;
export const GOVERNANCE_DOMAIN_MAP = toMap(GOVERNANCE_DOMAINS);

export const GOVERNANCE_ACTIONS = [
    { value: "created", label: "Created", variant: "info" as const },
    { value: "updated", label: "Updated", variant: "default" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
    { value: "renewed", label: "Renewed", variant: "success" as const },
    { value: "waived", label: "Waived", variant: "secondary" as const },
    { value: "suspended", label: "Suspended", variant: "warning" as const },
    { value: "verified", label: "Verified", variant: "success" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "escalated", label: "Escalated", variant: "warning" as const },
    { value: "revoked", label: "Revoked", variant: "destructive" as const },
] as const;
export const GOVERNANCE_ACTION_MAP = toMap(GOVERNANCE_ACTIONS);

// ─── 017: Location Spatial Hierarchy ────────────────────────

export const LOCATION_TYPES = [
    { value: "venue", label: "Venue", variant: "default" as const },
    { value: "warehouse", label: "Warehouse", variant: "info" as const },
    { value: "office", label: "Office", variant: "default" as const },
    { value: "fabrication_shop", label: "Fabrication Shop", variant: "warning" as const },
    { value: "staging_area", label: "Staging Area", variant: "info" as const },
    { value: "hotel", label: "Hotel", variant: "default" as const },
    { value: "airport", label: "Airport", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const LOCATION_TYPE_MAP = toMap(LOCATION_TYPES);

export const LOCATION_OWNERSHIP_TYPES = [
    { value: "owned", label: "Owned", variant: "success" as const },
    { value: "leased", label: "Leased", variant: "info" as const },
    { value: "temporary", label: "Temporary", variant: "warning" as const },
    { value: "partner", label: "Partner", variant: "default" as const },
    { value: "client_provided", label: "Client Provided", variant: "default" as const },
] as const;
export const LOCATION_OWNERSHIP_MAP = toMap(LOCATION_OWNERSHIP_TYPES);

export const PROJECT_LOCATION_ROLES = [
    { value: "primary", label: "Primary", variant: "success" as const },
    { value: "secondary", label: "Secondary", variant: "default" as const },
    { value: "staging", label: "Staging", variant: "info" as const },
    { value: "storage", label: "Storage", variant: "ghost" as const },
    { value: "fabrication", label: "Fabrication", variant: "warning" as const },
    { value: "backup", label: "Backup", variant: "ghost" as const },
    { value: "load_in", label: "Load-In", variant: "info" as const },
    { value: "load_out", label: "Load-Out", variant: "info" as const },
] as const;
export const PROJECT_LOCATION_ROLE_MAP = toMap(PROJECT_LOCATION_ROLES);

export const SPACE_BOOKING_TYPES = [
    { value: "event", label: "Event", variant: "success" as const },
    { value: "rehearsal", label: "Rehearsal", variant: "info" as const },
    { value: "setup", label: "Setup", variant: "warning" as const },
    { value: "strike", label: "Strike", variant: "warning" as const },
    { value: "load_in", label: "Load-In", variant: "info" as const },
    { value: "load_out", label: "Load-Out", variant: "info" as const },
    { value: "maintenance", label: "Maintenance", variant: "ghost" as const },
    { value: "hold", label: "Hold", variant: "secondary" as const },
    { value: "site_visit", label: "Site Visit", variant: "default" as const },
    { value: "inspection", label: "Inspection", variant: "default" as const },
] as const;
export const SPACE_BOOKING_TYPE_MAP = toMap(SPACE_BOOKING_TYPES);

export const LOCATION_DOC_TYPES = [
    { value: "fire_cert", label: "Fire Certificate", variant: "destructive" as const },
    { value: "occupancy_permit", label: "Occupancy Permit", variant: "default" as const },
    { value: "ada_cert", label: "ADA Certificate", variant: "default" as const },
    { value: "health_dept", label: "Health Dept", variant: "default" as const },
    { value: "env_assessment", label: "Environmental Assessment", variant: "info" as const },
    { value: "insurance_cert", label: "Insurance Certificate", variant: "default" as const },
    { value: "engineering_cert", label: "Engineering Certificate", variant: "default" as const },
    { value: "noise_permit", label: "Noise Permit", variant: "warning" as const },
    { value: "alcohol_license", label: "Alcohol License", variant: "default" as const },
    { value: "building_permit", label: "Building Permit", variant: "default" as const },
    { value: "rigging_cert", label: "Rigging Certificate", variant: "warning" as const },
    { value: "electrical_cert", label: "Electrical Certificate", variant: "default" as const },
    { value: "plumbing_cert", label: "Plumbing Certificate", variant: "default" as const },
] as const;
export const LOCATION_DOC_TYPE_MAP = toMap(LOCATION_DOC_TYPES);

export const LOCATION_INSPECTION_TYPES = [
    { value: "fire", label: "Fire", variant: "destructive" as const },
    { value: "safety", label: "Safety", variant: "warning" as const },
    { value: "structural", label: "Structural", variant: "default" as const },
    { value: "electrical", label: "Electrical", variant: "default" as const },
    { value: "plumbing", label: "Plumbing", variant: "default" as const },
    { value: "ada", label: "ADA", variant: "default" as const },
    { value: "health", label: "Health", variant: "default" as const },
    { value: "environmental", label: "Environmental", variant: "info" as const },
    { value: "security", label: "Security", variant: "warning" as const },
    { value: "general", label: "General", variant: "ghost" as const },
] as const;
export const LOCATION_INSPECTION_TYPE_MAP = toMap(LOCATION_INSPECTION_TYPES);

export const LOCATION_COST_TYPES = [
    { value: "lease", label: "Lease", variant: "default" as const },
    { value: "rent", label: "Rent", variant: "default" as const },
    { value: "utilities", label: "Utilities", variant: "default" as const },
    { value: "maintenance", label: "Maintenance", variant: "warning" as const },
    { value: "insurance", label: "Insurance", variant: "default" as const },
    { value: "security", label: "Security", variant: "warning" as const },
    { value: "cleaning", label: "Cleaning", variant: "ghost" as const },
    { value: "taxes", label: "Taxes", variant: "default" as const },
    { value: "renovation", label: "Renovation", variant: "info" as const },
    { value: "equipment", label: "Equipment", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const LOCATION_COST_TYPE_MAP = toMap(LOCATION_COST_TYPES);

export const LOCATION_COST_FREQUENCIES = [
    { value: "one_time", label: "One-Time", variant: "default" as const },
    { value: "monthly", label: "Monthly", variant: "info" as const },
    { value: "quarterly", label: "Quarterly", variant: "info" as const },
    { value: "annual", label: "Annual", variant: "info" as const },
    { value: "per_event", label: "Per Event", variant: "warning" as const },
] as const;
export const LOCATION_COST_FREQUENCY_MAP = toMap(LOCATION_COST_FREQUENCIES);

export const LOCATION_CONTACT_ROLES = [
    { value: "venue_manager", label: "Venue Manager", variant: "default" as const },
    { value: "building_ops", label: "Building Ops", variant: "default" as const },
    { value: "security", label: "Security", variant: "warning" as const },
    { value: "fire_marshal", label: "Fire Marshal", variant: "destructive" as const },
    { value: "loading_dock", label: "Loading Dock", variant: "default" as const },
    { value: "catering", label: "Catering", variant: "default" as const },
    { value: "av_tech", label: "AV Tech", variant: "info" as const },
    { value: "facilities", label: "Facilities", variant: "default" as const },
    { value: "emergency", label: "Emergency", variant: "destructive" as const },
] as const;
export const LOCATION_CONTACT_ROLE_MAP = toMap(LOCATION_CONTACT_ROLES);

// ─── 018: User Lifecycle Identity ───────────────────────────

export const AUTH_METHODS = [
    { value: "password", label: "Password", variant: "default" as const },
    { value: "magic_link", label: "Magic Link", variant: "info" as const },
    { value: "oauth_google", label: "Google OAuth", variant: "info" as const },
    { value: "oauth_github", label: "GitHub OAuth", variant: "info" as const },
    { value: "oauth_azure", label: "Azure OAuth", variant: "info" as const },
    { value: "saml", label: "SAML", variant: "warning" as const },
    { value: "api_key", label: "API Key", variant: "default" as const },
    { value: "session_refresh", label: "Session Refresh", variant: "ghost" as const },
] as const;
export const AUTH_METHOD_MAP = toMap(AUTH_METHODS);

export const LOGIN_EVENT_TYPES = [
    { value: "login_success", label: "Login Success", variant: "success" as const },
    { value: "login_failure", label: "Login Failure", variant: "destructive" as const },
    { value: "logout", label: "Logout", variant: "ghost" as const },
    { value: "token_refresh", label: "Token Refresh", variant: "default" as const },
    { value: "mfa_challenge", label: "MFA Challenge", variant: "warning" as const },
    { value: "mfa_success", label: "MFA Success", variant: "success" as const },
    { value: "mfa_failure", label: "MFA Failure", variant: "destructive" as const },
    { value: "password_reset", label: "Password Reset", variant: "warning" as const },
    { value: "password_change", label: "Password Change", variant: "info" as const },
    { value: "account_locked", label: "Account Locked", variant: "destructive" as const },
] as const;
export const LOGIN_EVENT_TYPE_MAP = toMap(LOGIN_EVENT_TYPES);

export const RETENTION_ACTIONS = [
    { value: "anonymize", label: "Anonymize", variant: "warning" as const },
    { value: "purge", label: "Purge", variant: "destructive" as const },
    { value: "archive", label: "Archive", variant: "ghost" as const },
    { value: "retain", label: "Retain", variant: "success" as const },
] as const;
export const RETENTION_ACTION_MAP = toMap(RETENTION_ACTIONS);

export const PREFERENCE_CATEGORIES = [
    { value: "display", label: "Display", variant: "default" as const },
    { value: "notifications", label: "Notifications", variant: "info" as const },
    { value: "accessibility", label: "Accessibility", variant: "default" as const },
    { value: "privacy", label: "Privacy", variant: "warning" as const },
    { value: "integrations", label: "Integrations", variant: "info" as const },
] as const;
export const PREFERENCE_CATEGORY_MAP = toMap(PREFERENCE_CATEGORIES);

// ─── 019: Asset Inventory Logistics Warehousing ─────────────

export const ASSET_CLASSES = [
    { value: "capital_equipment", label: "Capital Equipment", variant: "info" as const },
    { value: "rental_equipment", label: "Rental Equipment", variant: "default" as const },
    { value: "consumable", label: "Consumable", variant: "ghost" as const },
    { value: "tool", label: "Tool", variant: "default" as const },
    { value: "safety_equipment", label: "Safety Equipment", variant: "warning" as const },
    { value: "scenic_element", label: "Scenic Element", variant: "default" as const },
    { value: "technology", label: "Technology", variant: "info" as const },
    { value: "vehicle", label: "Vehicle", variant: "default" as const },
    { value: "vendor_managed", label: "Vendor Managed", variant: "secondary" as const },
] as const;
export const ASSET_CLASS_MAP = toMap(ASSET_CLASSES);

export const WAREHOUSE_ZONE_TYPES = [
    { value: "receiving", label: "Receiving", variant: "info" as const },
    { value: "storage", label: "Storage", variant: "default" as const },
    { value: "staging_outbound", label: "Staging Outbound", variant: "warning" as const },
    { value: "staging_inbound", label: "Staging Inbound", variant: "info" as const },
    { value: "maintenance", label: "Maintenance", variant: "warning" as const },
    { value: "quarantine", label: "Quarantine", variant: "destructive" as const },
    { value: "hazmat", label: "Hazmat", variant: "destructive" as const },
    { value: "outdoor", label: "Outdoor", variant: "ghost" as const },
    { value: "cold_storage", label: "Cold Storage", variant: "info" as const },
    { value: "secure", label: "Secure", variant: "warning" as const },
] as const;
export const WAREHOUSE_ZONE_TYPE_MAP = toMap(WAREHOUSE_ZONE_TYPES);

export const WAREHOUSE_LOCATION_TYPES = [
    { value: "shelf", label: "Shelf", variant: "default" as const },
    { value: "floor", label: "Floor", variant: "default" as const },
    { value: "pallet", label: "Pallet", variant: "default" as const },
    { value: "cage", label: "Cage", variant: "warning" as const },
    { value: "outdoor", label: "Outdoor", variant: "ghost" as const },
    { value: "rack", label: "Rack", variant: "default" as const },
    { value: "bin", label: "Bin", variant: "default" as const },
] as const;
export const WAREHOUSE_LOCATION_TYPE_MAP = toMap(WAREHOUSE_LOCATION_TYPES);

export const SHIPMENT_ITEM_CONDITIONS = [
    { value: "new", label: "New", variant: "success" as const },
    { value: "excellent", label: "Excellent", variant: "success" as const },
    { value: "good", label: "Good", variant: "default" as const },
    { value: "fair", label: "Fair", variant: "warning" as const },
    { value: "needs_repair", label: "Needs Repair", variant: "destructive" as const },
    { value: "damaged", label: "Damaged", variant: "destructive" as const },
    { value: "missing", label: "Missing", variant: "destructive" as const },
] as const;
export const SHIPMENT_ITEM_CONDITION_MAP = toMap(SHIPMENT_ITEM_CONDITIONS);

export const SCAN_TYPES = [
    { value: "check_in", label: "Check In", variant: "success" as const },
    { value: "check_out", label: "Check Out", variant: "warning" as const },
    { value: "transfer", label: "Transfer", variant: "info" as const },
    { value: "count", label: "Count", variant: "default" as const },
    { value: "receive", label: "Receive", variant: "success" as const },
    { value: "ship", label: "Ship", variant: "info" as const },
    { value: "verify", label: "Verify", variant: "default" as const },
    { value: "damage", label: "Damage", variant: "destructive" as const },
] as const;
export const SCAN_TYPE_MAP = toMap(SCAN_TYPES);

export const SCAN_METHODS = [
    { value: "barcode", label: "Barcode", variant: "default" as const },
    { value: "qr_code", label: "QR Code", variant: "info" as const },
    { value: "rfid", label: "RFID", variant: "info" as const },
    { value: "nfc", label: "NFC", variant: "info" as const },
    { value: "manual", label: "Manual", variant: "ghost" as const },
] as const;
export const SCAN_METHOD_MAP = toMap(SCAN_METHODS);

export const LOGISTICS_EVENT_TYPES = [
    { value: "booked", label: "Booked", variant: "info" as const },
    { value: "picked_up", label: "Picked Up", variant: "info" as const },
    { value: "in_transit", label: "In Transit", variant: "warning" as const },
    { value: "customs_hold", label: "Customs Hold", variant: "destructive" as const },
    { value: "customs_cleared", label: "Customs Cleared", variant: "success" as const },
    { value: "cross_dock", label: "Cross Dock", variant: "default" as const },
    { value: "out_for_delivery", label: "Out for Delivery", variant: "info" as const },
    { value: "delivered", label: "Delivered", variant: "success" as const },
    { value: "exception", label: "Exception", variant: "destructive" as const },
    { value: "damage_reported", label: "Damage Reported", variant: "destructive" as const },
    { value: "returned", label: "Returned", variant: "ghost" as const },
] as const;
export const LOGISTICS_EVENT_TYPE_MAP = toMap(LOGISTICS_EVENT_TYPES);

export const DAMAGE_TYPES = [
    { value: "cosmetic", label: "Cosmetic", variant: "ghost" as const },
    { value: "functional", label: "Functional", variant: "warning" as const },
    { value: "structural", label: "Structural", variant: "destructive" as const },
    { value: "total_loss", label: "Total Loss", variant: "destructive" as const },
    { value: "missing", label: "Missing", variant: "destructive" as const },
] as const;
export const DAMAGE_TYPE_MAP = toMap(DAMAGE_TYPES);

export const MAINTENANCE_FREQUENCY_TYPES = [
    { value: "calendar", label: "Calendar", variant: "default" as const },
    { value: "usage_hours", label: "Usage Hours", variant: "info" as const },
    { value: "usage_miles", label: "Usage Miles", variant: "info" as const },
    { value: "event_count", label: "Event Count", variant: "default" as const },
] as const;
export const MAINTENANCE_FREQUENCY_TYPE_MAP = toMap(MAINTENANCE_FREQUENCY_TYPES);

export const MAINTENANCE_FREQUENCY_UNITS = [
    { value: "days", label: "Days", variant: "default" as const },
    { value: "weeks", label: "Weeks", variant: "default" as const },
    { value: "months", label: "Months", variant: "default" as const },
    { value: "years", label: "Years", variant: "default" as const },
    { value: "hours", label: "Hours", variant: "default" as const },
    { value: "miles", label: "Miles", variant: "default" as const },
    { value: "events", label: "Events", variant: "default" as const },
] as const;
export const MAINTENANCE_FREQUENCY_UNIT_MAP = toMap(MAINTENANCE_FREQUENCY_UNITS);

export const DEPRECIATION_METHODS = [
    { value: "straight_line", label: "Straight Line", variant: "default" as const },
    { value: "declining_balance", label: "Declining Balance", variant: "info" as const },
    { value: "units_of_production", label: "Units of Production", variant: "info" as const },
    { value: "sum_of_years", label: "Sum of Years", variant: "default" as const },
] as const;
export const DEPRECIATION_METHOD_MAP = toMap(DEPRECIATION_METHODS);

export const INVENTORY_AUDIT_TYPES = [
    { value: "full", label: "Full", variant: "default" as const },
    { value: "cycle", label: "Cycle", variant: "info" as const },
    { value: "spot", label: "Spot", variant: "warning" as const },
    { value: "annual", label: "Annual", variant: "default" as const },
] as const;
export const INVENTORY_AUDIT_TYPE_MAP = toMap(INVENTORY_AUDIT_TYPES);

export const DISPOSAL_METHODS = [
    { value: "sold", label: "Sold", variant: "success" as const },
    { value: "donated", label: "Donated", variant: "info" as const },
    { value: "scrapped", label: "Scrapped", variant: "ghost" as const },
    { value: "returned_to_vendor", label: "Returned to Vendor", variant: "default" as const },
    { value: "transferred", label: "Transferred", variant: "info" as const },
    { value: "insurance_claim", label: "Insurance Claim", variant: "warning" as const },
] as const;
export const DISPOSAL_METHOD_MAP = toMap(DISPOSAL_METHODS);

export const FUEL_TYPES = [
    { value: "gasoline", label: "Gasoline", variant: "default" as const },
    { value: "diesel", label: "Diesel", variant: "default" as const },
    { value: "electric", label: "Electric", variant: "success" as const },
    { value: "hybrid", label: "Hybrid", variant: "info" as const },
    { value: "propane", label: "Propane", variant: "warning" as const },
    { value: "cng", label: "CNG", variant: "info" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const FUEL_TYPE_MAP = toMap(FUEL_TYPES);

export const ASSET_RETURN_CONDITIONS = [
    { value: "excellent", label: "Excellent", variant: "success" as const },
    { value: "good", label: "Good", variant: "default" as const },
    { value: "fair", label: "Fair", variant: "warning" as const },
    { value: "damaged", label: "Damaged", variant: "destructive" as const },
    { value: "missing", label: "Missing", variant: "destructive" as const },
] as const;
export const ASSET_RETURN_CONDITION_MAP = toMap(ASSET_RETURN_CONDITIONS);

// ─── 020: Live Event Operations ─────────────────────────────

export const COMMAND_POSITION_TYPES = [
    { value: "event_commander", label: "Event Commander", variant: "destructive" as const },
    { value: "safety_officer", label: "Safety Officer", variant: "destructive" as const },
    { value: "financial_officer", label: "Financial Officer", variant: "warning" as const },
    { value: "client_liaison", label: "Client Liaison", variant: "info" as const },
    { value: "production_manager", label: "Production Manager", variant: "default" as const },
    { value: "technical_director", label: "Technical Director", variant: "info" as const },
    { value: "stage_manager", label: "Stage Manager", variant: "default" as const },
    { value: "logistics_lead", label: "Logistics Lead", variant: "default" as const },
    { value: "crew_lead", label: "Crew Lead", variant: "default" as const },
    { value: "security_lead", label: "Security Lead", variant: "warning" as const },
    { value: "medical_lead", label: "Medical Lead", variant: "destructive" as const },
    { value: "catering_lead", label: "Catering Lead", variant: "default" as const },
    { value: "custom", label: "Custom", variant: "ghost" as const },
] as const;
export const COMMAND_POSITION_TYPE_MAP = toMap(COMMAND_POSITION_TYPES);

export const VIP_STATUSES = [
    { value: "expected", label: "Expected", variant: "ghost" as const },
    { value: "arrived", label: "Arrived", variant: "info" as const },
    { value: "in_venue", label: "In Venue", variant: "success" as const },
    { value: "departed", label: "Departed", variant: "ghost" as const },
] as const;
export const VIP_STATUS_MAP = toMap(VIP_STATUSES);

export const STRIKE_STEP_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "in_progress", label: "In Progress", variant: "info" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "blocked", label: "Blocked", variant: "destructive" as const },
    { value: "skipped", label: "Skipped", variant: "secondary" as const },
] as const;
export const STRIKE_STEP_STATUS_MAP = toMap(STRIKE_STEP_STATUSES);

export const COMM_CHANNEL_PRIORITIES = [
    { value: "emergency", label: "Emergency", variant: "destructive" as const },
    { value: "critical", label: "Critical", variant: "destructive" as const },
    { value: "high", label: "High", variant: "warning" as const },
    { value: "medium", label: "Medium", variant: "default" as const },
    { value: "low", label: "Low", variant: "ghost" as const },
] as const;
export const COMM_CHANNEL_PRIORITY_MAP = toMap(COMM_CHANNEL_PRIORITIES);

// ─── 021: Integrated Production Lifecycle ───────────────────

export const BOM_ITEM_TYPES = [
    { value: "asset", label: "Asset", variant: "default" as const },
    { value: "consumable", label: "Consumable", variant: "ghost" as const },
    { value: "sub_bom", label: "Sub-BOM", variant: "info" as const },
    { value: "labor", label: "Labor", variant: "default" as const },
    { value: "service", label: "Service", variant: "default" as const },
    { value: "rental", label: "Rental", variant: "info" as const },
] as const;
export const BOM_ITEM_TYPE_MAP = toMap(BOM_ITEM_TYPES);

export const RIGHTS_STATUSES = [
    { value: "pending_clearance", label: "Pending Clearance", variant: "warning" as const },
    { value: "cleared", label: "Cleared", variant: "success" as const },
    { value: "denied", label: "Denied", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
    { value: "renewal_needed", label: "Renewal Needed", variant: "warning" as const },
] as const;
export const RIGHTS_STATUS_MAP = toMap(RIGHTS_STATUSES);

export const WP_DEPENDENCY_TYPES = [
    { value: "finish_to_start", label: "Finish to Start", variant: "default" as const },
    { value: "start_to_start", label: "Start to Start", variant: "info" as const },
    { value: "finish_to_finish", label: "Finish to Finish", variant: "info" as const },
    { value: "start_to_finish", label: "Start to Finish", variant: "warning" as const },
] as const;
export const WP_DEPENDENCY_TYPE_MAP = toMap(WP_DEPENDENCY_TYPES);

// ─── 026: Settings Framework ────────────────────────────────

export const SETTING_SCOPES = [
    { value: "platform", label: "Platform", variant: "destructive" as const },
    { value: "environment", label: "Environment", variant: "warning" as const },
    { value: "organization", label: "Organization", variant: "default" as const },
    { value: "project", label: "Project", variant: "info" as const },
    { value: "team", label: "Team", variant: "default" as const },
    { value: "user", label: "User", variant: "ghost" as const },
] as const;
export const SETTING_SCOPE_MAP = toMap(SETTING_SCOPES);

export const SETTING_VALUE_TYPES = [
    { value: "boolean", label: "Boolean", variant: "default" as const },
    { value: "integer", label: "Integer", variant: "default" as const },
    { value: "float", label: "Float", variant: "default" as const },
    { value: "string", label: "String", variant: "default" as const },
    { value: "enum", label: "Enum", variant: "info" as const },
    { value: "jsonb", label: "JSONB", variant: "info" as const },
] as const;
export const SETTING_VALUE_TYPE_MAP = toMap(SETTING_VALUE_TYPES);

export const SETTING_CATEGORIES = [
    { value: "governance", label: "Governance", variant: "warning" as const },
    { value: "security", label: "Security", variant: "destructive" as const },
    { value: "operational", label: "Operational", variant: "default" as const },
    { value: "ui", label: "UI", variant: "info" as const },
    { value: "integration", label: "Integration", variant: "default" as const },
] as const;
export const SETTING_CATEGORY_MAP = toMap(SETTING_CATEGORIES);

// ─── 027: Feature Flags ─────────────────────────────────────

export const FEATURE_FLAG_TYPES = [
    { value: "boolean", label: "Boolean", variant: "default" as const },
    { value: "percentage", label: "Percentage", variant: "info" as const },
    { value: "variant", label: "Variant", variant: "warning" as const },
] as const;
export const FEATURE_FLAG_TYPE_MAP = toMap(FEATURE_FLAG_TYPES);

export const FEATURE_FLAG_OVERRIDE_SCOPES = [
    { value: "organization", label: "Organization", variant: "default" as const },
    { value: "project", label: "Project", variant: "info" as const },
    { value: "user", label: "User", variant: "ghost" as const },
    { value: "role", label: "Role", variant: "warning" as const },
] as const;
export const FEATURE_FLAG_OVERRIDE_SCOPE_MAP = toMap(FEATURE_FLAG_OVERRIDE_SCOPES);

// ─── 028: RBAC Custom Roles ────────────────────────────────

export const PERMISSION_ACTIONS = [
    { value: "read", label: "Read", variant: "ghost" as const },
    { value: "write", label: "Write", variant: "info" as const },
    { value: "delete", label: "Delete", variant: "destructive" as const },
    { value: "manage", label: "Manage", variant: "warning" as const },
] as const;
export const PERMISSION_ACTION_MAP = toMap(PERMISSION_ACTIONS);

export const PERMISSION_SCOPE_TYPES = [
    { value: "global", label: "Global", variant: "destructive" as const },
    { value: "organization", label: "Organization", variant: "default" as const },
    { value: "project", label: "Project", variant: "info" as const },
    { value: "activation", label: "Activation", variant: "info" as const },
    { value: "team", label: "Team", variant: "default" as const },
] as const;
export const PERMISSION_SCOPE_TYPE_MAP = toMap(PERMISSION_SCOPE_TYPES);

// ─── 031: Field-Level RBAC / Pricing ────────────────────────

export const PRICING_TIERS = [
    { value: "core", label: "Core", variant: "ghost" as const },
    { value: "pro", label: "Pro", variant: "info" as const },
    { value: "enterprise", label: "Enterprise", variant: "success" as const },
] as const;
export const PRICING_TIER_MAP = toMap(PRICING_TIERS);

export const SUBSCRIPTION_STATUSES = [
    { value: "active", label: "Active", variant: "success" as const },
    { value: "trialing", label: "Trialing", variant: "info" as const },
    { value: "past_due", label: "Past Due", variant: "destructive" as const },
    { value: "cancelled", label: "Cancelled", variant: "ghost" as const },
    { value: "paused", label: "Paused", variant: "warning" as const },
] as const;
export const SUBSCRIPTION_STATUS_MAP = toMap(SUBSCRIPTION_STATUSES);

export const BILLING_CYCLES = [
    { value: "monthly", label: "Monthly", variant: "default" as const },
    { value: "annual", label: "Annual", variant: "info" as const },
] as const;
export const BILLING_CYCLE_MAP = toMap(BILLING_CYCLES);

export const FIELD_VISIBILITIES = [
    { value: "VISIBLE", label: "Visible", variant: "success" as const },
    { value: "MASKED", label: "Masked", variant: "warning" as const },
    { value: "REDACTED", label: "Redacted", variant: "destructive" as const },
    { value: "HIDDEN", label: "Hidden", variant: "ghost" as const },
] as const;
export const FIELD_VISIBILITY_MAP = toMap(FIELD_VISIBILITIES);

export const FIELD_WRITE_ACCESSES = [
    { value: "none", label: "None", variant: "ghost" as const },
    { value: "write", label: "Write", variant: "info" as const },
    { value: "manage", label: "Manage", variant: "warning" as const },
] as const;
export const FIELD_WRITE_ACCESS_MAP = toMap(FIELD_WRITE_ACCESSES);

// ─── 035: Settings Approval Workflow ────────────────────────

export const SETTINGS_APPROVAL_STATUSES = [
    { value: "pending", label: "Pending", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "rejected", label: "Rejected", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
    { value: "cancelled", label: "Cancelled", variant: "ghost" as const },
] as const;
export const SETTINGS_APPROVAL_STATUS_MAP = toMap(SETTINGS_APPROVAL_STATUSES);

// ─── 045: Invitation / Referral ─────────────────────────────

export const INVITATION_TYPES = [
    { value: "org_invite", label: "Org Invite", variant: "default" as const },
    { value: "referral", label: "Referral", variant: "info" as const },
] as const;
export const INVITATION_TYPE_MAP = toMap(INVITATION_TYPES);

// ─── 046: Messaging Foundation ──────────────────────────────

export const CONVERSATION_TYPES = [
    { value: "dm", label: "DM", variant: "default" as const },
    { value: "group", label: "Group", variant: "info" as const },
    { value: "channel", label: "Channel", variant: "info" as const },
] as const;
export const CONVERSATION_TYPE_MAP = toMap(CONVERSATION_TYPES);

export const CONVERSATION_MEMBER_ROLES = [
    { value: "owner", label: "Owner", variant: "destructive" as const },
    { value: "admin", label: "Admin", variant: "warning" as const },
    { value: "member", label: "Member", variant: "default" as const },
    { value: "guest", label: "Guest", variant: "ghost" as const },
] as const;
export const CONVERSATION_MEMBER_ROLE_MAP = toMap(CONVERSATION_MEMBER_ROLES);

export const MESSAGE_PRIORITIES = [
    { value: "normal", label: "Normal", variant: "default" as const },
    { value: "high", label: "High", variant: "warning" as const },
    { value: "urgent", label: "Urgent", variant: "destructive" as const },
    { value: "critical", label: "Critical", variant: "destructive" as const },
] as const;
export const MESSAGE_PRIORITY_MAP = toMap(MESSAGE_PRIORITIES);

export const NOTIFICATION_PREFERENCE_LEVELS = [
    { value: "all", label: "All", variant: "default" as const },
    { value: "mentions", label: "Mentions", variant: "info" as const },
    { value: "none", label: "None", variant: "ghost" as const },
] as const;
export const NOTIFICATION_PREFERENCE_LEVEL_MAP = toMap(NOTIFICATION_PREFERENCE_LEVELS);

// ─── 047: Master Catalog ────────────────────────────────────

export const CATALOG_CATEGORY_TYPES = [
    { value: "access", label: "Access", variant: "default" as const },
    { value: "production", label: "Production", variant: "default" as const },
    { value: "technical", label: "Technical", variant: "info" as const },
    { value: "hospitality", label: "Hospitality", variant: "default" as const },
    { value: "travel", label: "Travel", variant: "secondary" as const },
    { value: "custom", label: "Custom", variant: "ghost" as const },
] as const;
export const CATALOG_CATEGORY_TYPE_MAP = toMap(CATALOG_CATEGORY_TYPES);

export const CATALOG_ITEM_STATUSES = [
    { value: "active", label: "Active", variant: "success" as const },
    { value: "discontinued", label: "Discontinued", variant: "ghost" as const },
    { value: "out_of_stock", label: "Out of Stock", variant: "destructive" as const },
    { value: "seasonal", label: "Seasonal", variant: "info" as const },
    { value: "draft", label: "Draft", variant: "ghost" as const },
] as const;
export const CATALOG_ITEM_STATUS_MAP = toMap(CATALOG_ITEM_STATUSES);

export const MODIFIER_TYPES = [
    { value: "single_select", label: "Single Select", variant: "default" as const },
    { value: "multi_select", label: "Multi Select", variant: "info" as const },
    { value: "quantity", label: "Quantity", variant: "default" as const },
    { value: "text", label: "Text", variant: "default" as const },
    { value: "boolean", label: "Boolean", variant: "default" as const },
] as const;
export const MODIFIER_TYPE_MAP = toMap(MODIFIER_TYPES);

export const PRICE_ADJUSTMENT_TYPES = [
    { value: "flat", label: "Flat", variant: "default" as const },
    { value: "percentage", label: "Percentage", variant: "info" as const },
    { value: "per_unit", label: "Per Unit", variant: "default" as const },
] as const;
export const PRICE_ADJUSTMENT_TYPE_MAP = toMap(PRICE_ADJUSTMENT_TYPES);

// ─── 048: Production Advances ───────────────────────────────

export const ADVANCE_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "submitted", label: "Submitted", variant: "info" as const },
    { value: "in_review", label: "In Review", variant: "warning" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "in_progress", label: "In Progress", variant: "default" as const },
    { value: "fulfilled", label: "Fulfilled", variant: "success" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
] as const;
export const ADVANCE_STATUS_MAP = toMap(ADVANCE_STATUSES);

export const ADVANCE_PRIORITIES = [
    { value: "low", label: "Low", variant: "ghost" as const },
    { value: "medium", label: "Medium", variant: "default" as const },
    { value: "high", label: "High", variant: "warning" as const },
    { value: "urgent", label: "Urgent", variant: "destructive" as const },
    { value: "critical", label: "Critical", variant: "destructive" as const },
] as const;
export const ADVANCE_PRIORITY_MAP = toMap(ADVANCE_PRIORITIES);

export const ADVANCE_ITEM_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "confirmed", label: "Confirmed", variant: "info" as const },
    { value: "in_transit", label: "In Transit", variant: "warning" as const },
    { value: "delivered", label: "Delivered", variant: "success" as const },
    { value: "installed", label: "Installed", variant: "success" as const },
    { value: "operational", label: "Operational", variant: "success" as const },
    { value: "struck", label: "Struck", variant: "secondary" as const },
    { value: "returned", label: "Returned", variant: "ghost" as const },
    { value: "complete", label: "Complete", variant: "success" as const },
] as const;
export const ADVANCE_ITEM_STATUS_MAP = toMap(ADVANCE_ITEM_STATUSES);

// ─── 051: Credentialing / Ticketing ─────────────────────────

export const CREDENTIAL_CATEGORIES = [
    { value: "artist", label: "Artist", variant: "success" as const },
    { value: "vip", label: "VIP", variant: "warning" as const },
    { value: "crew", label: "Crew", variant: "default" as const },
    { value: "media", label: "Media", variant: "info" as const },
    { value: "vendor", label: "Vendor", variant: "default" as const },
    { value: "general_admission", label: "General Admission", variant: "ghost" as const },
    { value: "production", label: "Production", variant: "default" as const },
    { value: "security", label: "Security", variant: "warning" as const },
    { value: "medical", label: "Medical", variant: "destructive" as const },
    { value: "hospitality", label: "Hospitality", variant: "default" as const },
    { value: "sponsor", label: "Sponsor", variant: "info" as const },
] as const;
export const CREDENTIAL_CATEGORY_MAP = toMap(CREDENTIAL_CATEGORIES);

export const CREDENTIAL_ASSIGNMENT_STATUSES = [
    { value: "requested", label: "Requested", variant: "ghost" as const },
    { value: "approved", label: "Approved", variant: "success" as const },
    { value: "issued", label: "Issued", variant: "info" as const },
    { value: "checked_in", label: "Checked In", variant: "success" as const },
    { value: "checked_out", label: "Checked Out", variant: "secondary" as const },
    { value: "revoked", label: "Revoked", variant: "destructive" as const },
    { value: "expired", label: "Expired", variant: "ghost" as const },
] as const;
export const CREDENTIAL_ASSIGNMENT_STATUS_MAP = toMap(CREDENTIAL_ASSIGNMENT_STATUSES);

// ─── 054: Bulk Export Infrastructure ────────────────────────

export const BULK_JOB_STATUSES = [
    { value: "pending", label: "Pending", variant: "ghost" as const },
    { value: "validating", label: "Validating", variant: "info" as const },
    { value: "processing", label: "Processing", variant: "warning" as const },
    { value: "completed", label: "Completed", variant: "success" as const },
    { value: "failed", label: "Failed", variant: "destructive" as const },
    { value: "cancelled", label: "Cancelled", variant: "ghost" as const },
] as const;
export const BULK_JOB_STATUS_MAP = toMap(BULK_JOB_STATUSES);

// ─── 064: Extended User Profile ─────────────────────────────

export const USER_CERTIFICATION_TYPES = [
    { value: "first_aid", label: "First Aid", variant: "default" as const },
    { value: "cpr", label: "CPR", variant: "default" as const },
    { value: "aed", label: "AED", variant: "default" as const },
    { value: "osha_10", label: "OSHA 10", variant: "warning" as const },
    { value: "osha_30", label: "OSHA 30", variant: "warning" as const },
    { value: "forklift", label: "Forklift", variant: "default" as const },
    { value: "aerial_lift", label: "Aerial Lift", variant: "default" as const },
    { value: "rigging", label: "Rigging", variant: "warning" as const },
    { value: "electrical", label: "Electrical", variant: "default" as const },
    { value: "pyrotechnics", label: "Pyrotechnics", variant: "destructive" as const },
    { value: "food_handler", label: "Food Handler", variant: "default" as const },
    { value: "alcohol_server", label: "Alcohol Server", variant: "default" as const },
    { value: "crowd_management", label: "Crowd Management", variant: "warning" as const },
    { value: "hazmat", label: "Hazmat", variant: "destructive" as const },
    { value: "cdl", label: "CDL", variant: "default" as const },
    { value: "other", label: "Other", variant: "ghost" as const },
] as const;
export const USER_CERTIFICATION_TYPE_MAP = toMap(USER_CERTIFICATION_TYPES);

// ─── 078: Enterprise Features ───────────────────────────────

export const SHEET_STATUSES = [
    { value: "draft", label: "Draft", variant: "ghost" as const },
    { value: "published", label: "Published", variant: "success" as const },
    { value: "archived", label: "Archived", variant: "ghost" as const },
] as const;
export const SHEET_STATUS_MAP = toMap(SHEET_STATUSES);
