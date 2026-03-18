import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/reports/profitability?project_id=<optional>
 *
 * Gap #20: Profitability report (project-level P&L)
 * Computes revenue vs costs per project: budget, time entry costs, expenses, vendor costs.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/reports/profitability",
        rbac: { resource: "finance", action: "read" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const projectId = url.searchParams.get("project_id");

        // Fetch projects
        let projectQuery = serverFromTable(supabase, "projects")
            .select("id, name, budget_planned, budget_actual, contracted_value, status")
            .eq("organization_id", orgId);
        if (projectId) projectQuery = projectQuery.eq("id", projectId);

        const { data: projects } = await projectQuery;

        if (!projects || (projects as unknown[]).length === 0) {
            return NextResponse.json({ data: [] });
        }

        const projectIds = (projects as Array<Record<string, unknown>>).map((p) => p.id as string);

        // Fetch time entry costs in parallel
        const [timeResult, expenseResult, invoiceResult] = await Promise.all([
            serverFromTable(supabase, "time_entries")
                .select("project_id, hours_worked, hourly_rate, total_cost")
                .in("project_id", projectIds)
                .eq("organization_id", orgId),
            serverFromTable(supabase, "expenses")
                .select("project_id, amount")
                .in("project_id", projectIds)
                .eq("organization_id", orgId),
            serverFromTable(supabase, "client_invoices")
                .select("project_id, total, amount_paid, status")
                .in("project_id", projectIds)
                .eq("organization_id", orgId),
        ]);

        const timeEntries = (timeResult.data ?? []) as Array<Record<string, unknown>>;
        const expenses = (expenseResult.data ?? []) as Array<Record<string, unknown>>;
        const invoices = (invoiceResult.data ?? []) as Array<Record<string, unknown>>;

        // Aggregate per project
        const report = (projects as Array<Record<string, unknown>>).map((project) => {
            const pid = project.id as string;

            const laborCost = timeEntries
                .filter((t) => t.project_id === pid)
                .reduce(
                    (sum, t) =>
                        sum +
                        ((t.total_cost as number) ??
                            ((t.hours_worked as number) ?? 0) * ((t.hourly_rate as number) ?? 0)),
                    0
                );

            const expenseCost = expenses
                .filter((e) => e.project_id === pid)
                .reduce((sum, e) => sum + ((e.amount as number) ?? 0), 0);

            const totalCost = laborCost + expenseCost;

            const revenue = invoices
                .filter((i) => i.project_id === pid)
                .reduce((sum, i) => sum + ((i.total as number) ?? 0), 0);

            const collected = invoices
                .filter((i) => i.project_id === pid)
                .reduce((sum, i) => sum + ((i.amount_paid as number) ?? 0), 0);

            const margin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;

            return {
                project_id: pid,
                project_name: project.name,
                status: project.status,
                budget_planned: project.budget_planned ?? 0,
                budget_actual: project.budget_actual ?? 0,
                contracted_value: project.contracted_value ?? 0,
                labor_cost: Math.round(laborCost * 100) / 100,
                expense_cost: Math.round(expenseCost * 100) / 100,
                total_cost: Math.round(totalCost * 100) / 100,
                revenue: Math.round(revenue * 100) / 100,
                collected: Math.round(collected * 100) / 100,
                gross_margin_percent: Math.round(margin * 10) / 10,
                profit: Math.round((revenue - totalCost) * 100) / 100,
            };
        });

        return NextResponse.json({ data: report });
    }
);
