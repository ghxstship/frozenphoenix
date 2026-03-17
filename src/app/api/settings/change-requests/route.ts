import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import type { Database } from "@/lib/supabase/database.types";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { settingsChangeRequestCreateSchema, validate } from "@/lib/validation/schemas";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/settings/change-requests",
        rbac: { resource: "settings", action: "read" },
    },
    async (request, { supabase, user }) => {
        const orgId = request.nextUrl.searchParams.get("organization_id");
        const status = request.nextUrl.searchParams.get("status") || "pending";

        if (!orgId) {
            return ApiErrors.validationError({ organization_id: ["organization_id is required"] });
        }

        // Verify the user is an active member of this org
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", orgId)
            .eq("status", "active")
            .single();

        if (!membership) {
            return ApiErrors.forbidden();
        }

        const query = serverFromTable(supabase, "settings_change_requests")
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
);

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/settings/change-requests",
        mutation: true,
        rbac: { resource: "settings", action: "write" },
    },
    async (request, { supabase, user }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(settingsChangeRequestCreateSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const {
            organization_id,
            setting_key,
            scope_type,
            scope_id,
            current_value,
            proposed_value,
            reason,
        } = result.data;

        // Verify the user is an active member of this org
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", organization_id)
            .eq("status", "active")
            .single();

        if (!membership) {
            return ApiErrors.forbidden();
        }

        const { data, error } = await serverFromTable(supabase, "settings_change_requests")
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
);
