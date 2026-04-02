/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Operations Domain
   
   Declarative ListPageConfig objects for the operations domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import {
    CREATE_INVENTORY_ITEM_CONFIG,
    CREATE_RENTAL_AGREEMENT_CONFIG,
    CREATE_RESOURCE_BOOKING_CONFIG,
} from "@/config/create-entity-configs";
import {
    CREATE_BOM_CONFIG,
    CREATE_CONSUMABLE_CONFIG,
    CREATE_CONSUMABLE_USAGE_CONFIG,
    CREATE_EQUIPMENT_CHECK_IN_CONFIG,
    CREATE_INVENTORY_AUDIT_CONFIG,
    CREATE_KIT_CONFIG,
    CREATE_LOAD_PLAN_CONFIG,
    CREATE_MAINTENANCE_RECORD_CONFIG,
    CREATE_MAINTENANCE_SCHEDULE_CONFIG,
    CREATE_QC_GATE_CONFIG,
    CREATE_QUALITY_CHECK_TEMPLATE_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    Archive,
    ArrowRightLeft,
    Box,
    Boxes,
    CalendarClock,
    ClipboardCheck,
    ClipboardList,
    Gauge,
    HandCoins,
    Microscope,
    Package,
    Truck,
    Wrench,
} from "lucide-react";

// ─── bom ───

