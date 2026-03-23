import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import type { Database } from "@/lib/supabase/database.types";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { settingsChangeRequestReviewSchema, validate } from "@/lib/validation/schemas";

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/settings/change-requests/[id]/review",
        mutation: true,
        rbac: { resource: "settings", action: "write" },
    },
    async (request, { supabase, user, log }, { params }) => {
        const { id: requestId } = await params;

        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(settingsChangeRequestReviewSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { action, comment } = result.data;

        // Fetch the change request
        const { data: changeRequest, error: fetchErr } = await serverFromTable(
            supabase,
            "settings_change_requests"
        )
            .select(
                "id, organization_id, setting_key, scope_type, scope_id, current_value, proposed_value, status, requested_by"
            )
            .eq("id", requestId)
            .single();

        if (fetchErr || !changeRequest) {
            return ApiErrors.notFound("Change request");
        }

        if (changeRequest.status !== "pending") {
            return ApiErrors.conflict("This request has already been reviewed");
        }

        // Verify reviewer is exec in the org
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
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
        const { data: updated, error: updateErr } = await serverFromTable(
            supabase,
            "settings_change_requests"
        )
            .update({
                status: action as Database["public"]["Enums"]["settings_approval_status"],
                reviewed_by: user.id,
                review_comment: comment || null,
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", requestId)
            .select(
                "id, organization_id, setting_key, scope_type, scope_id, current_value, proposed_value, reason, status, requested_by, reviewed_by, review_comment, reviewed_at, created_at"
            )
            .single();

        if (updateErr) {
            log.error("[POST /api/settings/change-requests/[id]/review] update failed", {
                error: updateErr,
            });
            return ApiErrors.internalError("Failed to update change request");
        }

        // Resolve the setting definition by key
        const { data: definition } = await serverFromTable(supabase, "setting_definitions")
            .select("id")
            .eq("key", changeRequest.setting_key)
            .single();

        if (!definition) {
            log.error("[POST /api/settings/change-requests/[id]/review] definition not found", {
                setting_key: changeRequest.setting_key,
            });
            // Still return success for the review itself — setting application is best-effort
            return NextResponse.json({ request: updated });
        }

        const definitionId = definition.id as string;
        let settingId: string | null = null;

        // If approved, apply the setting change
        if (action === "approved") {
            try {
                const { data: upserted, error: upsertErr } = await serverFromTable(
                    supabase,
                    "settings"
                )
                    .upsert(
                        {
                            definition_id: definitionId,
                            scope_type:
                                changeRequest.scope_type as Database["public"]["Enums"]["setting_scope"],
                            scope_id: changeRequest.scope_id,
                            value: changeRequest.proposed_value,
                            changed_by: user.id,
                        },
                        { onConflict: "definition_id,scope_type,scope_id" }
                    )
                    .select("id")
                    .single();

                if (upsertErr) {
                    log.error(
                        "[POST /api/settings/change-requests/[id]/review] setting upsert failed",
                        { error: upsertErr }
                    );
                } else {
                    settingId = (upserted?.id as string) ?? null;
                }
            } catch (err) {
                log.error(
                    "[POST /api/settings/change-requests/[id]/review] setting application failed",
                    { error: err }
                );
            }
        }

        // Audit log (only if we have a valid setting_id)
        if (settingId) {
            try {
                await serverFromTable(supabase, "settings_change_log").insert({
                    setting_id: settingId,
                    definition_id: definitionId,
                    scope_type:
                        changeRequest.scope_type as Database["public"]["Enums"]["setting_scope"],
                    scope_id: changeRequest.scope_id,
                    old_value: changeRequest.current_value,
                    new_value: action === "approved" ? changeRequest.proposed_value : null,
                    changed_by: user.id,
                    change_reason: `${action}: ${comment || "No comment"}`,
                });
            } catch (err) {
                log.error("[POST /api/settings/change-requests/[id]/review] audit log failed", {
                    error: err,
                });
            }
        }

        return NextResponse.json({ request: updated });
    }
);
