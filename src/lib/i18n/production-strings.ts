/**
 * Production & Operations — i18n string definitions
 * Covers: projects, tasks, events, activations, call-sheets, crew, workforce
 */

export const PRODUCTION_STRINGS = {
    // ─── Projects ──────────────────────────────────────────────
    projects_title: "Projects",
    projects_empty: "No projects yet",
    projects_search: "Search projects...",
    projects_create: "New Project",
    project_detail_title: "Project Details",
    project_name: "Project Name",
    project_client: "Client",
    project_status: "Status",
    project_start_date: "Start Date",
    project_end_date: "End Date",
    project_budget: "Budget",
    project_description: "Description",
    project_manager: "Project Manager",
    project_team: "Team Members",
    project_milestones: "Milestones",
    project_deliverables: "Deliverables",

    // ─── Tasks ─────────────────────────────────────────────────
    tasks_title: "Tasks",
    tasks_empty: "No tasks yet",
    tasks_search: "Search tasks...",
    tasks_create: "New Task",
    task_detail_title: "Task Details",
    task_title_field: "Task Title",
    task_status: "Status",
    task_priority: "Priority",
    task_assignee: "Assigned To",
    task_due_date: "Due Date",
    task_estimated_hours: "Estimated Hours",
    task_description: "Description",
    task_blocked: "Blocked",
    task_unblock: "Unblock",

    // ─── Events ────────────────────────────────────────────────
    events_title: "Events",
    events_empty: "No events scheduled",
    events_search: "Search events...",
    events_create: "New Event",
    event_name: "Event Name",
    event_venue: "Venue",
    event_date: "Event Date",
    event_attendance: "Expected Attendance",
    event_description: "Description",

    // ─── Activations ───────────────────────────────────────────
    activations_title: "Activations",
    activations_empty: "No activations",
    activations_create: "New Activation",
    activation_name: "Activation Name",
    activation_type: "Type",
    activation_location: "Location",
    activation_dates: "Dates",

    // ─── Call Sheets ───────────────────────────────────────────
    call_sheets_title: "Call Sheets",
    call_sheets_empty: "No call sheets",
    call_sheets_create: "New Call Sheet",
    call_sheet_date: "Call Date",
    call_sheet_location: "Location",
    call_sheet_crew: "Crew Assignments",
    call_sheet_notes: "Notes",

    // ─── Crew ──────────────────────────────────────────────────
    crew_title: "Crew",
    crew_empty: "No crew members",
    crew_search: "Search crew...",
    crew_create: "Add Crew Member",
    crew_name: "Name",
    crew_role: "Role",
    crew_department: "Department",
    crew_availability: "Availability",
    crew_rate: "Day Rate",

    // ─── Workforce ─────────────────────────────────────────────
    workforce_title: "Workforce",
    workforce_empty: "No workforce records",
    workforce_onboarding: "Onboarding",
    workforce_reviews: "Reviews",
    workforce_certifications: "Certifications",

    // ─── Statuses ──────────────────────────────────────────────
    status_draft: "Draft",
    status_planning: "Planning",
    status_pre_production: "Pre-Production",
    status_in_production: "In Production",
    status_active: "Active",
    status_on_hold: "On Hold",
    status_wrap: "Wrap",
    status_completed: "Completed",
    status_cancelled: "Cancelled",
    status_backlog: "Backlog",
    status_todo: "To Do",
    status_in_progress: "In Progress",
    status_review: "Review",
    status_blocked: "Blocked",

    // ─── Errors ────────────────────────────────────────────────
    error_create_failed: "Failed to create {entity}",
    error_update_failed: "Failed to update {entity}",
    error_delete_failed: "Failed to delete {entity}",
    error_load_failed: "Failed to load {entity}",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_project_list: "Project list",
    a11y_task_list: "Task list",
    a11y_event_list: "Event list",
    a11y_status_badge: "{status} status",
    a11y_priority_badge: "{priority} priority",
} as const;

export type ProductionStringKey = keyof typeof PRODUCTION_STRINGS;
