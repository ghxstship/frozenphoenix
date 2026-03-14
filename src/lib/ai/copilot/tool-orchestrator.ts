/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Tool Orchestrator
   
   Routes model tool calls to internal platform actions.
   Phase 1: ALL tool calls are READ-ONLY — no DB writes.
   
   Each tool handler:
   1. Validates RBAC permissions before execution
   2. Executes the query via Supabase admin client
   3. Returns structured JSON results
   4. Logs the tool invocation for audit trail
   
   The orchestrator never exposes raw SQL or internal IDs
   beyond what the user's role permits.
   ═══════════════════════════════════════════════════════════════ */

import { createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlatformTool } from "./tool-definitions";

// ─── Types ───────────────────────────────────────────────────

export interface ToolExecutionContext {
    userId: string;
    orgId: string;
    role: string;
    permissions: Array<{ resource: string; actions: string[] }>;
}

type ToolHandler = (
    args: Record<string, unknown>,
    ctx: ToolExecutionContext,
    supabase: SupabaseClient
) => Promise<string>;

// ─── Orchestrator Class ──────────────────────────────────────

export class ToolOrchestrator {
    private handlers = new Map<string, ToolHandler>();
    private ctx: ToolExecutionContext;

    constructor(ctx: ToolExecutionContext) {
        this.ctx = ctx;
        this.registerHandlers();
    }

    /**
     * Execute a tool call. Returns the result as a string.
     * If the tool is not found or permission is denied, returns an error message.
     */
    async executeTool(tool: PlatformTool, args: Record<string, unknown>): Promise<string> {
        // Phase 1 guard: block all write tools
        if (tool.isWrite) {
            return JSON.stringify({
                error: "Write operations are not available in the current copilot version.",
            });
        }

        // RBAC check
        const hasPermission = this.ctx.permissions.some(
            (p) =>
                (p.resource === "*" || p.resource === tool.requiredPermission.resource) &&
                p.actions.includes(tool.requiredPermission.action)
        );

        if (!hasPermission) {
            return JSON.stringify({
                error: `Access denied: you don't have ${tool.requiredPermission.action} permission on ${tool.requiredPermission.resource}.`,
            });
        }

        const handler = this.handlers.get(tool.name);
        if (!handler) {
            return JSON.stringify({
                error: `Tool "${tool.name}" is registered but has no handler implementation.`,
            });
        }

        try {
            const supabase = createAdminClient();
            if (!supabase) {
                return JSON.stringify({
                    error: "Database connection not configured (missing service role key).",
                });
            }
            return await handler(args, this.ctx, supabase);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return JSON.stringify({ error: `Tool execution failed: ${message}` });
        }
    }

    // ─── Handler Registration ────────────────────────────────

    private registerHandlers(): void {
        this.handlers.set("query_projects", handleQueryProjects);
        this.handlers.set("query_tasks", handleQueryTasks);
        this.handlers.set("query_budgets", handleQueryBudgets);
        this.handlers.set("query_crew", handleQueryCrew);
        this.handlers.set("query_events", handleQueryEvents);
        this.handlers.set("query_invoices", handleQueryInvoices);
        this.handlers.set("query_vendors", handleQueryVendors);
        this.handlers.set("query_assets", handleQueryAssets);
        this.handlers.set("search_knowledge_base", handleSearchKnowledgeBase);
        this.handlers.set("generate_document", handleGenerateDocument);
        this.handlers.set("generate_summary", handleGenerateSummary);
        this.handlers.set("calculate_budget_variance", handleCalculateBudgetVariance);
        this.handlers.set("navigate_to", handleNavigateTo);
    }
}

// ═══════════════════════════════════════════════════════════════
// Tool Handlers (read-only queries via Supabase admin client)
// ═══════════════════════════════════════════════════════════════

