import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/advancing/catalog/search",
        rbac: { resource: "advancing", action: "read" },
    },
    async (request, { supabase, log }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q");
        const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);

        if (!q || q.length < 2) {
            return ApiErrors.badRequest("Search query must be at least 2 characters");
        }

        const { data, error } = await serverFromTable(supabase, "catalog_items")
            .select(
                "id, name, sku, description, category_id, unit_of_measure, default_unit_cost, thumbnail_url, is_active"
            )
            .is("deleted_at", null)
            .textSearch("search_vector", q, { type: "websearch" })
            .limit(limit);

        if (error) {
            log.error("[GET /api/advancing/catalog/search]", { error });
            return ApiErrors.internalError("Catalog search failed");
        }

        return NextResponse.json({ data });
    }
);
