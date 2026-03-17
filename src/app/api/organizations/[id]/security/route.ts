import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import type { Json } from "@/lib/supabase/database.types";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { orgSecurityUpdateSchema, validate } from "@/lib/validation/schemas";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/organizations/[id]/security",
        rbac: { resource: "organizations", action: "read" },
    },
    async (_request, { supabase, user }, { params }) => {
        const { id: orgId } = await params;

        // Verify the user is exec in this org
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", orgId)
            .eq("status", "active")
            .single();

        if (!membership || membership.role !== "exec") {
            return ApiErrors.forbidden("Only executives can view security settings");
        }

        const { data: org, error } = await serverFromTable(supabase, "organizations")
            .select(
                "id, name, slug, require_mfa, enforce_sso, sso_domain, allowed_email_domains, session_timeout_hours, max_sessions_per_user, invitation_expiry_days, default_role"
            )
            .eq("id", orgId)
            .single();

        if (error || !org) {
            return ApiErrors.notFound("Organization");
        }

        return NextResponse.json({ organization: org });
    }
);

export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/organizations/[id]/security",
        mutation: true,
        rbac: { resource: "organizations", action: "write" },
    },
    async (request, { supabase, user }, { params }) => {
        const { id: orgId } = await params;

        // Verify the user is exec in this org
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", orgId)
            .eq("status", "active")
            .single();

        if (!membership || membership.role !== "exec") {
            return ApiErrors.forbidden("Only executives can modify security settings");
        }

        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(orgSecurityUpdateSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        // Strip undefined values to get only provided fields
        const allowedFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(result.data)) {
            if (value !== undefined) allowedFields[key] = value;
        }

        if (Object.keys(allowedFields).length === 0) {
            return ApiErrors.badRequest("No valid fields to update");
        }

        const { data: org, error } = await serverFromTable(supabase, "organizations")
            .update(allowedFields)
            .eq("id", orgId)
            .select(
                "id, name, slug, require_mfa, enforce_sso, sso_domain, allowed_email_domains, session_timeout_hours, max_sessions_per_user, invitation_expiry_days, default_role"
            )
            .single();

        if (error) {
            return ApiErrors.internalError("Failed to update security settings");
        }

        // Audit log the change
        try {
            await serverFromTable(supabase, "login_audit_log").insert({
                user_id: user.id,
                event_type: "org_security_updated",
                metadata: {
                    organization_id: orgId,
                    changes: Object.keys(allowedFields),
                } as unknown as Json,
            });
        } catch {
            // Non-blocking — audit table may not exist
        }

        return NextResponse.json({ organization: org });
    }
);