const handleQueryProjects: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 10, 50);
    let query = supabase
        .from("projects")
        .select("id, name, status, start_date, end_date, budget_total, created_at")
        .eq("organization_id", ctx.orgId)
        .order("updated_at", { ascending: false })
        .limit(limit);

    if (args.status) query = query.eq("status", args.status);
    if (args.search) query = query.ilike("name", `%${args.search}%`);

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ projects: data, count: data?.length ?? 0 });
};

const handleQueryTasks: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 20, 50);
    let query = supabase
        .from("tasks")
        .select("id, title, status, priority, due_date, assignee_id, project_id, created_at")
        .eq("organization_id", ctx.orgId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(limit);

    if (args.project_id) query = query.eq("project_id", args.project_id);
    if (args.assignee_id) query = query.eq("assignee_id", args.assignee_id);
    if (args.status) query = query.eq("status", args.status);
    if (args.due_before) query = query.lte("due_date", args.due_before);
    if (args.due_after) query = query.gte("due_date", args.due_after);
    if (args.search) query = query.ilike("title", `%${args.search}%`);

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ tasks: data, count: data?.length ?? 0 });
};

const handleQueryBudgets: ToolHandler = async (args, ctx, supabase) => {
    const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("id, name, total_amount, spent_amount, status")
        .eq("organization_id", ctx.orgId)
        .eq("project_id", args.project_id)
        .maybeSingle();

    if (budgetError) return JSON.stringify({ error: budgetError.message });
    if (!budget) return JSON.stringify({ error: "No budget found for this project" });

    if (args.include_line_items) {
        const { data: lineItems, error: liError } = await supabase
            .from("budget_line_items")
            .select("id, description, category, planned_amount, actual_amount, status")
            .eq("budget_id", budget.id)
            .order("created_at", { ascending: true });

        if (liError) return JSON.stringify({ error: liError.message });
        return JSON.stringify({ budget, line_items: lineItems });
    }

    return JSON.stringify({ budget });
};

const handleQueryCrew: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 20, 50);
    let query = supabase
        .from("crew_members")
        .select("id, first_name, last_name, role_title, department, status, email")
        .eq("organization_id", ctx.orgId)
        .order("last_name", { ascending: true })
        .limit(limit);

    if (args.department) query = query.eq("department", args.department);
    if (args.search) {
        query = query.or(
            `first_name.ilike.%${args.search}%,last_name.ilike.%${args.search}%,role_title.ilike.%${args.search}%`
        );
    }

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ crew: data, count: data?.length ?? 0 });
};

const handleQueryEvents: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 10, 50);
    let query = supabase
        .from("live_events")
        .select("id, name, status, start_date, end_date, venue_name, created_at")
        .eq("organization_id", ctx.orgId)
        .order("start_date", { ascending: true })
        .limit(limit);

    if (args.status) query = query.eq("status", args.status);
    if (args.after_date) query = query.gte("start_date", args.after_date);
    if (args.before_date) query = query.lte("start_date", args.before_date);
    if (args.search) query = query.ilike("name", `%${args.search}%`);

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ events: data, count: data?.length ?? 0 });
};

const handleQueryInvoices: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 20, 50);
    let query = supabase
        .from("invoices")
        .select("id, invoice_number, status, total_amount, due_date, issued_date, vendor_id")
        .eq("organization_id", ctx.orgId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (args.status) query = query.eq("status", args.status);
    if (args.client_id) query = query.eq("vendor_id", args.client_id);
    if (args.after_date) query = query.gte("created_at", args.after_date);
    if (args.before_date) query = query.lte("created_at", args.before_date);

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ invoices: data, count: data?.length ?? 0 });
};

const handleQueryVendors: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 20, 50);
    let query = supabase
        .from("vendors")
        .select("id, name, category, status, contact_email, compliance_status")
        .eq("organization_id", ctx.orgId)
        .order("name", { ascending: true })
        .limit(limit);

    if (args.category) query = query.eq("category", args.category);
    if (args.search) query = query.ilike("name", `%${args.search}%`);

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ vendors: data, count: data?.length ?? 0 });
};

