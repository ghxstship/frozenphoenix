/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Tool Definitions (JSON Schema)
   
   Declarative tool definitions for platform-native tool calling.
   Phase 1 tools are READ-ONLY — no direct DB writes from copilot.
   
   Tools are organized by domain and tagged with required RBAC
   resources so the orchestrator can gate access per user role.
   ═══════════════════════════════════════════════════════════════ */

import type { ToolDefinition } from "../types";

export interface PlatformTool extends ToolDefinition {
    /** RBAC resource + action required to invoke this tool */
    requiredPermission: { resource: string; action: "read" | "write" | "delete" | "manage" };
    /** Whether this tool performs a write operation (blocked in Phase 1) */
    isWrite: boolean;
    /** Domain category for UI grouping */
    category: "query" | "search" | "generate" | "calculate" | "navigate";
}

// ─── Query Tools (read-only DB access) ───────────────────────

const queryProjects: PlatformTool = {
    name: "query_projects",
    description:
        "Search and list projects. Returns project name, status, dates, budget summary, and team. " +
        "Use this when the user asks about projects, timelines, or project status.",
    parameters: {
        type: "object",
        properties: {
            search: {
                type: "string",
                description: "Free-text search across project names and descriptions",
            },
            status: {
                type: "string",
                enum: ["draft", "active", "on_hold", "completed", "archived"],
                description: "Filter by project status",
            },
            limit: { type: "number", description: "Max results (default 10, max 50)", default: 10 },
        },
    },
    requiredPermission: { resource: "projects", action: "read" },
    isWrite: false,
    category: "query",
};

const queryTasks: PlatformTool = {
    name: "query_tasks",
    description:
        "Search tasks by project, assignee, status, or due date. Returns task title, status, " +
        "priority, assignee, and due date. Use when user asks about tasks, workload, or deadlines.",
    parameters: {
        type: "object",
        properties: {
            project_id: { type: "string", description: "Filter by project UUID" },
            assignee_id: { type: "string", description: "Filter by assignee UUID" },
            status: {
                type: "string",
                enum: ["backlog", "todo", "in_progress", "review", "done"],
                description: "Filter by task status",
            },
            due_before: {
                type: "string",
                description: "ISO 8601 date — tasks due before this date",
            },
            due_after: { type: "string", description: "ISO 8601 date — tasks due after this date" },
            search: { type: "string", description: "Free-text search across task titles" },
            limit: { type: "number", default: 20 },
        },
    },
    requiredPermission: { resource: "tasks", action: "read" },
    isWrite: false,
    category: "query",
};

const queryBudgets: PlatformTool = {
    name: "query_budgets",
    description:
        "Look up budget data including line items, spent vs allocated, and variance. " +
        "Use when user asks about money, costs, spend, or budget status.",
    parameters: {
        type: "object",
        properties: {
            project_id: { type: "string", description: "Project UUID to get budget for" },
            include_line_items: {
                type: "boolean",
                description: "Include individual budget line items",
                default: false,
            },
        },
        required: ["project_id"],
    },
    requiredPermission: { resource: "budgets", action: "read" },
    isWrite: false,
    category: "query",
};

const queryCrew: PlatformTool = {
    name: "query_crew",
    description:
        "Search crew members by name, role, department, or availability. " +
        "Use when user asks about team members, staffing, or who is available.",
    parameters: {
        type: "object",
        properties: {
            search: { type: "string", description: "Search by name, role title, or department" },
            department: { type: "string", description: "Filter by department" },
            limit: { type: "number", default: 20 },
        },
    },
    requiredPermission: { resource: "crew", action: "read" },
    isWrite: false,
    category: "query",
};

const queryEvents: PlatformTool = {
    name: "query_events",
    description:
        "Search events and live productions. Returns event name, dates, location, status, and key contacts. " +
        "Use when user asks about upcoming events, shows, or productions.",
    parameters: {
        type: "object",
        properties: {
            search: { type: "string", description: "Free-text search" },
            status: { type: "string", description: "Filter by event status" },
            after_date: { type: "string", description: "ISO 8601 — events after this date" },
            before_date: { type: "string", description: "ISO 8601 — events before this date" },
            limit: { type: "number", default: 10 },
        },
    },
    requiredPermission: { resource: "events", action: "read" },
    isWrite: false,
    category: "query",
};

const queryInvoices: PlatformTool = {
    name: "query_invoices",
    description:
        "Look up invoices by status, client, or date range. Returns invoice number, amount, status, and due date. " +
        "Use when user asks about invoices, payments, or receivables.",
    parameters: {
        type: "object",
        properties: {
            status: {
                type: "string",
                enum: ["draft", "sent", "paid", "overdue", "void"],
                description: "Filter by invoice status",
            },
            client_id: { type: "string", description: "Filter by client/company UUID" },
            after_date: { type: "string", description: "ISO 8601 — invoices created after" },
            before_date: { type: "string", description: "ISO 8601 — invoices created before" },
            limit: { type: "number", default: 20 },
        },
    },
    requiredPermission: { resource: "invoices", action: "read" },
    isWrite: false,
    category: "query",
};

const queryVendors: PlatformTool = {
    name: "query_vendors",
    description:
        "Search vendors by name, service category, or compliance status. " +
        "Use when user asks about vendors, suppliers, or subcontractors.",
    parameters: {
        type: "object",
        properties: {
            search: { type: "string", description: "Free-text vendor name search" },
            category: { type: "string", description: "Service category filter" },
            limit: { type: "number", default: 20 },
        },
    },
    requiredPermission: { resource: "vendors", action: "read" },
    isWrite: false,
    category: "query",
};

