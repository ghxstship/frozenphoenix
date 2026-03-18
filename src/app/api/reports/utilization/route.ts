import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/reports/utilization?start_date=&end_date=
 *
 * Gap #13: Utilization rate dashboard
 * Computes billable hours / available hours per crew member for a date range.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/reports/utilization",
        rbac: { resource: "reports", action: "read" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const now = new Date();
        const startDate =
            url.searchParams.get("start_date") ??
            new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endDate = url.searchParams.get("end_date") ?? now.toISOString().split("T")[0];

        // Fetch crew members
        const { data: crew } = await serverFromTable(supabase, "crew_members")
            .select("id, display_name, user_id, department")
            .eq("organization_id", orgId)
            .eq("status", "active");

        if (!crew || (crew as unknown[]).length === 0) {
            return NextResponse.json({ data: [] });
        }

        const crewIds = (crew as Array<Record<string, unknown>>).map((c) => c.id as string);

        // Fetch time entries for the period
        const { data: timeEntries } = await serverFromTable(supabase, "time_entries")
            .select("crew_member_id, hours_worked, is_billable")
            .in("crew_member_id", crewIds)
            .gte("date", startDate!)
            .lte("date", endDate!);

        const entries = (timeEntries ?? []) as Array<Record<string, unknown>>;

        // Calculate working days in range (Mon-Fri)
        const start = new Date(startDate!);
        const end = new Date(endDate!);
        let workingDays = 0;
        const d = new Date(start);
        while (d <= end) {
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) workingDays++;
            d.setDate(d.getDate() + 1);
        }
        const availableHoursPerPerson = workingDays * 8;

        // Aggregate per crew member
        const report = (crew as Array<Record<string, unknown>>).map((member) => {
            const memberId = member.id as string;
            const memberEntries = entries.filter((e) => e.crew_member_id === memberId);
            const totalHours = memberEntries.reduce(
                (sum, e) => sum + ((e.hours_worked as number) ?? 0),
                0
            );
            const billableHours = memberEntries
                .filter((e) => e.is_billable !== false)
                .reduce((sum, e) => sum + ((e.hours_worked as number) ?? 0), 0);
            const utilization =
                availableHoursPerPerson > 0
                    ? Math.round((billableHours / availableHoursPerPerson) * 1000) / 10
                    : 0;

            return {
                crew_member_id: memberId,
                display_name: member.display_name,
                department: member.department,
                total_hours: Math.round(totalHours * 10) / 10,
                billable_hours: Math.round(billableHours * 10) / 10,
                available_hours: availableHoursPerPerson,
                utilization_percent: utilization,
            };
        });

        report.sort((a, b) => b.utilization_percent - a.utilization_percent);

        return NextResponse.json({
            data: report,
            meta: { start_date: startDate, end_date: endDate, working_days: workingDays },
        });
    }
);
