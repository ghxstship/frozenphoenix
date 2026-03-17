import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/advancing/[id]/submit",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        // Fetch current advance
        const { data: advance, error: fetchError } = await serverFromTable(
            supabase,
            "production_advances"
        )
            .select("id, status, total_items")
            .eq("id", id)
            .is("deleted_at", null)
            .single();

        if (fetchError || !advance) return ApiErrors.notFound("Advance");

        // Validate transition: only draft → submitted
        if ((advance as Record<string, unknown>).status !== "draft") {
            return ApiErrors.badRequest("Only draft advances can be submitted");
        }

        // Must have at least one item
        if (((advance as Record<string, unknown>).total_items as number) < 1) {
            return ApiErrors.badRequest("Cannot submit an advance with no items");
        }

        const { data, error } = await serverFromTable(supabase, "production_advances")
            .update({ status: "submitted" } as Record<string, unknown>)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            log.error("[POST /api/advancing/[id]/submit]", { error });
            return ApiErrors.internalError("Failed to submit advance");
        }

        return NextResponse.json({ data });
    }
);
