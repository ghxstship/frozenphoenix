/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — Projects Domain
   
   Declarative ListPageConfig objects for the projects domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import {
    CREATE_MILESTONE_CONFIG,
    CREATE_PROJECT_TEMPLATE_CONFIG,
} from "@/config/create-entity-configs";
import {
    CREATE_CHECKLIST_TEMPLATE_CONFIG,
    CREATE_PROJECT_ASSIGNMENT_CONFIG,
    CREATE_STAKEHOLDER_CONFIG,
    CREATE_STAKEHOLDER_PROJECT_CONFIG,
    CREATE_WORK_PACKAGE_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    BriefcaseBusiness,
    ClipboardCheck,
    Component,
    FolderCog,
    Milestone,
    UserPlus,
    Users,
} from "lucide-react";

// ─── checklist_template ───

export const CHECKLIST_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "checklist_template",
    description: "Standardized checklist templates for quality, safety, and operations",
    icon: ClipboardCheck,
    createConfig: CREATE_CHECKLIST_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── project_template ───

export const PROJECT_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "project_template",
    description: "Reusable project templates with pre-configured tasks and milestones",
    icon: FolderCog,
    createConfig: CREATE_PROJECT_TEMPLATE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "task_count", header: "Tasks", accessorKey: "task_count" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

// ─── stakeholder ───

export const STAKEHOLDERS_PAGE: ListPageConfig = {
    entityKey: "stakeholder",
    description: "Key stakeholders across projects, events, and business units",
    icon: BriefcaseBusiness,
    createConfig: CREATE_STAKEHOLDER_CONFIG,
    searchKeys: ["name", "organization"],
    columns: [
        { id: "name", header: "Stakeholder", accessorKey: "name" },
        { id: "organization", header: "Organization", accessorKey: "organization" },
        {
            id: "stakeholder_type",
            header: "Type",
            accessorKey: "stakeholder_type",
            fieldType: "status",
        },
        {
            id: "influence_level",
            header: "Influence",
            accessorKey: "influence_level",
            fieldType: "status",
        },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "cards", "chart"],
    defaultView: "table",
    cardConfig: {
        titleKey: "name",
        subtitleKey: "organization",
        statusKey: "influence_level",
        fields: [
            {
                id: "stakeholder_type",
                label: "Type",
                accessorKey: "stakeholder_type",
                fieldType: "status",
            },
        ],
    },
    chartConfig: {
        type: "pie",
        categoryKey: "stakeholder_type",
    },
};

// ─── work_package ───

export const WORK_PACKAGES_PAGE: ListPageConfig = {
    entityKey: "work_package",
    description: "Deliverable work packages within projects and scopes of work",
    icon: Component,
    createConfig: CREATE_WORK_PACKAGE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Package", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "budget", header: "Budget", accessorKey: "budget", fieldType: "currency" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    views: ["table", "board", "cards"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "due_date",
    },
    cardConfig: {
        titleKey: "name",
        subtitleKey: "description",
        statusKey: "status",
        fields: [
            { id: "budget", label: "Budget", accessorKey: "budget", fieldType: "currency" },
            { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        ],
    },
};

// ─── milestone ───

export const MILESTONES_PAGE: ListPageConfig = {
    entityKey: "milestone",
    description: "Project and production milestones",
    icon: Milestone,
    createConfig: CREATE_MILESTONE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Milestone", accessorKey: "name" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
        { id: "due_date", header: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "completion_percent", header: "Progress", accessorKey: "completion_percent" },
    ],
    views: ["table", "board", "calendar"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "name",
        cardSubtitleKey: "project_name",
    },
    calendarConfig: {
        titleKey: "name",
        dateKey: "due_date",
        colorKey: "status",
    },
};

// ─── project_assignment ───

export const PROJECT_ASSIGNMENTS_PAGE: ListPageConfig = {
    entityKey: "project_assignment",
    description: "Team member assignments to projects",
    icon: UserPlus,
    createConfig: CREATE_PROJECT_ASSIGNMENT_CONFIG,
    searchKeys: ["member_name", "project_name"],
    columns: [
        { id: "member_name", header: "Member", accessorKey: "member_name" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "assigned_at", header: "Assigned", accessorKey: "assigned_at", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "board", "cards"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "member_name",
        cardSubtitleKey: "project_name",
    },
    cardConfig: {
        titleKey: "member_name",
        subtitleKey: "project_name",
        statusKey: "status",
        fields: [
            { id: "role", label: "Role", accessorKey: "role", fieldType: "status" },
            { id: "assigned_at", label: "Assigned", accessorKey: "assigned_at", fieldType: "date" },
        ],
    },
};

// ─── stakeholder_project ───

export const STAKEHOLDER_PROJECTS_PAGE: ListPageConfig = {
    entityKey: "stakeholder_project",
    description: "Stakeholder-to-project relationship mappings",
    icon: Users,
    createConfig: CREATE_STAKEHOLDER_PROJECT_CONFIG,
    searchKeys: ["stakeholder_name", "project_name"],
    columns: [
        { id: "stakeholder_name", header: "Stakeholder", accessorKey: "stakeholder_name" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        {
            id: "influence_level",
            header: "Influence",
            accessorKey: "influence_level",
            fieldType: "status",
        },
        { id: "created_at", header: "Added", accessorKey: "created_at", fieldType: "date" },
    ],
};
