/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Production Domain
   
   Declarative ListPageConfig objects for the production domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import {
    CREATE_ADVANCE_TEMPLATE_CONFIG,
    CREATE_READINESS_GATE_CONFIG,
    CREATE_ROS_CUE_CONFIG,
    CREATE_TIME_ENTRY_CONFIG,
} from "@/config/create-entity-configs";
import {
    CREATE_COMMAND_POSITION_CONFIG,
    CREATE_FOH_ZONE_CONFIG,
    CREATE_LIVE_EVENT_CONFIG,
    CREATE_POST_EVENT_REPORT_CONFIG,
    CREATE_PRODUCTION_ADVANCE_CONFIG,
    CREATE_PRODUCTION_ADVANCE_ITEM_CONFIG,
    CREATE_PRODUCTION_BUDGET_LINE_CONFIG,
    CREATE_PRODUCTION_CHECKLIST_CONFIG,
    CREATE_PRODUCTION_EXPENSE_CONFIG,
    CREATE_PRODUCTION_MILESTONE_CONFIG,
    CREATE_PRODUCTION_RUN_CONFIG,
    CREATE_PRODUCTION_SOP_CONFIG,
    CREATE_PRODUCTION_TASK_CONFIG,
    CREATE_PRODUCTION_VERTICAL_CONFIG,
    CREATE_SPACE_BOOKING_CONFIG,
    CREATE_STRIKE_SEQUENCE_CONFIG,
    CREATE_TECHNICAL_SPEC_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    Archive,
    Calculator,
    ClipboardCheck,
    ClipboardList,
    Cog,
    DollarSign,
    FileCheck,
    FileText,
    Gauge,
    HandCoins,
    Landmark,
    LayoutGrid,
    ListChecks,
    MapPin,
    Milestone,
    Play,
    ScrollText,
    ShieldAlert,
    Thermometer,
    Timer,
    Users,
} from "lucide-react";

// ─── advance_template ───

