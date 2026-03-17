import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/catalog/[id]",
        rbac: { resource: "catalog", action: "read" },
    },
    async (_req, { supabase, log }, { params }) => {
        const { id } = await params;

        const { data, error } = await serverFromTable(supabase, "catalog_items")
            .select("*, catalog_categories(id, name, category_type), catalog_item_modifiers(*)")
            .eq("id", id)
            .is("deleted_at", null)
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Catalog item");
            log.error("[GET /api/catalog/[id]]", { error });
            return ApiErrors.internalError("Failed to fetch catalog item");
        }

        return NextResponse.json({ data });
    }
);
