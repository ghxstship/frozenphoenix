/* ═══════════════════════════════════════════════════════════════
   FIELD USAGE API — Log usage events and retrieve usage summaries
   
   POST /api/fields/usage — Log a field access event (fire-and-forget)
   GET  /api/fields/usage — Retrieve daily usage summaries
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const usageEventSchema = z.object({
    field_type_id: z.string().min(1),
    action: z.enum(["read", "write", "export"]),
    resource: z.string().min(1),
    count: z.number().int().positive().optional().default(1),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return NextResponse.json({ error: "No org membership found" }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = usageEventSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { field_type_id, action, resource, count } = parsed.data;

    // Fire-and-forget insert — non-blocking
    const { error } = await supabase
        .from("field_usage_events")
        .insert({
            organization_id: membership.organization_id,
            user_id: user.id,
            field_type_id,
            action,
            resource,
            count,
        });

    if (error) {
        // Log but don't fail the request — usage metering is non-critical
        console.error("[field-usage] Insert error:", error.message);
    }

    return NextResponse.json({ ok: true }, { status: 202 });
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return NextResponse.json({ error: "No org membership found" }, { status: 403 });
    }

    const orgId = membership.organization_id;
    const days = parseInt(request.nextUrl.searchParams.get("days") ?? "30", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: usage, error } = await supabase
        .from("field_usage_daily")
        .select("field_type_id, action, total_count, unique_users, event_date, pricing_tier")
        .eq("organization_id", orgId)
        .gte("event_date", since.toISOString().split("T")[0])
        .order("event_date", { ascending: false })
        .limit(500);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        organization_id: orgId,
        period_days: days,
        records: usage ?? [],
    });
}