export const ADVANCE_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "advance_template",
    description: "Reusable templates for production advance checklists and requirements",
    icon: FileText,
    createConfig: CREATE_ADVANCE_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Template", accessorKey: "name" },
            { id: "description", label: "Description", accessorKey: "description" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── foh_zone ───

export const FOH_ZONES_PAGE: ListPageConfig = {
    entityKey: "foh_zone",
    description: "Front-of-house zones for event and venue management",
    icon: MapPin,
    createConfig: CREATE_FOH_ZONE_CONFIG,
    searchKeys: ["name", "zone_type"],
    columns: [
        { id: "name", header: "Zone", accessorKey: "name" },
        { id: "zone_type", header: "Type", accessorKey: "zone_type", fieldType: "status" },
        { id: "capacity", header: "Capacity", accessorKey: "capacity" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Zone", accessorKey: "name" },
            { id: "zone_type", label: "Type", accessorKey: "zone_type", fieldType: "status" },
            { id: "capacity", label: "Capacity", accessorKey: "capacity" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── post_event_report ───

export const POST_EVENT_REPORTS_PAGE: ListPageConfig = {
    entityKey: "post_event_report",
    description: "Post-event debrief reports with metrics and lessons learned",
    icon: FileCheck,
    createConfig: CREATE_POST_EVENT_REPORT_CONFIG,
    searchKeys: ["title", "event_name"],
    columns: [
        { id: "title", header: "Report", accessorKey: "title" },
        { id: "event_name", header: "Event", accessorKey: "event_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "report_date", header: "Date", accessorKey: "report_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Report", accessorKey: "title" },
            { id: "event_name", label: "Event", accessorKey: "event_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "report_date", label: "Date", accessorKey: "report_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_advance ───

export const PRODUCTION_ADVANCES_PAGE: ListPageConfig = {
    entityKey: "production_advance",
    description: "Site advance visits and pre-production preparation checklists",
    icon: ClipboardCheck,
    createConfig: CREATE_PRODUCTION_ADVANCE_CONFIG,
    searchKeys: ["name", "location"],
    columns: [
        { id: "name", header: "Advance", accessorKey: "name" },
        { id: "location", header: "Location", accessorKey: "location" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "advance_date", header: "Date", accessorKey: "advance_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Advance", accessorKey: "name" },
            { id: "location", label: "Location", accessorKey: "location" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "advance_date", label: "Date", accessorKey: "advance_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_checklist ───

export const PRODUCTION_CHECKLISTS_PAGE: ListPageConfig = {
    entityKey: "production_checklist",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "active", label: "Active", value: "active" },
            { id: "completed", label: "Completed", value: "completed" },
        ],
    },
    description: "Day-of production checklists for events and shows",
    icon: ClipboardList,
    createConfig: CREATE_PRODUCTION_CHECKLIST_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Checklist", accessorKey: "title" },
        {
            id: "checklist_type",
            header: "Type",
            accessorKey: "checklist_type",
            fieldType: "status",
        },
        { id: "completion_percent", header: "Progress", accessorKey: "completion_percent" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Checklist", accessorKey: "title" },
            {
                id: "checklist_type",
                label: "Type",
                accessorKey: "checklist_type",
                fieldType: "status",
            },
            { id: "completion_percent", label: "Progress", accessorKey: "completion_percent" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_expense ───

export const PRODUCTION_EXPENSES_PAGE: ListPageConfig = {
    entityKey: "production_expense",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "pending", label: "Pending", value: "pending" },
            { id: "approved", label: "Approved", value: "approved" },
            { id: "rejected", label: "Rejected", value: "rejected" },
        ],
    },
    description: "Track expenses incurred during production runs",
    icon: DollarSign,
    createConfig: CREATE_PRODUCTION_EXPENSE_CONFIG,
    searchKeys: ["description", "category"],
    columns: [
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expense_date", header: "Date", accessorKey: "expense_date", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "category",
        valueKey: "amount",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "description", label: "Description", accessorKey: "description" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "expense_date", label: "Date", accessorKey: "expense_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_run ───

export const PRODUCTION_RUNS_PAGE: ListPageConfig = {
    entityKey: "production_run",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "active", label: "Active", value: "active" },
            { id: "planned", label: "Planned", value: "planned" },
            { id: "completed", label: "Completed", value: "completed" },
        ],
    },
    description: "Active production runs and event execution timelines",
    icon: Play,
    createConfig: CREATE_PRODUCTION_RUN_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Run", accessorKey: "name" },
        {
            id: "production_type",
            header: "Type",
            accessorKey: "production_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    views: ["table", "board", "timeline"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "production_type",
    },
    timelineConfig: {
        labelKey: "name",
        sublabelKey: "production_type",
        startDateKey: "start_date",
        endDateKey: "end_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Run", accessorKey: "name" },
            {
                id: "production_type",
                label: "Type",
                accessorKey: "production_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
            { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_sop ───

export const PRODUCTION_SOPS_PAGE: ListPageConfig = {
    entityKey: "production_sop",
    description: "Standard operating procedures for production workflows",
    icon: ScrollText,
    createConfig: CREATE_PRODUCTION_SOP_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "SOP", accessorKey: "title" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "version", header: "Version", accessorKey: "version" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "SOP", accessorKey: "title" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "version", label: "Version", accessorKey: "version" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_vertical ───

export const PRODUCTION_VERTICALS_PAGE: ListPageConfig = {
    entityKey: "production_vertical",
    description: "Production vertical categories and department classifications",
    icon: LayoutGrid,
    createConfig: CREATE_PRODUCTION_VERTICAL_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Vertical", accessorKey: "name" },
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Vertical", accessorKey: "name" },
            { id: "description", label: "Description", accessorKey: "description" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── space_booking ───

export const SPACE_BOOKINGS_PAGE: ListPageConfig = {
    entityKey: "space_booking",
    description: "Venue and space reservations for events and productions",
    icon: Landmark,
    createConfig: CREATE_SPACE_BOOKING_CONFIG,
    searchKeys: ["space_name", "event_name"],
    columns: [
        { id: "space_name", header: "Space", accessorKey: "space_name" },
        { id: "event_name", header: "Event", accessorKey: "event_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    views: ["table", "calendar", "timeline"],
    defaultView: "table",
    calendarConfig: {
        titleKey: "space_name",
        dateKey: "start_date",
        endDateKey: "end_date",
        colorKey: "status",
    },
    timelineConfig: {
        labelKey: "space_name",
        sublabelKey: "event_name",
        startDateKey: "start_date",
        endDateKey: "end_date",
        colorKey: "status",
        groupByKey: "space_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "space_name", label: "Space", accessorKey: "space_name" },
            { id: "event_name", label: "Event", accessorKey: "event_name" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
            { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── strike_sequence ───

export const STRIKE_SEQUENCES_PAGE: ListPageConfig = {
    entityKey: "strike_sequence",
    description: "Post-event teardown and strike sequence planning",
    icon: Archive,
    createConfig: CREATE_STRIKE_SEQUENCE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Sequence", accessorKey: "name" },
        { id: "direction", header: "Direction", accessorKey: "direction", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "scheduled_at", header: "Scheduled", accessorKey: "scheduled_at", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Sequence", accessorKey: "name" },
            { id: "direction", label: "Direction", accessorKey: "direction", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "scheduled_at",
                label: "Scheduled",
                accessorKey: "scheduled_at",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── technical_spec ───

export const TECHNICAL_SPECS_PAGE: ListPageConfig = {
    entityKey: "technical_spec",
    description: "Technical specifications and requirements for equipment and venues",
    icon: Cog,
    createConfig: CREATE_TECHNICAL_SPEC_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Spec", accessorKey: "title" },
        { id: "spec_type", header: "Type", accessorKey: "spec_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Spec", accessorKey: "title" },
            { id: "spec_type", label: "Type", accessorKey: "spec_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── command_position ───

export const COMMAND_POSITIONS_PAGE: ListPageConfig = {
    entityKey: "command_position",
    description: "Command structure positions for event operations",
    icon: Users,
    createConfig: CREATE_COMMAND_POSITION_CONFIG,
    searchKeys: ["title", "department"],
    columns: [
        { id: "title", header: "Position", accessorKey: "title" },
        { id: "department", header: "Department", accessorKey: "department", fieldType: "status" },
        { id: "assigned_to", header: "Assigned To", accessorKey: "assigned_to" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Position", accessorKey: "title" },
            {
                id: "department",
                label: "Department",
                accessorKey: "department",
                fieldType: "status",
            },
            { id: "assigned_to", label: "Assigned To", accessorKey: "assigned_to" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── environmental_reading ───

export const ENVIRONMENTAL_READINGS_PAGE: ListPageConfig = {
    entityKey: "environmental_reading",
    description: "Environmental sensor readings and measurements",
    icon: Thermometer,
    searchKeys: ["location_name", "reading_type"],
    columns: [
        { id: "location_name", header: "Location", accessorKey: "location_name" },
        { id: "reading_type", header: "Type", accessorKey: "reading_type", fieldType: "status" },
        { id: "value", header: "Value", accessorKey: "value" },
        { id: "unit", header: "Unit", accessorKey: "unit" },
        { id: "recorded_at", header: "Recorded", accessorKey: "recorded_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "location_name", label: "Location", accessorKey: "location_name" },
            { id: "reading_type", label: "Type", accessorKey: "reading_type", fieldType: "status" },
            { id: "value", label: "Value", accessorKey: "value" },
            { id: "unit", label: "Unit", accessorKey: "unit" },
            { id: "recorded_at", label: "Recorded", accessorKey: "recorded_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── foh_zone_reading ───

export const FOH_ZONE_READINGS_PAGE: ListPageConfig = {
    entityKey: "foh_zone_reading",
    description: "Real-time occupancy and sales readings for front-of-house zones",
    icon: Gauge,
    searchKeys: ["zone_name"],
    columns: [
        { id: "zone_name", header: "Zone", accessorKey: "zone_name" },
        { id: "occupancy", header: "Occupancy", accessorKey: "occupancy" },
        { id: "sales_amount", header: "Sales", accessorKey: "sales_amount", fieldType: "currency" },
        { id: "recorded_at", header: "Recorded", accessorKey: "recorded_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "zone_name", label: "Zone", accessorKey: "zone_name" },
            { id: "occupancy", label: "Occupancy", accessorKey: "occupancy" },
            {
                id: "sales_amount",
                label: "Sales",
                accessorKey: "sales_amount",
                fieldType: "currency",
            },
            { id: "recorded_at", label: "Recorded", accessorKey: "recorded_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── live_event_instance ───

export const LIVE_EVENT_INSTANCES_PAGE: ListPageConfig = {
    entityKey: "live_event_instance",
    description: "Individual instances or shows within live events",
    icon: Play,
    createConfig: CREATE_LIVE_EVENT_CONFIG,
    searchKeys: ["name", "event_name"],
    columns: [
        { id: "name", header: "Instance", accessorKey: "name" },
        { id: "event_name", header: "Event", accessorKey: "event_name" },
        { id: "start_time", header: "Start", accessorKey: "start_time", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "attendance", header: "Attendance", accessorKey: "attendance" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Instance", accessorKey: "name" },
            { id: "event_name", label: "Event", accessorKey: "event_name" },
            { id: "start_time", label: "Start", accessorKey: "start_time", fieldType: "date" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "attendance", label: "Attendance", accessorKey: "attendance" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── live_financial_snapshot ───

export const LIVE_FINANCIAL_SNAPSHOTS_PAGE: ListPageConfig = {
    entityKey: "live_financial_snapshot",
    description: "Point-in-time financial snapshots for live events",
    icon: DollarSign,
    searchKeys: ["event_name"],
    columns: [
        { id: "event_name", header: "Event", accessorKey: "event_name" },
        {
            id: "revenue_tickets",
            header: "Ticket Revenue",
            accessorKey: "revenue_tickets",
            fieldType: "currency",
        },
        {
            id: "revenue_foh",
            header: "FOH Revenue",
            accessorKey: "revenue_foh",
            fieldType: "currency",
        },
        {
            id: "total_expenses",
            header: "Expenses",
            accessorKey: "total_expenses",
            fieldType: "currency",
        },
        { id: "snapshot_at", header: "Snapshot", accessorKey: "snapshot_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "event_name", label: "Event", accessorKey: "event_name" },
            {
                id: "revenue_tickets",
                label: "Ticket Revenue",
                accessorKey: "revenue_tickets",
                fieldType: "currency",
            },
            {
                id: "revenue_foh",
                label: "FOH Revenue",
                accessorKey: "revenue_foh",
                fieldType: "currency",
            },
            {
                id: "total_expenses",
                label: "Expenses",
                accessorKey: "total_expenses",
                fieldType: "currency",
            },
            { id: "snapshot_at", label: "Snapshot", accessorKey: "snapshot_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_advance_item ───

export const PRODUCTION_ADVANCE_ITEMS_PAGE: ListPageConfig = {
    entityKey: "production_advance_item",
    description: "Line items within production advances",
    icon: HandCoins,
    createConfig: CREATE_PRODUCTION_ADVANCE_ITEM_CONFIG,
    searchKeys: ["catalog_item_id", "operational_purpose", "special_requests"],
    columns: [
        { id: "catalog_item_id", header: "Item", accessorKey: "catalog_item_id" },
        { id: "category_id", header: "Category", accessorKey: "category_id" },
        { id: "quantity_requested", header: "Qty", accessorKey: "quantity_requested" },
        { id: "unit_cost", header: "Unit Cost", accessorKey: "unit_cost", fieldType: "currency" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "catalog_item_id", label: "Item", accessorKey: "catalog_item_id" },
            { id: "category_id", label: "Category", accessorKey: "category_id" },
            { id: "quantity_requested", label: "Qty", accessorKey: "quantity_requested" },
            {
                id: "unit_cost",
                label: "Unit Cost",
                accessorKey: "unit_cost",
                fieldType: "currency",
            },
            { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_budget_line ───

export const PRODUCTION_BUDGET_LINES_PAGE: ListPageConfig = {
    entityKey: "production_budget_line",
    description: "Line items within production budgets",
    icon: Calculator,
    createConfig: CREATE_PRODUCTION_BUDGET_LINE_CONFIG,
    searchKeys: ["description", "category"],
    columns: [
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        {
            id: "budgeted_amount",
            header: "Budgeted",
            accessorKey: "budgeted_amount",
            fieldType: "currency",
        },
        {
            id: "actual_amount",
            header: "Actual",
            accessorKey: "actual_amount",
            fieldType: "currency",
        },
        { id: "variance", header: "Variance", accessorKey: "variance", fieldType: "currency" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "bar",
        categoryKey: "category",
        valueKey: "budgeted_amount",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "description", label: "Description", accessorKey: "description" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            {
                id: "budgeted_amount",
                label: "Budgeted",
                accessorKey: "budgeted_amount",
                fieldType: "currency",
            },
            {
                id: "actual_amount",
                label: "Actual",
                accessorKey: "actual_amount",
                fieldType: "currency",
            },
            { id: "variance", label: "Variance", accessorKey: "variance", fieldType: "currency" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_milestone ───

export const PRODUCTION_MILESTONES_PAGE: ListPageConfig = {
    entityKey: "production_milestone",
    description: "Key milestones within production runs",
    icon: Milestone,
    createConfig: CREATE_PRODUCTION_MILESTONE_CONFIG,
    searchKeys: ["name", "production_run_name"],
    columns: [
        { id: "name", header: "Milestone", accessorKey: "name" },
        {
            id: "production_run_name",
            header: "Production",
            accessorKey: "production_run_name",
        },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "production_run_name",
    },
    calendarConfig: {
        titleKey: "name",
        dateKey: "due_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Milestone", accessorKey: "name" },
            { id: "production_run_name", label: "Production", accessorKey: "production_run_name" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_task ───

export const PRODUCTION_TASKS_PAGE: ListPageConfig = {
    entityKey: "production_task",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "todo", label: "To Do", value: "todo" },
            { id: "in_progress", label: "In Progress", value: "in_progress" },
            { id: "done", label: "Done", value: "done" },
        ],
    },
    description: "Individual tasks within production runs and event preparations",
    icon: ListChecks,
    createConfig: CREATE_PRODUCTION_TASK_CONFIG,
    searchKeys: ["title", "assignee_name"],
    columns: [
        { id: "title", header: "Task", accessorKey: "title" },
        { id: "assignee_name", header: "Assignee", accessorKey: "assignee_name" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "assignee_name",
    },
    calendarConfig: {
        titleKey: "title",
        dateKey: "due_date",
        colorKey: "priority",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Task", accessorKey: "title" },
            { id: "assignee_name", label: "Assignee", accessorKey: "assignee_name" },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── production_time_entry ───

export const PRODUCTION_TIME_ENTRIES_PAGE: ListPageConfig = {
    entityKey: "production_time_entry",
    description: "Time entries logged against production tasks",
    icon: Timer,
    createConfig: CREATE_TIME_ENTRY_CONFIG,
    searchKeys: ["worker_name", "task_name"],
    columns: [
        { id: "worker_name", header: "Worker", accessorKey: "worker_name" },
        { id: "task_name", header: "Task", accessorKey: "task_name" },
        { id: "hours", header: "Hours", accessorKey: "hours" },
        { id: "entry_date", header: "Date", accessorKey: "entry_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "calendar"],
    defaultView: "table",
    calendarConfig: {
        titleKey: "worker_name",
        dateKey: "entry_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "worker_name", label: "Worker", accessorKey: "worker_name" },
            { id: "task_name", label: "Task", accessorKey: "task_name" },
            { id: "hours", label: "Hours", accessorKey: "hours" },
            { id: "entry_date", label: "Date", accessorKey: "entry_date", fieldType: "date" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── readiness_gate ───

export const READINESS_GATES_PAGE: ListPageConfig = {
    entityKey: "readiness_gate",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "pending", label: "Pending", value: "pending" },
            { id: "passed", label: "Passed", value: "passed" },
            { id: "failed", label: "Failed", value: "failed" },
        ],
    },
    description: "Go/no-go readiness gates for production launches",
    icon: ShieldAlert,
    createConfig: CREATE_READINESS_GATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Gate", accessorKey: "name" },
        { id: "gate_type", header: "Type", accessorKey: "gate_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "approved_at", header: "Approved", accessorKey: "approved_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "gate_type",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Gate", accessorKey: "name" },
            { id: "gate_type", label: "Type", accessorKey: "gate_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
            { id: "approved_at", label: "Approved", accessorKey: "approved_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── ros_cue ───

export const ROS_CUES_PAGE: ListPageConfig = {
    entityKey: "ros_cue",
    description: "Run-of-show cues and timing marks",
    icon: Play,
    createConfig: CREATE_ROS_CUE_CONFIG,
    searchKeys: ["name", "cue_type"],
    columns: [
        { id: "name", header: "Cue", accessorKey: "name" },
        { id: "cue_type", header: "Type", accessorKey: "cue_type", fieldType: "status" },
        {
            id: "scheduled_time",
            header: "Scheduled",
            accessorKey: "scheduled_time",
            fieldType: "date",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "order", header: "Order", accessorKey: "order" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Cue", accessorKey: "name" },
            { id: "cue_type", label: "Type", accessorKey: "cue_type", fieldType: "status" },
            {
                id: "scheduled_time",
                label: "Scheduled",
                accessorKey: "scheduled_time",
                fieldType: "date",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "order", label: "Order", accessorKey: "order" },
        ],
        navigable: true,
    },
    exportable: true,
};
