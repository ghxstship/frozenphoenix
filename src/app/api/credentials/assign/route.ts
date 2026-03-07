import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const body = await request.json();
    const {
        pool_id,
        credential_type_id,
        assignee_name,
        assignee_email,
        profile_id,
        crew_member_id,
        vip_guest_id,
        vendor_id,
        zone_access,
        valid_from,
        valid_until,
        notes,
    } = body;

    if (!pool_id || !credential_type_id || !assignee_name) {
        return ApiErrors.badRequest("pool_id, credential_type_id, and assignee_name are required");
    }

    // Verify pool has availability
    const { data: pool, error: poolError } = await serverFromTable(supabase!, "credential_inventory_pools")
        .select("id, total_quantity, allocated_count")
        .eq("id", pool_id)
        .single();

    if (poolError || !pool) {
        return ApiErrors.notFound("Pool not found");
    }

    const poolRec = pool as unknown as Record<string, unknown>;
    if (Number(poolRec.allocated_count ?? 0) >= Number(poolRec.total_quantity ?? 0)) {
        return ApiErrors.badRequest("Pool has no remaining capacity");
    }

    const barcode_value = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();

    const { data: assignment, error } = await serverFromTable(supabase!, "credential_assignments")
        .insert({
            pool_id,
            credential_type_id,
            assignee_name,
            assignee_email: assignee_email ?? null,
            profile_id: profile_id ?? null,
            crew_member_id: crew_member_id ?? null,
            vip_guest_id: vip_guest_id ?? null,
            vendor_id: vendor_id ?? null,
            barcode_value,
            zone_access: zone_access ?? [],
            valid_from: valid_from ?? null,
            valid_until: valid_until ?? null,
            notes: notes ?? null,
            status: "requested",
            created_by: user.id,
            updated_by: user.id,
        } as Record<string, unknown>)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/credentials/assign]", { error });
        return ApiErrors.internalError("Failed to create credential assignment");
    }

    return NextResponse.json({ data: assignment }, { status: 201 });
}
