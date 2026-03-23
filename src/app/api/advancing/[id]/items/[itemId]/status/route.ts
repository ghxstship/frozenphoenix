import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { advanceItemStatusTransitionSchema } from "@/lib/validation/advancing-schemas";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/advancing/[id]/items/[itemId]/status",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id, itemId } = await params;
        const parsed = await parseAndValidate(request, advanceItemStatusTransitionSchema);
        if (!parsed.success) return parsed.response;

        const updates: Record<string, unknown> = { status: parsed.data.status };
        if (parsed.data.quantity_confirmed !== undefined) {
            updates.quantity_confirmed = parsed.data.quantity_confirmed;
        }

        const { data, error } = await serverFromTable(supabase, "production_advance_items")
            .update(updates)
            .eq("id", itemId)
            .eq("advance_id", id)
            .select("id, status, quantity_confirmed, updated_at")
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Advance item");
            log.error("[POST /api/advancing/[id]/items/[itemId]/status]", { error });
            return ApiErrors.internalError("Failed to update item status");
        }

        return NextResponse.json({ data });
    }
);
