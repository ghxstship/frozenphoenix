import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = request.nextUrl.searchParams.get("organization_id");
    const status = request.nextUrl.searchParams.get("status") || "pending";

    if (!orgId) {
        return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
    }

    const query = fromTable(supabase, "settings_change_requests")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (status !== "all") {
        query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: "Failed to fetch change requests" }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organization_id, setting_key, scope_type, scope_id, current_value, proposed_value, reason } = body;

    if (!organization_id || !setting_key || proposed_value === undefined) {
        return NextResponse.json(
            { error: "organization_id, setting_key, and proposed_value are required" },
            { status: 400 }
        );
    }

    const { data, error } = await fromTable(supabase, "settings_change_requests")
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
        return NextResponse.json({ error: "Failed to create change request" }, { status: 500 });
    }

    return NextResponse.json({ request: data }, { status: 201 });
}
