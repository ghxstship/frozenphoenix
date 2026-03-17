import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { updateAdvanceItemSchema } from "@/lib/validation/advancing-schemas";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/advancing/[id]/items/[itemId]",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id, itemId } = await params;
        const parsed = await parseAndValidate(request, updateAdvanceItemSchema);
        if (!parsed.success) return parsed.response;

        const { data, error } = await serverFromTable(supabase, "production_advance_items")
            .update(parsed.data as Record<string, unknown>)
            .eq("id", itemId)
            .eq("advance_id", id)
            .select()
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Advance item");
            log.error("[PATCH /api/advancing/[id]/items/[itemId]]", { error });
            return ApiErrors.internalError("Failed to update item");
        }

        return NextResponse.json({ data });
    }
);

export const DELETE = withApiHandlerParams(
    {
        method: "DELETE",
        route: "/api/advancing/[id]/items/[itemId]",
        mutation: true,
        rbac: { resource: "advancing", action: "delete" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id, itemId } = await params;

        const { error } = await serverFromTable(supabase, "production_advance_items")
            .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
            .eq("id", itemId)
            .eq("advance_id", id);

        if (error) {
            log.error("[DELETE /api/advancing/[id]/items/[itemId]]", { error });
            return ApiErrors.internalError("Failed to delete item");
        }

        return NextResponse.json({ success: true });
    }
);
