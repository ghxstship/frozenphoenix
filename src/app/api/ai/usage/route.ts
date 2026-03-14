/* ═══════════════════════════════════════════════════════════════
   AI Admin — Usage Dashboard Endpoint
   GET /api/ai/usage?period=7d|30d|90d
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership || !["exec", "director"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        return NextResponse.json({ error: error.message }, { status: 500 });
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

    for (const log of logs ?? []) {
        const date = log.created_at.slice(0, 10);
        const existing = byDay.get(date) ?? {
            total_input_tokens: 0,
            total_output_tokens: 0,
            total_cost: 0,
            request_count: 0,
        };
        existing.total_input_tokens += log.token_count_input ?? 0;
        existing.total_output_tokens += log.token_count_output ?? 0;
        existing.total_cost += log.estimated_cost ?? 0;
        existing.request_count += 1;
        byDay.set(date, existing);
    }

    const usage = Array.from(byDay.entries()).map(([date, data]) => ({ date, ...data }));

    return NextResponse.json({ usage });
}
