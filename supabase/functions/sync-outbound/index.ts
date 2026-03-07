/**
 * Edge Function: sync-outbound
 * Triggered by pg_notify or scheduled invocation to push local changes
 * to external providers (e.g., updating attendance status in Eventbrite).
 *
 * Accepts a JSON body specifying what to sync:
 * {
 *   "connection_id": "uuid",
 *   "entity_type": "credential_assignments" | "events" | ...,
 *   "entity_ids": ["uuid1", "uuid2"],
 *   "action": "update" | "create" | "delete"
 * }
 */

import { createServiceClient, errorResponse, jsonResponse } from "../_shared/webhook-utils.ts";
import {
    completeSyncEvent,
    createSyncEvent,
    getActiveConnection,
    incrementConnectionErrorCount,
    updateConnectionSyncTimestamp,
} from "../_shared/sync-utils.ts";

interface OutboundSyncRequest {
    connection_id: string;
    entity_type: string;
    entity_ids: string[];
    action: "update" | "create" | "delete";
}

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    const supabase = createServiceClient();
    let body: OutboundSyncRequest;

    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON payload", 400);
    }

    const { connection_id, entity_type, entity_ids, action } = body;

    if (!connection_id || !entity_type || !entity_ids?.length || !action) {
        return errorResponse(
            "Missing required fields: connection_id, entity_type, entity_ids, action",
            400
        );
    }

    // -----------------------------------------------------------------------
    // 1. Verify connection is active
    // -----------------------------------------------------------------------
    const connection = await getActiveConnection(supabase, connection_id);
    if (!connection) {
        return errorResponse("Connection not found or inactive", 404);
    }

    const providerName = connection.provider_name as string;

    // -----------------------------------------------------------------------
    // 2. Create sync event
    // -----------------------------------------------------------------------
    const syncEventId = await createSyncEvent(supabase, {
        connectionId: connection_id,
        direction: "outbound",
        entityType: entity_type,
        metadata: { action, entityCount: entity_ids.length },
    });

    // -----------------------------------------------------------------------
    // 3. Fetch entities to sync
    // -----------------------------------------------------------------------
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
        const { data: entities, error: fetchError } = await supabase
            .from(entity_type)
            .select("*")
            .in("id", entity_ids);

        if (fetchError) throw fetchError;

        if (!entities || entities.length === 0) {
            if (syncEventId) {
                await completeSyncEvent(supabase, syncEventId, {
                    status: "completed",
                    recordsProcessed: 0,
                    recordsFailed: 0,
                    errorMessage: "No entities found",
                });
            }
            return jsonResponse({
                status: "completed",
                processed: 0,
                failed: 0,
                message: "No entities found",
            });
        }

        // -----------------------------------------------------------------
        // 4. Push to provider (provider-specific logic)
        // -----------------------------------------------------------------
        for (const entity of entities) {
            try {
                // For now, log the outbound sync intent.
                // Each provider adapter would implement the actual API call.
                // This is a placeholder for the provider-specific push logic.
                await pushToProvider(supabase, {
                    providerName,
                    connectionId: connection_id,
                    entityType: entity_type,
                    entity: entity as Record<string, unknown>,
                    action,
                    credentials: {
                        apiKey: (connection.api_key as string) ?? "",
                        apiSecret: (connection.api_secret as string) ?? "",
                        accessToken: (connection.access_token as string) ?? "",
                    },
                });

                processed++;
            } catch (err) {
                const msg = (err as Error).message;
                console.error(
                    `Outbound sync failed for ${entity_type}/${(entity as Record<string, unknown>).id}:`,
                    msg
                );
                errors.push(msg);
                failed++;
            }
        }
    } catch (err) {
        const msg = (err as Error).message;
        console.error("Outbound sync batch error:", msg);
        errors.push(msg);
        failed = entity_ids.length;
    }

    // -----------------------------------------------------------------------
    // 5. Finalize
    // -----------------------------------------------------------------------
    const finalStatus =
        failed === 0 ? "completed" : failed === entity_ids.length ? "failed" : "partial";

    if (syncEventId) {
        await completeSyncEvent(supabase, syncEventId, {
            status: finalStatus,
            recordsProcessed: processed,
            recordsFailed: failed,
            errorMessage: errors.length > 0 ? errors.join("; ") : undefined,
        });
    }

    await updateConnectionSyncTimestamp(supabase, connection_id);

    if (failed > 0) {
        await incrementConnectionErrorCount(supabase, connection_id);
    }

    return jsonResponse({
        status: finalStatus,
        processed,
        failed,
        total: entity_ids.length,
        errors: errors.length > 0 ? errors : undefined,
    });
});

// ---------------------------------------------------------------------------
// Provider Push (placeholder — each provider would have its own implementation)
// ---------------------------------------------------------------------------

async function pushToProvider(
    supabase: ReturnType<typeof createServiceClient>,
    params: {
        providerName: string;
        connectionId: string;
        entityType: string;
        entity: Record<string, unknown>;
        action: string;
        credentials: { apiKey: string; apiSecret: string; accessToken: string };
    }
): Promise<void> {
    // Log outbound sync attempt for audit
    await supabase
        .from("sync_events")
        .update({
            metadata: {
                outbound_entity_id: params.entity.id,
                outbound_action: params.action,
                provider: params.providerName,
            },
        })
        .eq("connection_id", params.connectionId);

    // NEXT: Implement provider-specific API calls
    // - Eventbrite: PATCH /v3/attendees/{id}/ for check-in status
    // - Square: POST /v2/orders for order updates
    // - Front Gate: Provider-specific API endpoints

    // For now, this is a successful no-op placeholder
    // that logs the intent. Real implementation would make
    // HTTP requests to the provider APIs.
}