export const BOMS_PAGE: ListPageConfig = {
    entityKey: "bom",
    description: "Bills of materials for productions, events, and projects",
    icon: Boxes,
    createConfig: CREATE_BOM_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "BOM", accessorKey: "name" },
        { id: "bom_type", header: "Type", accessorKey: "bom_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "total_cost",
            header: "Total Cost",
            accessorKey: "total_cost",
            fieldType: "currency",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "BOM", accessorKey: "name" },
            { id: "bom_type", label: "Type", accessorKey: "bom_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "total_cost",
                label: "Total Cost",
                accessorKey: "total_cost",
                fieldType: "currency",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── consumable ───

export const CONSUMABLES_PAGE: ListPageConfig = {
    entityKey: "consumable",
    description: "Track expendable supplies, materials, and consumable inventory",
    icon: Package,
    createConfig: CREATE_CONSUMABLE_CONFIG,
    searchKeys: ["name", "sku"],
    columns: [
        { id: "name", header: "Item", accessorKey: "name" },
        { id: "sku", header: "SKU", accessorKey: "sku" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "quantity_on_hand", header: "On Hand", accessorKey: "quantity_on_hand" },
        { id: "unit_cost", header: "Unit Cost", accessorKey: "unit_cost", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "cards", "chart"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "sku",
        statusKey: "status",
        fields: [
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "quantity_on_hand", label: "On Hand", accessorKey: "quantity_on_hand" },
            {
                id: "unit_cost",
                label: "Unit Cost",
                accessorKey: "unit_cost",
                fieldType: "currency",
            },
        ],
    },
    chartConfig: {
        type: "bar",
        categoryKey: "category",
        valueKey: "quantity_on_hand",
        aggregation: "sum",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Item", accessorKey: "name" },
            { id: "sku", label: "SKU", accessorKey: "sku" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "quantity_on_hand", label: "On Hand", accessorKey: "quantity_on_hand" },
            {
                id: "unit_cost",
                label: "Unit Cost",
                accessorKey: "unit_cost",
                fieldType: "currency",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── inventory_audit ───

export const INVENTORY_AUDITS_PAGE: ListPageConfig = {
    entityKey: "inventory_audit",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "planned", label: "Planned", value: "planned" },
            { id: "in_progress", label: "In Progress", value: "in_progress" },
            { id: "completed", label: "Completed", value: "completed" },
        ],
    },
    description: "Physical inventory counts and reconciliation audits",
    icon: ClipboardList,
    createConfig: CREATE_INVENTORY_AUDIT_CONFIG,
    searchKeys: ["name", "location"],
    columns: [
        { id: "name", header: "Audit", accessorKey: "name" },
        { id: "location", header: "Location", accessorKey: "location" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "audit_date", header: "Date", accessorKey: "audit_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Audit", accessorKey: "name" },
            { id: "location", label: "Location", accessorKey: "location" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "audit_date", label: "Date", accessorKey: "audit_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── kit ───

export const KITS_PAGE: ListPageConfig = {
    entityKey: "kit",
    description: "Pre-packaged equipment kits and inventory bundles",
    icon: Box,
    createConfig: CREATE_KIT_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Kit", accessorKey: "name" },
        { id: "kit_type", header: "Type", accessorKey: "kit_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "total_value", header: "Value", accessorKey: "total_value", fieldType: "currency" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Kit", accessorKey: "name" },
            { id: "kit_type", label: "Type", accessorKey: "kit_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "total_value",
                label: "Value",
                accessorKey: "total_value",
                fieldType: "currency",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── load_plan ───

export const LOAD_PLANS_PAGE: ListPageConfig = {
    entityKey: "load_plan",
    description: "Logistics load plans for truck packing and shipping coordination",
    icon: Truck,
    createConfig: CREATE_LOAD_PLAN_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Load Plan", accessorKey: "name" },
        { id: "vehicle", header: "Vehicle", accessorKey: "vehicle" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "departure_date",
            header: "Departure",
            accessorKey: "departure_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "vehicle",
    },
    calendarConfig: {
        titleKey: "name",
        dateKey: "departure_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Load Plan", accessorKey: "name" },
            { id: "vehicle", label: "Vehicle", accessorKey: "vehicle" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "departure_date",
                label: "Departure",
                accessorKey: "departure_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── maintenance_record ───

export const MAINTENANCE_RECORDS_PAGE: ListPageConfig = {
    entityKey: "maintenance_record",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "open", label: "Open", value: "open" },
            { id: "in_progress", label: "In Progress", value: "in_progress" },
            { id: "completed", label: "Completed", value: "completed" },
        ],
    },
    description: "Equipment maintenance history and scheduled service records",
    icon: Wrench,
    createConfig: CREATE_MAINTENANCE_RECORD_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Record", accessorKey: "title" },
        {
            id: "maintenance_type",
            header: "Type",
            accessorKey: "maintenance_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "scheduled_date",
            header: "Scheduled",
            accessorKey: "scheduled_date",
            fieldType: "date",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "maintenance_type",
    },
    calendarConfig: {
        titleKey: "title",
        dateKey: "scheduled_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Record", accessorKey: "title" },
            {
                id: "maintenance_type",
                label: "Type",
                accessorKey: "maintenance_type",
                fieldType: "status",
            },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "scheduled_date",
                label: "Scheduled",
                accessorKey: "scheduled_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── qc_gate ───

export const QC_GATES_PAGE: ListPageConfig = {
    entityKey: "qc_gate",
    description: "Quality control checkpoints and approval gates",
    icon: Gauge,
    createConfig: CREATE_QC_GATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Gate", accessorKey: "name" },
        { id: "gate_type", header: "Type", accessorKey: "gate_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Gate", accessorKey: "name" },
            { id: "gate_type", label: "Type", accessorKey: "gate_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── quality_check_template ───

export const QUALITY_CHECK_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "quality_check_template",
    description: "Standardized quality check templates for consistent inspections",
    icon: Microscope,
    createConfig: CREATE_QUALITY_CHECK_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "check_count", header: "Checks", accessorKey: "check_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Template", accessorKey: "name" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "check_count", label: "Checks", accessorKey: "check_count" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── rental_agreement ───

export const RENTAL_AGREEMENTS_PAGE: ListPageConfig = {
    entityKey: "rental_agreement",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "active", label: "Active", value: "active" },
            { id: "draft", label: "Draft", value: "draft" },
            { id: "expired", label: "Expired", value: "expired" },
        ],
    },
    description: "Equipment and venue rental agreements and lease tracking",
    icon: HandCoins,
    createConfig: CREATE_RENTAL_AGREEMENT_CONFIG,
    searchKeys: ["title", "vendor_name"],
    columns: [
        { id: "title", header: "Agreement", accessorKey: "title" },
        { id: "vendor_name", header: "Vendor", accessorKey: "vendor_name" },
        { id: "total_cost", header: "Total", accessorKey: "total_cost", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
    ],
    views: ["table", "board", "timeline"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "vendor_name",
    },
    timelineConfig: {
        labelKey: "title",
        sublabelKey: "vendor_name",
        startDateKey: "start_date",
        endDateKey: "start_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Agreement", accessorKey: "title" },
            { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
            { id: "total_cost", label: "Total", accessorKey: "total_cost", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── resource_booking ───

export const RESOURCE_BOOKINGS_PAGE: ListPageConfig = {
    entityKey: "resource_booking",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "confirmed", label: "Confirmed", value: "confirmed" },
            { id: "pending", label: "Pending", value: "pending" },
            { id: "cancelled", label: "Cancelled", value: "cancelled" },
        ],
    },
    description: "Book and schedule shared resources across projects and events",
    icon: CalendarClock,
    createConfig: CREATE_RESOURCE_BOOKING_CONFIG,
    searchKeys: ["resource_name", "description"],
    columns: [
        { id: "resource_name", header: "Resource", accessorKey: "resource_name" },
        { id: "booking_type", header: "Type", accessorKey: "booking_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "start_date", header: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", header: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    views: ["table", "timeline", "calendar"],
    defaultView: "table",
    timelineConfig: {
        labelKey: "resource_name",
        sublabelKey: "booking_type",
        startDateKey: "start_date",
        endDateKey: "end_date",
        colorKey: "status",
    },
    calendarConfig: {
        titleKey: "resource_name",
        dateKey: "start_date",
        endDateKey: "end_date",
        colorKey: "status",
    },
    quickViewConfig: {
        previewFields: [
            { id: "resource_name", label: "Resource", accessorKey: "resource_name" },
            { id: "booking_type", label: "Type", accessorKey: "booking_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
            { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── consumable_usage ───

export const CONSUMABLE_USAGE_PAGE: ListPageConfig = {
    entityKey: "consumable_usage",
    description: "Usage tracking for consumable materials and supplies",
    icon: Boxes,
    createConfig: CREATE_CONSUMABLE_USAGE_CONFIG,
    searchKeys: ["consumable_name", "used_by"],
    columns: [
        { id: "consumable_name", header: "Consumable", accessorKey: "consumable_name" },
        { id: "quantity", header: "Qty", accessorKey: "quantity" },
        { id: "used_by", header: "Used By", accessorKey: "used_by" },
        { id: "usage_date", header: "Date", accessorKey: "usage_date", fieldType: "date" },
        { id: "created_at", header: "Logged", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "consumable_name", label: "Consumable", accessorKey: "consumable_name" },
            { id: "quantity", label: "Qty", accessorKey: "quantity" },
            { id: "used_by", label: "Used By", accessorKey: "used_by" },
            { id: "usage_date", label: "Date", accessorKey: "usage_date", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── equipment_check_in ───

export const EQUIPMENT_CHECK_INS_PAGE: ListPageConfig = {
    entityKey: "equipment_check_in",
    description: "Equipment check-in and check-out records",
    icon: ClipboardCheck,
    createConfig: CREATE_EQUIPMENT_CHECK_IN_CONFIG,
    searchKeys: ["equipment_name", "checked_by"],
    columns: [
        { id: "equipment_name", header: "Equipment", accessorKey: "equipment_name" },
        { id: "checked_by", header: "Checked By", accessorKey: "checked_by" },
        { id: "check_type", header: "Type", accessorKey: "check_type", fieldType: "status" },
        { id: "condition", header: "Condition", accessorKey: "condition", fieldType: "status" },
        { id: "checked_at", header: "Date", accessorKey: "checked_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "equipment_name", label: "Equipment", accessorKey: "equipment_name" },
            { id: "checked_by", label: "Checked By", accessorKey: "checked_by" },
            { id: "check_type", label: "Type", accessorKey: "check_type", fieldType: "status" },
            { id: "condition", label: "Condition", accessorKey: "condition", fieldType: "status" },
            { id: "checked_at", label: "Date", accessorKey: "checked_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── inventory_reservation ───

export const INVENTORY_RESERVATIONS_PAGE: ListPageConfig = {
    entityKey: "inventory_reservation",
    description: "Inventory reservations for events, projects, and orders",
    icon: Archive,
    createConfig: CREATE_INVENTORY_ITEM_CONFIG,
    searchKeys: ["item_name", "reserved_for"],
    columns: [
        { id: "item_name", header: "Item", accessorKey: "item_name" },
        { id: "reserved_for", header: "Reserved For", accessorKey: "reserved_for" },
        { id: "quantity", header: "Qty", accessorKey: "quantity" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "reserved_until", header: "Until", accessorKey: "reserved_until", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "item_name", label: "Item", accessorKey: "item_name" },
            { id: "reserved_for", label: "Reserved For", accessorKey: "reserved_for" },
            { id: "quantity", label: "Qty", accessorKey: "quantity" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            {
                id: "reserved_until",
                label: "Until",
                accessorKey: "reserved_until",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── logistics_event ───

export const LOGISTICS_EVENTS_PAGE: ListPageConfig = {
    entityKey: "logistics_event",
    description: "Logistics events and shipment tracking milestones",
    icon: Truck,
    searchKeys: ["description", "event_type"],
    columns: [
        { id: "description", header: "Event", accessorKey: "description" },
        { id: "event_type", header: "Type", accessorKey: "event_type", fieldType: "status" },
        { id: "shipment_name", header: "Shipment", accessorKey: "shipment_name" },
        { id: "location", header: "Location", accessorKey: "location" },
        { id: "occurred_at", header: "Date", accessorKey: "occurred_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "description", label: "Event", accessorKey: "description" },
            { id: "event_type", label: "Type", accessorKey: "event_type", fieldType: "status" },
            { id: "shipment_name", label: "Shipment", accessorKey: "shipment_name" },
            { id: "location", label: "Location", accessorKey: "location" },
            { id: "occurred_at", label: "Date", accessorKey: "occurred_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── maintenance_schedule ───

export const MAINTENANCE_SCHEDULES_PAGE: ListPageConfig = {
    entityKey: "maintenance_schedule",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "active", label: "Active", value: "active" },
            { id: "completed", label: "Completed", value: "completed" },
        ],
    },
    description: "Preventive maintenance schedules for equipment and assets",
    icon: Wrench,
    createConfig: CREATE_MAINTENANCE_SCHEDULE_CONFIG,
    searchKeys: ["name", "equipment_name"],
    columns: [
        { id: "name", header: "Schedule", accessorKey: "name" },
        { id: "equipment_name", header: "Equipment", accessorKey: "equipment_name" },
        { id: "frequency", header: "Frequency", accessorKey: "frequency", fieldType: "status" },
        { id: "next_due", header: "Next Due", accessorKey: "next_due", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Schedule", accessorKey: "name" },
            { id: "equipment_name", label: "Equipment", accessorKey: "equipment_name" },
            { id: "frequency", label: "Frequency", accessorKey: "frequency", fieldType: "status" },
            { id: "next_due", label: "Next Due", accessorKey: "next_due", fieldType: "date" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── transfer_order ───

export const TRANSFER_ORDERS_PAGE: ListPageConfig = {
    entityKey: "transfer_order",
    scopingTabs: {
        groupByKey: "status",
        items: [
            { id: "all", label: "All" },
            { id: "pending", label: "Pending", value: "pending" },
            { id: "in_transit", label: "In Transit", value: "in_transit" },
            { id: "completed", label: "Completed", value: "completed" },
        ],
    },
    description: "Inter-location asset and inventory transfer orders",
    icon: ArrowRightLeft,
    searchKeys: ["transfer_number", "notes"],
    columns: [
        { id: "transfer_number", header: "Transfer #", accessorKey: "transfer_number" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "status" },
        { id: "total_items", header: "Items", accessorKey: "total_items" },
        {
            id: "requested_date",
            header: "Requested",
            accessorKey: "requested_date",
            fieldType: "date",
        },
        {
            id: "expected_arrival_date",
            header: "Expected Arrival",
            accessorKey: "expected_arrival_date",
            fieldType: "date",
        },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        columnLabels: {
            draft: "Draft",
            requested: "Requested",
            approved: "Approved",
            in_transit: "In Transit",
            partially_received: "Partial",
            received: "Received",
            cancelled: "Cancelled",
        },
        cardTitleKey: "transfer_number",
    },
    quickViewConfig: {
        previewFields: [
            { id: "transfer_number", label: "Transfer #", accessorKey: "transfer_number" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
            { id: "total_items", label: "Items", accessorKey: "total_items" },
            {
                id: "requested_date",
                label: "Requested",
                accessorKey: "requested_date",
                fieldType: "date",
            },
        ],
        navigable: true,
    },
    exportable: true,
};
