/* ═══════════════════════════════════════════════════════════════
   FIELD USAGE API — Log usage events and retrieve usage summaries
   
   POST /api/fields/usage — Log a field access event (fire-and-forget)
   GET  /api/fields/usage — Retrieve daily usage summaries
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
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
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return ApiErrors.forbidden("No org membership found");
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return ApiErrors.badRequest("Invalid JSON body");
    }

    const parsed = usageEventSchema.safeParse(body);
    if (!parsed.success) {
        const details: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const path = issue.path.join(".") || "_root";
            if (!details[path]) details[path] = [];
            details[path]!.push(issue.message);
        }
        return ApiErrors.validationError(details);
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
        logger.error("Field usage insert error", { message: error.message });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return ApiErrors.forbidden("No org membership found");
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
        return ApiErrors.internalError(error.message);
    }

    return NextResponse.json({
        organization_id: orgId,
        period_days: days,
        records: usage ?? [],
    });
}
