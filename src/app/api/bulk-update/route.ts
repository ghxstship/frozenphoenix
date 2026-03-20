import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/bulk-update
 *
 * Gap #37: Bulk field update
 * Updates a single field across multiple records of the same entity type.
 *
 * Body: { entity: string, ids: string[], field: string, value: unknown }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/bulk-update",
        mutation: true,
    },
    async (request, { supabase, orgId, log }) => {
        const body = await request.json();
        const { entity, ids, field, value } = body;

        if (!entity || !ids || !Array.isArray(ids) || ids.length === 0 || !field) {
            return ApiErrors.badRequest("entity, ids (array), field, and value are required");
        }

        if (ids.length > 100) {
            return ApiErrors.badRequest("Maximum 100 records per bulk update");
        }

        // Prevent updating protected fields
        const PROTECTED_FIELDS = new Set(["id", "organization_id", "created_at", "created_by"]);
        if (PROTECTED_FIELDS.has(field)) {
            return ApiErrors.badRequest(`Field "${field}" cannot be bulk-updated`);
        }

        const tableName = entity.replace(/-/g, "_");

        try {
            const { error, count } = await serverFromTable(supabase, tableName)
                .update({ [field]: value, updated_at: new Date().toISOString() })
                .in("id", ids)
                .eq("organization_id", orgId);

            if (error) {
                log.error("Bulk update failed", { entity, field, error: error.message });
                return ApiErrors.internalError("Bulk update failed");
            }

            return NextResponse.json({
                data: { updated: count ?? ids.length, entity, field, value },
            });
        } catch (err) {
            log.error("Bulk update exception", { error: (err as Error).message });
            return ApiErrors.internalError("Bulk update failed");
        }
    }
);
