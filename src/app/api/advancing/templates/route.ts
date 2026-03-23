import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { withApiHandler } from "@/lib/api/with-api-handler";

const createTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    advance_type: z.string().optional(),
    template_data: z.record(z.string(), z.unknown()),
    is_global: z.boolean().optional(),
});

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/advancing/templates",
        rbac: { resource: "advancing", action: "read" },
    },
    async (req, { supabase, log }) => {
        const orgId = req.nextUrl.searchParams.get("org_id");

        let query = serverFromTable(supabase, "advance_templates")
            .select(
                "id, name, description, advance_type, template_data, is_global, organization_id, created_by, created_at"
            )
            .is("deleted_at", null)
            .order("name");

        if (orgId) {
            query = query.or(`organization_id.eq.${orgId},is_global.eq.true`);
        }

        const { data, error } = await query;
        if (error) {
            log.error("[GET /api/advancing/templates]", { error });
            return ApiErrors.internalError("Failed to fetch templates");
        }

        return NextResponse.json({ data });
    }
);

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/advancing/templates",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (req, { supabase, user, log }) => {
        const parsed = await parseAndValidate(req, createTemplateSchema);
        if (!parsed.success) return parsed.response;

        const { data, error } = await serverFromTable(supabase, "advance_templates")
            .insert({
                ...parsed.data,
                created_by: user.id,
            } as Record<string, unknown>)
            .select("id, name, description, advance_type, is_global, created_at")
            .single();

        if (error) {
            log.error("[POST /api/advancing/templates]", { error });
            return ApiErrors.internalError("Failed to create template");
        }

        return NextResponse.json({ data }, { status: 201 });
    }
);
