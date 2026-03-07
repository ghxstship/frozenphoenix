import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const categoryId = req.nextUrl.searchParams.get("category_id");
    const search = req.nextUrl.searchParams.get("q");
    const activeOnly = req.nextUrl.searchParams.get("active") !== "false";

    // Fetch categories
    const { data: categories, error: catError } = await serverFromTable(supabase!, "catalog_categories")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order");

    if (catError) {
        logger.error("[GET /api/catalog] categories", { error: catError });
        return ApiErrors.internalError("Failed to fetch categories");
    }

    // Fetch items
    let itemsQuery = serverFromTable(supabase!, "catalog_items")
        .select("*, catalog_categories(id, name, category_type)")
        .is("deleted_at", null)
        .order("name");

    if (activeOnly) {
        itemsQuery = itemsQuery.eq("is_active", true);
    }
    if (categoryId) {
        itemsQuery = itemsQuery.eq("category_id", categoryId);
    }
    if (search) {
        itemsQuery = itemsQuery.ilike("name", `%${search}%`);
    }

    const { data: items, error: itemsError } = await itemsQuery;
    if (itemsError) {
        logger.error("[GET /api/catalog] items", { error: itemsError });
        return ApiErrors.internalError("Failed to fetch catalog items");
    }

    return NextResponse.json({ categories, items });
}
