/* ═══════════════════════════════════════════════════════════════
   AI Admin — Usage Dashboard Endpoint
   GET /api/ai/usage?period=7d|30d|90d
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/ai/usage",
        rbac: { resource: "ai", action: "read" },
    },
    async (req, { supabase, user, log: reqLog }) => {
        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        const { data: membership } = await supabase
            .from("org_memberships")
            .select("organization_id, role")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership || !["exec", "director"].includes(membership.role)) {
            return ApiErrors.forbidden("Requires exec or director role");
        }

        const period = req.nextUrl.searchParams.get("period") ?? "30d";
        const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data: logs, error } = await admin
            .from("ai_usage_logs")
            .select("created_at, token_count_input, token_count_output, estimated_cost")
            .eq("org_id", membership.organization_id)
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: true });

        if (error) {
            reqLog.error("[GET /api/ai/usage]", { error });
            return ApiErrors.internalError("Failed to fetch AI usage data");
        }

        // Aggregate by day
        const byDay = new Map<
            string,
            {
                total_input_tokens: number;
                total_output_tokens: number;
                total_cost: number;
                request_count: number;
            }
        >();

        for (const entry of logs ?? []) {
            const date = entry.created_at.slice(0, 10);
            const existing = byDay.get(date) ?? {
                total_input_tokens: 0,
                total_output_tokens: 0,
                total_cost: 0,
                request_count: 0,
            };
            existing.total_input_tokens += entry.token_count_input ?? 0;
            existing.total_output_tokens += entry.token_count_output ?? 0;
            existing.total_cost += entry.estimated_cost ?? 0;
            existing.request_count += 1;
            byDay.set(date, existing);
        }

        const usage = Array.from(byDay.entries()).map(([date, data]) => ({ date, ...data }));

        return NextResponse.json({ usage });
    }
);
