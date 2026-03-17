/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — People Domain
   
   Declarative ListPageConfig objects for the people domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import type { QuickViewConfig } from "@/types/detail-page-config";
import {
    CREATE_CALL_SHEET_CONFIG,
    CREATE_CERTIFICATION_CONFIG,
    CREATE_CREDENTIAL_ASSIGNMENT_CONFIG,
    CREATE_CREDENTIAL_CONFIG,
    CREATE_CREW_SHIFT_CONFIG,
    CREATE_GOAL_CONFIG,
    CREATE_SHIFT_CONFIG,
    CREATE_TIME_ENTRY_CONFIG,
    CREATE_TIME_OFF_REQUEST_CONFIG,
    CREATE_WORKER_REVIEW_CONFIG,
} from "@/config/create-entity-configs";
import {
    CREATE_CREDENTIAL_TYPE_CONFIG,
    CREATE_CREW_AVAILABILITY_CONFIG,
    CREATE_CREW_MEMBER_CONFIG,
    CREATE_HR_CERTIFICATION_CONFIG,
    CREATE_REVIEW_CONFIG,
    CREATE_REVIEW_CYCLE_CONFIG,
    CREATE_TEAM_MEMBER_CONFIG,
    CREATE_TIME_TRACKING_POLICY_CONFIG,
    CREATE_TIMESHEET_CONFIG,
    CREATE_WORKER_CLASSIFICATION_CONFIG,
    CREATE_WORKER_OFFBOARDING_RUN_CONFIG,
    CREATE_WORKER_ONBOARDING_RUN_CONFIG,
    CREATE_WORKER_PROFILE_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    Award,
    BadgeCheck,
    BriefcaseBusiness,
    CalendarClock,
    Clock,
    FileCheck,
    Star,
    Target,
    Timer,
    UserCheck,
    UserCog,
    Users,
    Warehouse,
} from "lucide-react";

// ─── credential_type ───

