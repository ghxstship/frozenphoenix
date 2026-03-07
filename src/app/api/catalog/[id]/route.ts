import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { data, error } = await serverFromTable(supabase!, "catalog_items")
        .select("*, catalog_categories(id, name, category_type), catalog_item_modifiers(*)")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") return ApiErrors.notFound("Catalog item");
        logger.error("[GET /api/catalog/[id]]", { error });
        return ApiErrors.internalError("Failed to fetch catalog item");
    }

    return NextResponse.json({ data });
}
