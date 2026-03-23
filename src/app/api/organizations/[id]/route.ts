import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { organizationUpdateSchema, validate } from "@/lib/validation/schemas";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/organizations/[id]",
        rbac: { resource: "organizations", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        const { data, error } = await serverFromTable(supabase, "organizations")
            .select(
                "id, name, slug, industry, default_timezone, default_currency, logo_url, created_at, updated_at"
            )
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Organization");
            log.error("[GET /api/organizations/:id] failed", { id, error: error.message });
            return ApiErrors.internalError("Failed to fetch organization");
        }

        return NextResponse.json({ data });
    }
);

export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/organizations/[id]",
        mutation: true,
        rbac: { resource: "organizations", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id } = await params;
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return ApiErrors.badRequest("Request body must be valid JSON");
        }

        const result = validate(organizationUpdateSchema, body);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const payload: Record<string, unknown> = {
            ...result.data,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await serverFromTable(supabase, "organizations")
            .update(payload)
            .eq("id", id)
            .select(
                "id, name, slug, industry, default_timezone, default_currency, logo_url, created_at, updated_at"
            )
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Organization");
            log.error("[PATCH /api/organizations/:id] failed", { id, error: error.message });
            return ApiErrors.internalError("Failed to update organization");
        }

        return NextResponse.json({ data });
    }
);