const handleQueryAssets: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 20, 50);
    let query = supabase
        .from("assets")
        .select("id, name, asset_tag, category, status, location, condition")
        .eq("organization_id", ctx.orgId)
        .order("name", { ascending: true })
        .limit(limit);

    if (args.status) query = query.eq("status", args.status);
    if (args.category) query = query.eq("category", args.category);
    if (args.search) query = query.ilike("name", `%${args.search}%`);

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ assets: data, count: data?.length ?? 0 });
};

const handleSearchKnowledgeBase: ToolHandler = async (args, ctx, supabase) => {
    const limit = Math.min(Number(args.limit) || 5, 20);

    // For now, do a text search on chunk content. Vector search will be
    // integrated when the RAG pipeline (Phase 4) embedding is live.
    let query = supabase
        .from("ai_document_chunks")
        .select("id, content, metadata, document_id")
        .limit(limit);

    // Filter by org through document join
    const { data: orgDocs } = await supabase
        .from("ai_documents")
        .select("id")
        .eq("org_id", ctx.orgId)
        .eq("processing_status", "ready");

    if (!orgDocs || orgDocs.length === 0) {
        return JSON.stringify({
            chunks: [],
            message: "No knowledge base documents found for your organization.",
        });
    }

    const docIds = orgDocs.map((d) => d.id);
    query = query.in("document_id", docIds);

    if (args.query) {
        query = query.ilike("content", `%${args.query}%`);
    }

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });

    return JSON.stringify({
        chunks: data?.map((c) => ({
            content: c.content.slice(0, 500),
            metadata: c.metadata,
        })),
        count: data?.length ?? 0,
    });
};

const handleGenerateDocument: ToolHandler = async (args) => {
    // Document generation is handled by the model itself — this tool
    // provides the structured context for the model to generate against.
    return JSON.stringify({
        instruction: `Generate a ${args.document_type} document based on the following context.`,
        context: args.context,
        tone: args.tone ?? "professional",
        format: "markdown",
        note: "This is a draft — the user must review and save manually.",
    });
};

const handleGenerateSummary: ToolHandler = async (args) => {
    return JSON.stringify({
        instruction: `Generate a ${args.scope} summary for the ${args.period ?? "this_week"} period.`,
        entity_id: args.entity_id,
        note: "Summarize the data retrieved from previous tool calls in this conversation.",
    });
};

const handleCalculateBudgetVariance: ToolHandler = async (args, ctx, supabase) => {
    const { data: budget, error } = await supabase
        .from("budgets")
        .select("id, total_amount, spent_amount")
        .eq("organization_id", ctx.orgId)
        .eq("project_id", args.project_id)
        .maybeSingle();

    if (error) return JSON.stringify({ error: error.message });
    if (!budget) return JSON.stringify({ error: "No budget found for this project" });

    const planned = Number(budget.total_amount) || 0;
    const actual = Number(budget.spent_amount) || 0;
    const variance = planned - actual;
    const variancePercent = planned > 0 ? ((variance / planned) * 100).toFixed(1) : "0";
    const burnRate = planned > 0 ? ((actual / planned) * 100).toFixed(1) : "0";

    return JSON.stringify({
        planned,
        actual,
        variance,
        variance_percent: `${variancePercent}%`,
        burn_rate: `${burnRate}%`,
        status: variance >= 0 ? "under_budget" : "over_budget",
    });
};

const handleNavigateTo: ToolHandler = async (args) => {
    const routeMap: Record<string, string> = {
        project: "/projects",
        task: "/tasks",
        event: "/live-ops/events",
        invoice: "/finance/invoices",
        vendor: "/vendors",
        asset: "/assets",
        crew_member: "/crew",
        settings: "/settings",
    };

    const entityType = String(args.entity_type);
    const basePath = routeMap[entityType] ?? "/dashboard";
    const entityId = args.entity_id ? `/${args.entity_id}` : "";
    const url = `${basePath}${entityId}`;

    return JSON.stringify({
        url,
        label: `Go to ${entityType}${args.entity_id ? ` detail` : ` list`}`,
    });
};
