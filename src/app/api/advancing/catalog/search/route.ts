import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);

    if (!q || q.length < 2) {
        return ApiErrors.badRequest("Search query must be at least 2 characters");
    }

    const { data, error } = await serverFromTable(supabase!, "catalog_items")
        .select("*")
        .is("deleted_at", null)
        .textSearch("search_vector", q, { type: "websearch" })
        .limit(limit);

    if (error) {
        logger.error("[GET /api/advancing/catalog/search]", { error });
        return ApiErrors.internalError("Catalog search failed");
    }

    return NextResponse.json({ data });
}
