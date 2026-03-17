import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { credentialAssignSchema, validate } from "@/lib/validation/schemas";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/credentials/assign",
        mutation: true,
        rbac: { resource: "credentials", action: "write" },
    },
    async (request, { supabase, user, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(credentialAssignSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

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
        } = result.data;

        // Verify pool has availability
        const { data: pool, error: poolError } = await serverFromTable(
            supabase,
            "credential_inventory_pools"
        )
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

        const { data: assignment, error } = await serverFromTable(
            supabase,
            "credential_assignments"
        )
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
            log.error("[POST /api/credentials/assign]", { error });
            return ApiErrors.internalError("Failed to create credential assignment");
        }

        return NextResponse.json({ data: assignment }, { status: 201 });
    }
);
