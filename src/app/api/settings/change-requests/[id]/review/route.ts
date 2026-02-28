import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: requestId } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, comment } = body;

    if (!action || !["approved", "rejected"].includes(action)) {
        return NextResponse.json({ error: "action must be 'approved' or 'rejected'" }, { status: 400 });
    }

    // Fetch the change request
    const { data: changeRequest, error: fetchErr } = await fromTable(supabase, "settings_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchErr || !changeRequest) {
        return NextResponse.json({ error: "Change request not found" }, { status: 404 });
    }

    if (changeRequest.status !== "pending") {
        return NextResponse.json({ error: "This request has already been reviewed" }, { status: 409 });
    }

    // Verify reviewer is exec in the org
    const { data: membership } = await fromTable(supabase, "org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", changeRequest.organization_id)
        .eq("status", "active")
        .single();

    if (!membership || membership.role !== "exec") {
        return NextResponse.json({ error: "Only executives can review change requests" }, { status: 403 });
    }

    // Prevent self-approval
    if (changeRequest.requested_by === user.id) {
        return NextResponse.json({ error: "You cannot approve your own change request" }, { status: 403 });
    }

    // Update the change request
    const { data: updated, error: updateErr } = await fromTable(supabase, "settings_change_requests")
        .update({
            status: action,
            reviewed_by: user.id,
            review_comment: comment || null,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select("*")
        .single();

    if (updateErr) {
        return NextResponse.json({ error: "Failed to update change request" }, { status: 500 });
    }

    // If approved, apply the setting change
    if (action === "approved") {
        try {
            await fromTable(supabase, "settings")
                .upsert(
                    {
                        organization_id: changeRequest.organization_id,
                        scope_type: changeRequest.scope_type,
                        scope_id: changeRequest.scope_id,
                        key: changeRequest.setting_key,
                        value: changeRequest.proposed_value,
                        updated_by: user.id,
                    },
                    { onConflict: "organization_id,scope_type,scope_id,key" }
                );
        } catch {
            // Setting application failed — still record the approval
        }
    }

    // Audit log
    try {
        await fromTable(supabase, "settings_change_log").insert({
            organization_id: changeRequest.organization_id,
            setting_key: changeRequest.setting_key,
            scope_type: changeRequest.scope_type,
            scope_id: changeRequest.scope_id,
            old_value: changeRequest.current_value,
            new_value: action === "approved" ? changeRequest.proposed_value : null,
            changed_by: user.id,
            change_reason: `${action}: ${comment || "No comment"}`,
        });
    } catch {
        // Non-blocking
    }

    return NextResponse.json({ request: updated });
}