const queryAssets: PlatformTool = {
    name: "query_assets",
    description:
        "Search assets by name, category, status, or location. " +
        "Use when user asks about equipment, inventory, or asset availability.",
    parameters: {
        type: "object",
        properties: {
            search: { type: "string", description: "Free-text asset search" },
            status: { type: "string", description: "Filter by asset status" },
            category: { type: "string", description: "Filter by asset category" },
            limit: { type: "number", default: 20 },
        },
    },
    requiredPermission: { resource: "assets", action: "read" },
    isWrite: false,
    category: "query",
};

// ─── Search Tools ────────────────────────────────────────────

const searchKnowledgeBase: PlatformTool = {
    name: "search_knowledge_base",
    description:
        "Semantic search across the organization's knowledge base (SOPs, handbooks, templates). " +
        "Use when user asks how-to questions, policy questions, or references docs.",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string", description: "Natural language search query" },
            source_types: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["upload", "sop", "handbook", "template", "proposal", "runsheet"],
                },
                description: "Filter by document source type",
            },
            limit: { type: "number", default: 5 },
        },
        required: ["query"],
    },
    requiredPermission: { resource: "kb", action: "read" },
    isWrite: false,
    category: "search",
};

// ─── Generate Tools ──────────────────────────────────────────

const generateDocument: PlatformTool = {
    name: "generate_document",
    description:
        "Generate a document draft (SOW, proposal, call sheet, brief, report). " +
        "Returns formatted markdown. Does NOT save — user must review and save manually.",
    parameters: {
        type: "object",
        properties: {
            document_type: {
                type: "string",
                enum: ["sow", "proposal", "call_sheet", "brief", "report", "email", "summary"],
                description: "Type of document to generate",
            },
            context: {
                type: "string",
                description:
                    "Contextual input for the generation (project details, requirements, etc.)",
            },
            tone: {
                type: "string",
                enum: ["formal", "professional", "casual"],
                default: "professional",
            },
        },
        required: ["document_type", "context"],
    },
    requiredPermission: { resource: "documents", action: "read" },
    isWrite: false,
    category: "generate",
};

const generateSummary: PlatformTool = {
    name: "generate_summary",
    description:
        "Generate a summary of specified data (project status, weekly report, budget overview). " +
        "Use when user asks for a status update, overview, or recap.",
    parameters: {
        type: "object",
        properties: {
            scope: {
                type: "string",
                enum: ["project", "weekly", "budget", "team", "event"],
                description: "What to summarize",
            },
            entity_id: {
                type: "string",
                description: "UUID of the project/event/team to summarize",
            },
            period: {
                type: "string",
                enum: ["today", "this_week", "this_month", "last_30_days"],
                default: "this_week",
            },
        },
        required: ["scope"],
    },
    requiredPermission: { resource: "dashboard", action: "read" },
    isWrite: false,
    category: "generate",
};

// ─── Calculate Tools ─────────────────────────────────────────

const calculateBudgetVariance: PlatformTool = {
    name: "calculate_budget_variance",
    description:
        "Calculate budget variance (planned vs actual) for a project or line item. " +
        "Returns variance amount, percentage, and burn rate.",
    parameters: {
        type: "object",
        properties: {
            project_id: { type: "string", description: "Project UUID" },
            line_item_id: {
                type: "string",
                description: "Optional specific budget line item UUID",
            },
        },
        required: ["project_id"],
    },
    requiredPermission: { resource: "budgets", action: "read" },
    isWrite: false,
    category: "calculate",
};

// ─── Navigation Tools ────────────────────────────────────────

const navigateTo: PlatformTool = {
    name: "navigate_to",
    description:
        "Generate a link to a specific page or entity in the platform. " +
        "Use when user wants to go to a specific project, task, or settings page.",
    parameters: {
        type: "object",
        properties: {
            entity_type: {
                type: "string",
                enum: [
                    "project",
                    "task",
                    "event",
                    "invoice",
                    "vendor",
                    "asset",
                    "crew_member",
                    "settings",
                ],
                description: "Type of entity to navigate to",
            },
            entity_id: {
                type: "string",
                description: "UUID of the specific entity (omit for list pages)",
            },
        },
        required: ["entity_type"],
    },
    requiredPermission: { resource: "dashboard", action: "read" },
    isWrite: false,
    category: "navigate",
};

// ─── Exports ─────────────────────────────────────────────────

export const PLATFORM_TOOLS: PlatformTool[] = [
    queryProjects,
    queryTasks,
    queryBudgets,
    queryCrew,
    queryEvents,
    queryInvoices,
    queryVendors,
    queryAssets,
    searchKnowledgeBase,
    generateDocument,
    generateSummary,
    calculateBudgetVariance,
    navigateTo,
];

/**
 * Get tools available to a given role based on RBAC permissions.
 * Filters the full tool set to only those the user has access to.
 */
export function getToolsForPermissions(
    userPermissions: Array<{ resource: string; actions: string[] }>
): PlatformTool[] {
    return PLATFORM_TOOLS.filter((tool) => {
        if (tool.isWrite) return false; // Phase 1: no write tools

        return userPermissions.some(
            (p) =>
                (p.resource === "*" || p.resource === tool.requiredPermission.resource) &&
                p.actions.includes(tool.requiredPermission.action)
        );
    });
}

/**
 * Convert PlatformTools to the generic ToolDefinition format for providers.
 */
export function toProviderTools(tools: PlatformTool[]): ToolDefinition[] {
    return tools.map(({ name, description, parameters }) => ({
        name,
        description,
        parameters,
    }));
}
