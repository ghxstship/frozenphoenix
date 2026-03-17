import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/integrations/sync-log",
        rbac: { resource: "integrations", action: "read" },
    },
    async (request, { supabase, log }) => {
        const url = new URL(request.url);
        const connectionId = url.searchParams.get("connection_id");
        const direction = url.searchParams.get("direction");
        const status = url.searchParams.get("status");
        const entityType = url.searchParams.get("entity_type");
        const dateFrom = url.searchParams.get("date_from");
        const dateTo = url.searchParams.get("date_to");
        const page = parseInt(url.searchParams.get("page") ?? "1", 10);
        const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "50", 10), 100);

        let query = serverFromTable(supabase, "sync_events")
            .select("*, provider_connections:connection_id(id, display_name, provider_type)", {
                count: "exact",
            })
            .order("created_at", { ascending: false });

        if (connectionId) query = query.eq("connection_id", connectionId);
        if (direction) query = query.eq("direction", direction);
        if (status) query = query.eq("status", status);
        if (entityType) query = query.eq("entity_type", entityType);
        if (dateFrom) query = query.gte("created_at", dateFrom);
        if (dateTo) query = query.lte("created_at", dateTo);

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) {
            log.error("[GET /api/integrations/sync-log]", { error });
            return ApiErrors.internalError("Failed to fetch sync log");
        }

        return NextResponse.json({
            data,
            pagination: { page, per_page: perPage, total: count ?? 0 },
        });
    }
);
