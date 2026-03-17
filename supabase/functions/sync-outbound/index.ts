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

import {
    createServiceClient,
    errorResponse,
    jsonResponse,
    requireServiceRoleAuth,
} from "../_shared/webhook-utils.ts";
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

    // Auth guard — only pg_notify / internal callers with service role key
    const authErr = requireServiceRoleAuth(req);
    if (authErr) return authErr;

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
// Provider Push — Real implementations per provider (G2)
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
    const { providerName, entity, action, credentials } = params;

    switch (providerName) {
        case "eventbrite":
            await pushToEventbrite(entity, action, credentials);
            break;
        case "square":
            await pushToSquare(entity, action, credentials);
            break;
        default:
            // Log outbound sync attempt for unsupported providers
            console.warn(`Outbound sync not implemented for provider: ${providerName}`);
    }
}

// ─── Eventbrite Outbound ─────────────────────────────────────

async function pushToEventbrite(
    entity: Record<string, unknown>,
    action: string,
    credentials: { apiKey: string; apiSecret: string; accessToken: string }
): Promise<void> {
    const token = credentials.accessToken || credentials.apiKey;
    if (!token) throw new Error("No Eventbrite API token configured");

    const baseUrl = "https://www.eventbriteapi.com/v3";
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // Look up provider ticket mapping
    const providerTicketId = entity.provider_ticket_id as string;

    if (action === "update" && providerTicketId) {
        // Update attendee check-in status
        const checkedIn = entity.status === "checked_in" || entity.status === "used";
        const endpoint = `${baseUrl}/attendees/${providerTicketId}/`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
                attendee: {
                    checked_in: checkedIn,
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Eventbrite API error (${response.status}): ${errText.slice(0, 300)}`);
        }
    }
}

// ─── Square Outbound ─────────────────────────────────────────

async function pushToSquare(
    entity: Record<string, unknown>,
    action: string,
    credentials: { apiKey: string; apiSecret: string; accessToken: string }
): Promise<void> {
    const token = credentials.accessToken || credentials.apiKey;
    if (!token) throw new Error("No Square API token configured");

    const baseUrl = "https://connect.squareup.com/v2";
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18",
    };

    if (action === "update" && entity.provider_transaction_id) {
        // Update an existing order
        const orderId = entity.provider_transaction_id as string;
        const locationId = entity.location_external_id as string;

        if (!locationId) throw new Error("Square requires location_id for order updates");

        const response = await fetch(`${baseUrl}/orders/${orderId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                order: {
                    location_id: locationId,
                    version: entity.version || 1,
                    state: mapToSquareState(entity.status as string),
                },
                idempotency_key: `outbound-${entity.id}-${Date.now()}`,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Square API error (${response.status}): ${errText.slice(0, 300)}`);
        }
    } else if (action === "create") {
        // Create a new order
        const locationId = entity.location_external_id as string;
        if (!locationId) throw new Error("Square requires location_id for order creation");

        const response = await fetch(`${baseUrl}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                order: {
                    location_id: locationId,
                    reference_id: entity.id as string,
                    line_items:
                        (entity.items as unknown[])?.map((item: unknown) => {
                            const i = item as Record<string, unknown>;
                            return {
                                name: i.name,
                                quantity: String(i.quantity ?? 1),
                                base_price_money: {
                                    amount: Math.round(Number(i.unit_price ?? 0) * 100),
                                    currency: (entity.currency as string) || "USD",
                                },
                            };
                        }) ?? [],
                },
                idempotency_key: `outbound-create-${entity.id}-${Date.now()}`,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Square API error (${response.status}): ${errText.slice(0, 300)}`);
        }
    }
}

function mapToSquareState(status: string): string {
    const map: Record<string, string> = {
        completed: "COMPLETED",
        cancelled: "CANCELED",
        pending: "OPEN",
        refunded: "CANCELED",
    };
    return map[status] ?? "OPEN";
}
