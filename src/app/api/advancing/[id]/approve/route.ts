import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/advancing/[id]/approve",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (_request, { supabase, user, log }, { params }) => {
        const { id } = await params;

        const { data: advance, error: fetchError } = await serverFromTable(
            supabase,
            "production_advances"
        )
            .select("id, status")
            .eq("id", id)
            .is("deleted_at", null)
            .single();

        if (fetchError || !advance) return ApiErrors.notFound("Advance");

        const currentStatus = (advance as Record<string, unknown>).status as string;
        if (currentStatus !== "in_review" && currentStatus !== "submitted") {
            return ApiErrors.badRequest(`Cannot approve an advance in '${currentStatus}' status`);
        }

        const { data, error } = await serverFromTable(supabase, "production_advances")
            .update({
                status: "approved",
                approved_by: user.id,
            } as Record<string, unknown>)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            log.error("[POST /api/advancing/[id]/approve]", { error });
            return ApiErrors.internalError("Failed to approve advance");
        }

        return NextResponse.json({ data });
    }
);
