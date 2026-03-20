import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/custom-fields/values?entity_type=&entity_id=
 * POST /api/custom-fields/values
 *
 * Gap #33: Custom field rendering on detail pages
 * Reads/writes custom field values for any entity instance.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/custom-fields/values",
        rbac: { resource: "dashboard", action: "read" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const entityType = url.searchParams.get("entity_type");
        const entityId = url.searchParams.get("entity_id");

        if (!entityType || !entityId) {
            return ApiErrors.badRequest("entity_type and entity_id are required");
        }

        // Fetch field definitions for this entity type
        const { data: definitions } = await serverFromTable(supabase, "custom_field_definitions")
            .select("id, name, field_type, options, required, description, display_order")
            .eq("entity_type", entityType)
            .eq("organization_id", orgId)
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (!definitions || (definitions as unknown[]).length === 0) {
            return NextResponse.json({ data: { definitions: [], values: {} } });
        }

        // Fetch stored values for this entity instance
        const { data: storedValues } = await serverFromTable(supabase, "custom_field_values")
            .select("field_definition_id, value")
            .eq("entity_type", entityType)
            .eq("entity_id", entityId);

        const valueMap: Record<string, unknown> = {};
        if (storedValues) {
            for (const sv of storedValues as Array<Record<string, unknown>>) {
                valueMap[sv.field_definition_id as string] = sv.value;
            }
        }

        return NextResponse.json({
            data: {
                definitions: definitions as unknown[],
                values: valueMap,
            },
        });
    }
);

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/custom-fields/values",
        mutation: true,
    },
    async (request, { supabase, orgId }) => {
        const body = await request.json();
        const { entity_type, entity_id, field_definition_id, value } = body;

        if (!entity_type || !entity_id || !field_definition_id) {
            return ApiErrors.badRequest(
                "entity_type, entity_id, and field_definition_id are required"
            );
        }

        // Upsert the custom field value
        const { error } = await serverFromTable(supabase, "custom_field_values").upsert(
            {
                entity_type,
                entity_id,
                field_definition_id,
                value,
                organization_id: orgId,
            },
            { onConflict: "entity_type,entity_id,field_definition_id" }
        );

        if (error) {
            return ApiErrors.internalError("Failed to save custom field value");
        }

        return NextResponse.json({ data: { saved: true } });
    }
);
