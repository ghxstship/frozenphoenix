/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Crm Domain
   
   Declarative ListPageConfig objects for the crm domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import type { QuickViewConfig } from "@/types/detail-page-config";
import { CREATE_CONTACT_CONFIG } from "@/config/create-entity-configs";
import {
    CREATE_GUEST_INCIDENT_CONFIG,
    CREATE_LOST_REASON_CONFIG,
    CREATE_TESTIMONIAL_CONFIG,
    CREATE_UPSELL_TRIGGER_CONFIG,
    CREATE_VIP_GUEST_CONFIG,
    CREATE_VIP_SERVICE_REQUEST_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    AlertTriangle,
    Award,
    HeartPulse,
    ShieldAlert,
    Sparkles,
    Star,
    Users,
    Wand2,
    Zap,
} from "lucide-react";

// ─── contact ───

const CONTACT_QUICK_VIEW: QuickViewConfig = {
    previewFields: [
        { id: "email", label: "Email", accessorKey: "email", fieldType: "email" },
        { id: "phone", label: "Phone", accessorKey: "phone", fieldType: "phone" },
        { id: "company", label: "Company", accessorKey: "company" },
        { id: "contact_type", label: "Type", accessorKey: "contact_type", fieldType: "status" },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    navigable: true,
};

export const CONTACTS_PAGE: ListPageConfig = {
    entityKey: "contact",
    description: "People and organization contacts across all business relationships",
    icon: Users,
    createConfig: CREATE_CONTACT_CONFIG,
    searchKeys: ["name", "email", "company"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "company", header: "Company", accessorKey: "company" },
        { id: "contact_type", header: "Type", accessorKey: "contact_type", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "company",
        statusKey: "contact_type",
        fields: [{ id: "email", label: "Email", accessorKey: "email" }],
    },
    quickViewConfig: CONTACT_QUICK_VIEW,
    exportable: true,
};

// ─── guest_incident ───

export const GUEST_INCIDENTS_PAGE: ListPageConfig = {
    entityKey: "guest_incident",
    description: "Log and manage guest-facing incidents at events and venues",
    icon: ShieldAlert,
    createConfig: CREATE_GUEST_INCIDENT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Incident", accessorKey: "title" },
        { id: "incident_type", header: "Type", accessorKey: "incident_type", fieldType: "status" },
        { id: "severity", header: "Severity", accessorKey: "severity", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "reported_at", header: "Reported", accessorKey: "reported_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "description",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Incident", accessorKey: "title" },
            {
                id: "incident_type",
                label: "Type",
                accessorKey: "incident_type",
                fieldType: "status",
            },
            { id: "severity", label: "Severity", accessorKey: "severity", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
            { id: "reported_at", label: "Reported", accessorKey: "reported_at", fieldType: "date" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── lost_reason ───

export const LOST_REASONS_PAGE: ListPageConfig = {
    entityKey: "lost_reason",
    description: "Catalog of reasons for lost deals and opportunities",
    icon: AlertTriangle,
    createConfig: CREATE_LOST_REASON_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Reason", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Reason", accessorKey: "name" },
            { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── testimonial ───

export const TESTIMONIALS_PAGE: ListPageConfig = {
    entityKey: "testimonial",
    description: "Client and partner testimonials and endorsements",
    icon: Award,
    createConfig: CREATE_TESTIMONIAL_CONFIG,
    searchKeys: ["author_name", "content"],
    columns: [
        { id: "author_name", header: "Author", accessorKey: "author_name" },
        { id: "company", header: "Company", accessorKey: "company" },
        { id: "rating", header: "Rating", accessorKey: "rating" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "author_name", label: "Author", accessorKey: "author_name" },
            { id: "company", label: "Company", accessorKey: "company" },
            { id: "rating", label: "Rating", accessorKey: "rating" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vip_guest ───

export const VIP_GUESTS_PAGE: ListPageConfig = {
    entityKey: "vip_guest",
    description: "VIP guest lists, hospitality requirements, and access management",
    icon: Star,
    createConfig: CREATE_VIP_GUEST_CONFIG,
    searchKeys: ["name", "organization"],
    columns: [
        { id: "name", header: "Guest", accessorKey: "name" },
        { id: "organization", header: "Organization", accessorKey: "organization" },
        { id: "vip_tier", header: "Tier", accessorKey: "vip_tier", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "organization",
        statusKey: "vip_tier",
    },
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Guest", accessorKey: "name" },
            { id: "organization", label: "Organization", accessorKey: "organization" },
            { id: "vip_tier", label: "Tier", accessorKey: "vip_tier", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── vip_service_request ───

export const VIP_SERVICE_REQUESTS_PAGE: ListPageConfig = {
    entityKey: "vip_service_request",
    description: "Special service requests for VIP guests and high-profile attendees",
    icon: Wand2,
    createConfig: CREATE_VIP_SERVICE_REQUEST_CONFIG,
    searchKeys: ["title", "guest_name"],
    columns: [
        { id: "title", header: "Request", accessorKey: "title" },
        { id: "guest_name", header: "Guest", accessorKey: "guest_name" },
        { id: "service_type", header: "Type", accessorKey: "service_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "title",
        cardSubtitleKey: "guest_name",
    },
    quickViewConfig: {
        previewFields: [
            { id: "title", label: "Request", accessorKey: "title" },
            { id: "guest_name", label: "Guest", accessorKey: "guest_name" },
            { id: "service_type", label: "Type", accessorKey: "service_type", fieldType: "status" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── account_health_score ───

export const ACCOUNT_HEALTH_SCORES_PAGE: ListPageConfig = {
    entityKey: "account_health_score",
    description: "Health scores and engagement metrics for client accounts",
    icon: HeartPulse,
    searchKeys: ["account_name"],
    columns: [
        { id: "account_name", header: "Account", accessorKey: "account_name" },
        { id: "score", header: "Score", accessorKey: "score" },
        { id: "trend", header: "Trend", accessorKey: "trend", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    views: ["table", "cards", "chart"],
    defaultView: "table",
    cardConfig: {
        titleKey: "account_name",
        statusKey: "trend",
        fields: [{ id: "score", label: "Score", accessorKey: "score" }],
    },
    chartConfig: {
        type: "pie",
        categoryKey: "trend",
    },
    quickViewConfig: {
        previewFields: [
            { id: "account_name", label: "Account", accessorKey: "account_name" },
            { id: "score", label: "Score", accessorKey: "score" },
            { id: "trend", label: "Trend", accessorKey: "trend", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── upsell_event ───

export const UPSELL_EVENTS_PAGE: ListPageConfig = {
    entityKey: "upsell_event",
    description: "Upsell events and conversion tracking",
    icon: Sparkles,
    searchKeys: ["event_type", "customer_name"],
    columns: [
        { id: "event_type", header: "Event", accessorKey: "event_type" },
        { id: "customer_name", header: "Customer", accessorKey: "customer_name" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "event_type", label: "Event", accessorKey: "event_type" },
            { id: "customer_name", label: "Customer", accessorKey: "customer_name" },
            { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
            { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};

// ─── upsell_trigger ───

export const UPSELL_TRIGGERS_PAGE: ListPageConfig = {
    entityKey: "upsell_trigger",
    description: "Automated upsell trigger rules and conditions",
    icon: Zap,
    createConfig: CREATE_UPSELL_TRIGGER_CONFIG,
    searchKeys: ["name", "trigger_type"],
    columns: [
        { id: "name", header: "Trigger", accessorKey: "name" },
        { id: "trigger_type", header: "Type", accessorKey: "trigger_type", fieldType: "status" },
        { id: "condition", header: "Condition", accessorKey: "condition" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    quickViewConfig: {
        previewFields: [
            { id: "name", label: "Trigger", accessorKey: "name" },
            { id: "trigger_type", label: "Type", accessorKey: "trigger_type", fieldType: "status" },
            { id: "condition", label: "Condition", accessorKey: "condition" },
            { id: "is_active", label: "Active", accessorKey: "is_active", fieldType: "status" },
        ],
        navigable: true,
    },
    exportable: true,
};
