import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import type { Database } from "@/lib/supabase/database.types";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: requestId } = await params;
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { action, comment } = body;

    if (!action || !["approved", "rejected"].includes(action)) {
        return ApiErrors.validationError({ action: ["action must be 'approved' or 'rejected'"] });
    }

    // Fetch the change request
    const { data: changeRequest, error: fetchErr } = await supabase.from("settings_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchErr || !changeRequest) {
        return ApiErrors.notFound("Change request");
    }

    if (changeRequest.status !== "pending") {
        return ApiErrors.conflict("This request has already been reviewed");
    }

    // Verify reviewer is exec in the org
    const { data: membership } = await supabase.from("org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", changeRequest.organization_id)
        .eq("status", "active")
        .single();

    if (!membership || membership.role !== "exec") {
        return ApiErrors.forbidden("Only executives can review change requests");
    }

    // Prevent self-approval
    if (changeRequest.requested_by === user.id) {
        return ApiErrors.forbidden("You cannot approve your own change request");
    }

    // Update the change request
    const { data: updated, error: updateErr } = await supabase.from("settings_change_requests")
        .update({
            status: action as Database["public"]["Enums"]["settings_approval_status"],
            reviewed_by: user.id,
            review_comment: comment || null,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select("*")
        .single();

    if (updateErr) {
        return ApiErrors.internalError("Failed to update change request");
    }

    // If approved, apply the setting change
    if (action === "approved") {
        try {
            // TODO: Refactor to resolve definition_id from setting_key
            // The settings table schema uses definition_id, not organization_id+key
            await supabase.from("settings")
                .upsert(
                    {
                        definition_id: changeRequest.setting_key, // placeholder — needs resolver
                        scope_type: changeRequest.scope_type as Database["public"]["Enums"]["setting_scope"],
                        scope_id: changeRequest.scope_id,
                        value: changeRequest.proposed_value,
                        changed_by: user.id,
                    },
                    { onConflict: "definition_id,scope_type,scope_id" }
                );
        } catch {
            // Setting application failed — still record the approval
        }
    }

    // Audit log
    try {
        // TODO: Refactor to include real setting_id + definition_id
        await supabase.from("settings_change_log").insert({
            setting_id: requestId, // placeholder — needs real setting ID
            definition_id: changeRequest.setting_key, // placeholder — needs resolver
            scope_type: changeRequest.scope_type as Database["public"]["Enums"]["setting_scope"],
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
