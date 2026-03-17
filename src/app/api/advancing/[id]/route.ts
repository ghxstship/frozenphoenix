import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { updateAdvanceSchema } from "@/lib/validation/advancing-schemas";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/advancing/[id]",
        rbac: { resource: "advancing", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        const { data, error } = await serverFromTable(supabase, "production_advances")
            .select(
                `
                *,
                events:event_id(name),
                projects:project_id(name),
                submitted_by_profile:submitted_by(name, avatar_url),
                point_of_contact_profile:point_of_contact(name, avatar_url),
                approved_by_profile:approved_by(name)
            `
            )
            .eq("id", id)
            .is("deleted_at", null)
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Advance");
            log.error("[GET /api/advancing/[id]]", { error });
            return ApiErrors.internalError("Failed to fetch advance");
        }

        return NextResponse.json({ data });
    }
);

export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/advancing/[id]",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id } = await params;
        const parsed = await parseAndValidate(request, updateAdvanceSchema);
        if (!parsed.success) return parsed.response;

        const { data, error } = await serverFromTable(supabase, "production_advances")
            .update(parsed.data as Record<string, unknown>)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Advance");
            log.error("[PATCH /api/advancing/[id]]", { error });
            return ApiErrors.internalError("Failed to update advance");
        }

        return NextResponse.json({ data });
    }
);

export const DELETE = withApiHandlerParams(
    {
        method: "DELETE",
        route: "/api/advancing/[id]",
        mutation: true,
        rbac: { resource: "advancing", action: "delete" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        const { error } = await serverFromTable(supabase, "production_advances")
            .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
            .eq("id", id);

        if (error) {
            log.error("[DELETE /api/advancing/[id]]", { error });
            return ApiErrors.internalError("Failed to delete advance");
        }

        return NextResponse.json({ success: true });
    }
);
