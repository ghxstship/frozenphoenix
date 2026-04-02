import { NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { syncAdapterRegistry, SyncEngine } from "@/lib/integrations/sync-engine";
import type { SyncDirection } from "@/lib/integrations/sync-engine";

/**
 * POST /api/integrations/sync
 *
 * Triggers a sync run for a specific integration connection.
 * Body: { connection_id: string, entity_type: string, direction?: "pull" | "push" }
 *
 * Returns the SyncResult with processed/created/updated/failed counts.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/integrations/sync",
        mutation: true,
        rbac: { resource: "integrations", action: "write" },
    },
    async (request, { supabase }) => {
        const body = await request.json().catch(() => null);
        if (!body?.connection_id || !body?.entity_type) {
            return ApiErrors.badRequest("connection_id and entity_type are required");
        }

        const direction: SyncDirection = body.direction ?? "pull";
        if (!["pull", "push", "bidirectional"].includes(direction)) {
            return ApiErrors.badRequest(`Invalid direction: ${direction}`);
        }

        const engine = new SyncEngine(supabase);
        const result = await engine.run(body.connection_id, body.entity_type, direction);

        return NextResponse.json({ data: result });
    }
);

/**
 * GET /api/integrations/sync
 *
 * Returns the list of registered adapter capabilities.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/integrations/sync",
        rbac: { resource: "integrations", action: "read" },
    },
    async () => {
        const providers = syncAdapterRegistry.getSupportedProviders();
        return NextResponse.json({ data: { providers, adapters_registered: providers.length } });
    }
);
