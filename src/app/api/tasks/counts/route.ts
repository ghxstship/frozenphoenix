import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/tasks/counts
 * Returns aggregated task counts for the authenticated user.
 * Performs filtering server-side to avoid fetching hundreds of tasks to the client.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/tasks/counts",
        rbac: { resource: "tasks", action: "read" },
    },
    async (_request, { supabase, user }) => {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        const endOfWeekStr = endOfWeek.toISOString().slice(0, 10);

        // Fetch only non-completed tasks assigned to the user — much smaller payload
        // than fetching 500 full task records.
        const { data: tasks, error } = await supabase!
            .from("tasks")
            .select("status, due_date")
            .eq("assignee_id", user.id)
            .is("deleted_at", null)
            .not("status", "in", '("done","completed","cancelled")');

        if (error) {
            return NextResponse.json(
                { total: 0, overdue: 0, dueToday: 0, dueThisWeek: 0, inProgress: 0 },
                { status: 200 }
            );
        }

        const rows = tasks ?? [];

        return NextResponse.json({
            total: rows.length,
            overdue: rows.filter((t) => t.due_date && t.due_date < todayStr).length,
            dueToday: rows.filter((t) => t.due_date === todayStr).length,
            dueThisWeek: rows.filter(
                (t) => t.due_date && t.due_date >= todayStr && t.due_date <= endOfWeekStr
            ).length,
            inProgress: rows.filter((t) => t.status === "in_progress").length,
        });
    }
);
