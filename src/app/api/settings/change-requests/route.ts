import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import type { Database } from "@/lib/supabase/database.types";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const orgId = request.nextUrl.searchParams.get("organization_id");
    const status = request.nextUrl.searchParams.get("status") || "pending";

    if (!orgId) {
        return ApiErrors.validationError({ organization_id: ["organization_id is required"] });
    }

    // Verify the user is an active member of this org
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .single();

    if (!membership) {
        return ApiErrors.forbidden();
    }

    const query = supabase.from("settings_change_requests")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (status !== "all") {
        query.eq("status", status as Database["public"]["Enums"]["settings_approval_status"]);
    }

    const { data, error } = await query;

    if (error) {
        return ApiErrors.internalError("Failed to fetch change requests");
    }

    return NextResponse.json({ requests: data || [] });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { organization_id, setting_key, scope_type, scope_id, current_value, proposed_value, reason } = body;

    if (!organization_id || !setting_key || proposed_value === undefined) {
        return ApiErrors.validationError({
            _root: ["organization_id, setting_key, and proposed_value are required"],
        });
    }

    // Verify the user is an active member of this org
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", organization_id)
        .eq("status", "active")
        .single();

    if (!membership) {
        return ApiErrors.forbidden();
    }

    const { data, error } = await supabase.from("settings_change_requests")
        .insert({
            organization_id,
            setting_key,
            scope_type: scope_type || "organization",
            scope_id: scope_id || null,
            current_value: current_value !== undefined ? JSON.stringify(current_value) : null,
            proposed_value: JSON.stringify(proposed_value),
            reason: reason || null,
            requested_by: user.id,
        })
        .select("*")
        .single();

    if (error) {
        return ApiErrors.internalError("Failed to create change request");
    }

    return NextResponse.json({ request: data }, { status: 201 });
}
