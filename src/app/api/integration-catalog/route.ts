import { NextResponse } from "next/server";
import { getServerSupabase, serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/integration-catalog
 *
 * Returns the integration catalog (public reference data).
 * No org scoping — catalog is global.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/integration-catalog",
        rbac: { resource: "provider_connections", action: "read" },
    },
    async (_request, { log }) => {
        const supabase = await getServerSupabase();

        const { data, error } = await serverFromTable(supabase, "integration_catalog")
            .select(
                "id, name, provider_type, description, category, icon_url, is_available, sort_order, auth_type, features"
            )
            .eq("is_available", true)
            .order("sort_order", { ascending: true });

        if (error) {
            log.error("[GET /api/integration-catalog] failed", { error: error.message });
            return NextResponse.json(
                { data: [], error: "Failed to fetch integration catalog" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: data ?? [] });
    }
);