export const CREDENTIAL_TYPES_PAGE: ListPageConfig = {
    entityKey: "credential_type",
    description: "Define credential and certification types required across the organization",
    icon: BadgeCheck,
    createConfig: CREATE_CREDENTIAL_TYPE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Credential Type", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "validity_period_days", header: "Valid (days)", accessorKey: "validity_period_days" },
        { id: "is_required", header: "Required", accessorKey: "is_required", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── goal ───

export const GOALS_PAGE: ListPageConfig = {
    entityKey: "goal",
    description: "Organizational and team goals with progress tracking",
    icon: Target,
    createConfig: CREATE_GOAL_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Goal", accessorKey: "title" },
        { id: "goal_type", header: "Type", accessorKey: "goal_type", fieldType: "status" },
        { id: "progress", header: "Progress", accessorKey: "progress" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
    ],
    views: ["table", "board", "chart"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "goal_type",
    },
    chartConfig: {
        type: "pie",
        categoryKey: "status",
    },
    exportable: true,
};

// ─── review_cycle ───

export const REVIEW_CYCLES_PAGE: ListPageConfig = {
    entityKey: "review_cycle",
    description: "Performance review cycles and evaluation periods",
    icon: UserCheck,
    createConfig: CREATE_REVIEW_CYCLE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Cycle", accessorKey: "name" },
        { id: "cycle_type", header: "Type", accessorKey: "cycle_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    exportable: true,
};

// ─── review ───

export const REVIEWS_PAGE: ListPageConfig = {
    entityKey: "review",
    description: "Performance reviews, evaluations, and feedback records",
    icon: Star,
    createConfig: CREATE_REVIEW_CONFIG,
    searchKeys: ["title", "reviewee_name"],
    columns: [
        { id: "title", header: "Review", accessorKey: "title" },
        { id: "reviewee_name", header: "Reviewee", accessorKey: "reviewee_name" },
        { id: "review_type", header: "Type", accessorKey: "review_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── time_off_request ───

export const TIME_OFF_REQUESTS_PAGE: ListPageConfig = {
    entityKey: "time_off_request",
    description: "Employee time-off requests, approvals, and leave balance tracking",
    icon: CalendarClock,
    createConfig: CREATE_TIME_OFF_REQUEST_CONFIG,
    searchKeys: ["requester_name", "reason"],
    columns: [
        { id: "requester_name", header: "Requester", accessorKey: "requester_name" },
        { id: "leave_type", header: "Type", accessorKey: "leave_type", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "requester_name",
        cardSubtitleKey: "leave_type",
    },
    calendarConfig: {
        titleKey: "requester_name",
        dateKey: "start_date",
        endDateKey: "end_date",
        colorKey: "leave_type",
    },
    exportable: true,
};

// ─── timesheet ───

export const TIMESHEETS_PAGE: ListPageConfig = {
    entityKey: "timesheet",
    description: "Weekly timesheet submissions and approvals",
    icon: Clock,
    createConfig: CREATE_TIMESHEET_CONFIG,
    searchKeys: ["employee_name", "period"],
    columns: [
        { id: "employee_name", header: "Employee", accessorKey: "employee_name" },
        { id: "period", header: "Period", accessorKey: "period" },
        { id: "total_hours", header: "Hours", accessorKey: "total_hours" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "submitted_at", header: "Submitted", accessorKey: "submitted_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── worker_offboarding_run ───

export const WORKER_OFFBOARDING_RUNS_PAGE: ListPageConfig = {
    entityKey: "worker_offboarding_run",
    description: "Worker offboarding checklists, exit processes, and transitions",
    icon: UserCog,
    createConfig: CREATE_WORKER_OFFBOARDING_RUN_CONFIG,
    searchKeys: ["worker_name", "description"],
    columns: [
        { id: "worker_name", header: "Worker", accessorKey: "worker_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "exit_date", header: "Exit Date", accessorKey: "exit_date", fieldType: "date" },
        { id: "completion_percent", header: "Progress", accessorKey: "completion_percent" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── worker_onboarding_run ───

export const WORKER_ONBOARDING_RUNS_PAGE: ListPageConfig = {
    entityKey: "worker_onboarding_run",
    description: "Worker onboarding checklists, training, and orientation tracking",
    icon: UserCheck,
    createConfig: CREATE_WORKER_ONBOARDING_RUN_CONFIG,
    searchKeys: ["worker_name", "description"],
    columns: [
        { id: "worker_name", header: "Worker", accessorKey: "worker_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "completion_percent", header: "Progress", accessorKey: "completion_percent" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── certification ───

export const CERTIFICATIONS_PAGE: ListPageConfig = {
    entityKey: "certification",
    description: "Certifications, licenses, and professional qualifications",
    icon: Award,
    createConfig: CREATE_CERTIFICATION_CONFIG,
    searchKeys: ["name", "issuing_authority"],
    columns: [
        { id: "name", header: "Certification", accessorKey: "name" },
        { id: "issuing_authority", header: "Issuer", accessorKey: "issuing_authority" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── credential_assignment ───

export const CREDENTIAL_ASSIGNMENTS_PAGE: ListPageConfig = {
    entityKey: "credential_assignment",
    description: "Credential assignments to crew and staff",
    icon: BadgeCheck,
    createConfig: CREATE_CREDENTIAL_ASSIGNMENT_CONFIG,
    searchKeys: ["assignee_name", "credential_type"],
    columns: [
        { id: "assignee_name", header: "Assignee", accessorKey: "assignee_name" },
        {
            id: "credential_type",
            header: "Credential",
            accessorKey: "credential_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "issued_at", header: "Issued", accessorKey: "issued_at", fieldType: "date" },
        { id: "expires_at", header: "Expires", accessorKey: "expires_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── credential_inventory_pool ───

export const CREDENTIAL_INVENTORY_POOLS_PAGE: ListPageConfig = {
    entityKey: "credential_inventory_pool",
    description: "Inventory pools for credential stock management",
    icon: Warehouse,
    createConfig: CREATE_CREDENTIAL_CONFIG,
    searchKeys: ["name", "credential_type"],
    columns: [
        { id: "name", header: "Pool", accessorKey: "name" },
        {
            id: "credential_type",
            header: "Type",
            accessorKey: "credential_type",
            fieldType: "status",
        },
        { id: "total_quantity", header: "Total", accessorKey: "total_quantity" },
        { id: "available_quantity", header: "Available", accessorKey: "available_quantity" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── crew_availability ───

export const CREW_AVAILABILITY_PAGE: ListPageConfig = {
    entityKey: "crew_availability",
    description: "Crew availability windows and scheduling preferences",
    icon: CalendarClock,
    createConfig: CREATE_CREW_AVAILABILITY_CONFIG,
    searchKeys: ["crew_member_name"],
    columns: [
        { id: "crew_member_name", header: "Crew Member", accessorKey: "crew_member_name" },
        { id: "available_from", header: "From", accessorKey: "available_from", fieldType: "date" },
        { id: "available_to", header: "To", accessorKey: "available_to", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "timeline", "calendar"],
    defaultView: "table",
    timelineConfig: {
        labelKey: "crew_member_name",
        startDateKey: "available_from",
        endDateKey: "available_to",
        colorKey: "status",
        groupByKey: "crew_member_name",
    },
    calendarConfig: {
        titleKey: "crew_member_name",
        dateKey: "available_from",
        endDateKey: "available_to",
        colorKey: "status",
    },
    exportable: true,
};

// ─── crew_shift ───

export const CREW_SHIFTS_PAGE: ListPageConfig = {
    entityKey: "crew_shift",
    description: "Crew shift assignments and schedules",
    icon: Clock,
    createConfig: CREATE_CREW_SHIFT_CONFIG,
    searchKeys: ["crew_member_name", "role"],
    columns: [
        { id: "crew_member_name", header: "Crew Member", accessorKey: "crew_member_name" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "call_time", header: "Call Time", accessorKey: "call_time", fieldType: "date" },
        { id: "end_time", header: "End Time", accessorKey: "end_time", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "calendar", "timeline"],
    defaultView: "table",
    calendarConfig: {
        titleKey: "crew_member_name",
        dateKey: "call_time",
        endDateKey: "end_time",
        colorKey: "role",
    },
    timelineConfig: {
        labelKey: "crew_member_name",
        sublabelKey: "role",
        startDateKey: "call_time",
        endDateKey: "end_time",
        colorKey: "status",
        groupByKey: "crew_member_name",
    },
    exportable: true,
};

// ─── live_crew_assignment ───

export const LIVE_CREW_ASSIGNMENTS_PAGE: ListPageConfig = {
    entityKey: "live_crew_assignment",
    description: "Live event crew assignments and positions",
    icon: Users,
    createConfig: CREATE_CREW_MEMBER_CONFIG,
    searchKeys: ["crew_member_name", "role"],
    columns: [
        { id: "crew_member_name", header: "Crew Member", accessorKey: "crew_member_name" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "event_name", header: "Event", accessorKey: "event_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Assigned", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── schedule_entry ───

export const SCHEDULE_ENTRIES_PAGE: ListPageConfig = {
    entityKey: "schedule_entry",
    description: "Scheduled entries for shifts, events, and tasks",
    icon: CalendarClock,
    createConfig: CREATE_CALL_SHEET_CONFIG,
    searchKeys: ["title", "assignee_name"],
    columns: [
        { id: "title", header: "Entry", accessorKey: "title" },
        { id: "assignee_name", header: "Assignee", accessorKey: "assignee_name" },
        { id: "start_time", header: "Start", accessorKey: "start_time", fieldType: "date" },
        { id: "end_time", header: "End", accessorKey: "end_time", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "calendar", "timeline"],
    defaultView: "table",
    calendarConfig: {
        titleKey: "title",
        dateKey: "start_time",
        endDateKey: "end_time",
        colorKey: "status",
    },
    timelineConfig: {
        labelKey: "title",
        sublabelKey: "assignee_name",
        startDateKey: "start_time",
        endDateKey: "end_time",
        colorKey: "status",
        groupByKey: "assignee_name",
    },
    exportable: true,
};

// ─── shift ───

export const SHIFTS_PAGE: ListPageConfig = {
    entityKey: "shift",
    description: "Work shifts and scheduling periods",
    icon: Clock,
    createConfig: CREATE_SHIFT_CONFIG,
    searchKeys: ["name", "location_name"],
    columns: [
        { id: "name", header: "Shift", accessorKey: "name" },
        { id: "location_name", header: "Location", accessorKey: "location_name" },
        { id: "start_time", header: "Start", accessorKey: "start_time", fieldType: "date" },
        { id: "end_time", header: "End", accessorKey: "end_time", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    exportable: true,
};

// ─── team_member ───

export const TEAM_MEMBERS_PAGE: ListPageConfig = {
    entityKey: "team_member",
    description: "Team membership and role assignments",
    icon: Users,
    createConfig: CREATE_TEAM_MEMBER_CONFIG,
    searchKeys: ["member_name", "team_name"],
    columns: [
        { id: "member_name", header: "Member", accessorKey: "member_name" },
        { id: "team_name", header: "Team", accessorKey: "team_name" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "joined_at", header: "Joined", accessorKey: "joined_at", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    exportable: true,
};

// ─── time_entry ───

export const TIME_ENTRIES_PAGE: ListPageConfig = {
    entityKey: "time_entry",
    description: "Time tracking entries for tasks and projects",
    icon: Timer,
    createConfig: CREATE_TIME_ENTRY_CONFIG,
    searchKeys: ["description", "project_name"],
    columns: [
        { id: "description", header: "Entry", accessorKey: "description" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
        { id: "hours", header: "Hours", accessorKey: "hours" },
        { id: "billable", header: "Billable", accessorKey: "billable", fieldType: "status" },
        { id: "entry_date", header: "Date", accessorKey: "entry_date", fieldType: "date" },
    ],
    exportable: true,
};

// ─── time_tracking_policy ───

export const TIME_TRACKING_POLICIES_PAGE: ListPageConfig = {
    entityKey: "time_tracking_policy",
    description: "Time tracking policies and compliance rules",
    icon: Clock,
    createConfig: CREATE_TIME_TRACKING_POLICY_CONFIG,
    searchKeys: ["name", "policy_type"],
    columns: [
        { id: "name", header: "Policy", accessorKey: "name" },
        { id: "policy_type", header: "Type", accessorKey: "policy_type", fieldType: "status" },
        { id: "max_hours_daily", header: "Max Daily", accessorKey: "max_hours_daily" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── worker_classification ───

export const WORKER_CLASSIFICATIONS_PAGE: ListPageConfig = {
    entityKey: "worker_classification",
    description: "Worker classification types and labor categories",
    icon: BriefcaseBusiness,
    createConfig: CREATE_WORKER_CLASSIFICATION_CONFIG,
    searchKeys: ["name", "classification_type"],
    columns: [
        { id: "name", header: "Classification", accessorKey: "name" },
        {
            id: "classification_type",
            header: "Type",
            accessorKey: "classification_type",
            fieldType: "status",
        },
        { id: "worker_count", header: "Workers", accessorKey: "worker_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── worker_compliance_doc ───

export const WORKER_COMPLIANCE_DOCS_PAGE: ListPageConfig = {
    entityKey: "worker_compliance_doc",
    description: "Worker compliance documents and certifications",
    icon: FileCheck,
    createConfig: CREATE_HR_CERTIFICATION_CONFIG,
    searchKeys: ["document_name", "worker_name"],
    columns: [
        { id: "document_name", header: "Document", accessorKey: "document_name" },
        { id: "worker_name", header: "Worker", accessorKey: "worker_name" },
        { id: "document_type", header: "Type", accessorKey: "document_type", fieldType: "status" },
        { id: "expiry_date", header: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    exportable: true,
};

// ─── worker_profile ───

const WORKER_PROFILE_QUICK_VIEW: QuickViewConfig = {
    previewFields: [
        { id: "department", label: "Department", accessorKey: "department", fieldType: "status" },
        {
            id: "classification",
            label: "Classification",
            accessorKey: "classification",
            fieldType: "status",
        },
        { id: "hire_date", label: "Hire Date", accessorKey: "hire_date", fieldType: "date" },
        { id: "email", label: "Email", accessorKey: "email", fieldType: "email" },
        { id: "phone", label: "Phone", accessorKey: "phone", fieldType: "phone" },
        { id: "skills", label: "Skills", accessorKey: "skills", fullWidth: true },
    ],
    navigable: true,
};

export const WORKER_PROFILES_PAGE: ListPageConfig = {
    entityKey: "worker_profile",
    description: "Extended worker profiles with skills and qualifications",
    icon: UserCog,
    createConfig: CREATE_WORKER_PROFILE_CONFIG,
    searchKeys: ["name", "department"],
    columns: [
        { id: "name", header: "Worker", accessorKey: "name" },
        { id: "department", header: "Department", accessorKey: "department", fieldType: "status" },
        {
            id: "classification",
            header: "Classification",
            accessorKey: "classification",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "hire_date", header: "Hired", accessorKey: "hire_date", fieldType: "date" },
    ],
    views: ["table", "cards", "chart"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "department",
        statusKey: "status",
        fields: [
            {
                id: "classification",
                label: "Classification",
                accessorKey: "classification",
                fieldType: "status",
            },
            { id: "hire_date", label: "Hired", accessorKey: "hire_date", fieldType: "date" },
        ],
    },
    chartConfig: {
        type: "pie",
        categoryKey: "department",
    },
    quickViewConfig: WORKER_PROFILE_QUICK_VIEW,
    exportable: true,
};

// ─── worker_review ───

export const WORKER_REVIEWS_PAGE: ListPageConfig = {
    entityKey: "worker_review",
    description: "Worker performance reviews and evaluations",
    icon: Star,
    createConfig: CREATE_WORKER_REVIEW_CONFIG,
    searchKeys: ["worker_name", "reviewer_name"],
    columns: [
        { id: "worker_name", header: "Worker", accessorKey: "worker_name" },
        { id: "reviewer_name", header: "Reviewer", accessorKey: "reviewer_name" },
        { id: "rating", header: "Rating", accessorKey: "rating" },
        {
            id: "review_period",
            header: "Period",
            accessorKey: "review_period",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    exportable: true,
};
