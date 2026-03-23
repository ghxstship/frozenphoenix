import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { createAdvanceItemSchema } from "@/lib/validation/advancing-schemas";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/advancing/[id]/items",
        rbac: { resource: "advancing", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        const { data, error } = await serverFromTable(supabase, "production_advance_items")
            .select(
                `
                *,
                catalog_items:catalog_item_id(name, sku, thumbnail_url),
                vendors:vendor_id(name),
                assigned_to_profile:assigned_to(name)
            `
            )
            .eq("advance_id", id)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            log.error("[GET /api/advancing/[id]/items]", { error });
            return ApiErrors.internalError("Failed to fetch advance items");
        }

        return NextResponse.json({ data });
    }
);

export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/advancing/[id]/items",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id } = await params;
        const parsed = await parseAndValidate(request, createAdvanceItemSchema);
        if (!parsed.success) return parsed.response;

        // Verify advance exists and is editable
        const { data: advance, error: fetchError } = await serverFromTable(
            supabase,
            "production_advances"
        )
            .select("id, status")
            .eq("id", id)
            .is("deleted_at", null)
            .single();

        if (fetchError || !advance) return ApiErrors.notFound("Advance");

        const status = (advance as Record<string, unknown>).status as string;
        if (status !== "draft") {
            return ApiErrors.badRequest("Items can only be added to draft advances");
        }

        const { data, error } = await serverFromTable(supabase, "production_advance_items")
            .insert({
                advance_id: id,
                ...parsed.data,
            } as Record<string, unknown>)
            .select("id, name, description, quantity, status, created_at")
            .single();

        if (error) {
            log.error("[POST /api/advancing/[id]/items]", { error });
            return ApiErrors.internalError("Failed to add item");
        }

        return NextResponse.json({ data }, { status: 201 });
    }
);
