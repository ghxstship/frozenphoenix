import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { createAdvanceItemSchema } from "@/lib/validation/advancing-schemas";
import { logger } from "@/lib/logger";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;

    const { data, error } = await serverFromTable(supabase!, "production_advance_items")
        .select(`
            *,
            catalog_items:catalog_item_id(name, sku, thumbnail_url),
            vendors:vendor_id(name),
            assigned_to_profile:assigned_to(name)
        `)
        .eq("advance_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

    if (error) {
        logger.error("[GET /api/advancing/[id]/items]", { error });
        return ApiErrors.internalError("Failed to fetch advance items");
    }

    return NextResponse.json({ data });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;
    const parsed = await parseAndValidate(request, createAdvanceItemSchema);
    if (!parsed.success) return parsed.response;

    // Verify advance exists and is editable
    const { data: advance, error: fetchError } = await serverFromTable(supabase!, "production_advances")
        .select("id, status")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (fetchError || !advance) return ApiErrors.notFound("Advance");

    const status = (advance as Record<string, unknown>).status as string;
    if (status !== "draft") {
        return ApiErrors.badRequest("Items can only be added to draft advances");
    }

    const { data, error } = await serverFromTable(supabase!, "production_advance_items")
        .insert({
            advance_id: id,
            ...parsed.data,
        } as Record<string, unknown>)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/advancing/[id]/items]", { error });
        return ApiErrors.internalError("Failed to add item");
    }

    return NextResponse.json({ data }, { status: 201 });
}
