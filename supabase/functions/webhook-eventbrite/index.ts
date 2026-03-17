/**
 * Edge Function: webhook-eventbrite
 * Receives Eventbrite webhook payloads, validates signature, deduplicates,
 * normalizes tickets, and upserts into credential_assignments + provider_ticket_map.
 */

import {
    computePayloadHash,
    createServiceClient,
    errorResponse,
    isDuplicate,
    jsonResponse,
    logWebhookEvent,
    updateWebhookEventStatus,
} from "../_shared/webhook-utils.ts";
import {
    completeSyncEvent,
    createSyncEvent,
    incrementConnectionErrorCount,
    updateConnectionSyncTimestamp,
    upsertTicketMap,
} from "../_shared/sync-utils.ts";
import { eventbriteAdapter } from "../_shared/provider-adapters/eventbrite.ts";

const PROVIDER_NAME = "eventbrite";

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    const supabase = createServiceClient();
    const rawBody = await req.text();
    let payload: Record<string, unknown>;

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return errorResponse("Invalid JSON payload", 400);
    }

    // -----------------------------------------------------------------------
    // 1. Find active connection for this provider
    // -----------------------------------------------------------------------
    const { data: connections } = await supabase
        .from("provider_connections")
        .select("id, webhook_secret, org_id")
        .eq("provider_name", PROVIDER_NAME)
        .eq("status", "active");

    if (!connections || connections.length === 0) {
        return errorResponse("No active Eventbrite connection found", 404);
    }

    // -----------------------------------------------------------------------
    // 2. Disambiguate connection + validate signature
    //    If multiple active connections exist, match by webhook secret.
    // -----------------------------------------------------------------------
    const headers: Record<string, string> = {};
    req.headers.forEach((v: string, k: string) => {
        headers[k.toLowerCase()] = v;
    });

    let connection: Record<string, unknown> | null = null;

    if (connections.length === 1) {
        connection = connections[0] as Record<string, unknown>;
        const secret = (connection.webhook_secret as string) ?? "";
        if (!secret) {
            console.error(
                "Eventbrite connection missing webhook_secret — rejecting unsigned payload"
            );
            return errorResponse("Webhook signature validation not configured", 500);
        }
        const valid = await eventbriteAdapter.validateSignature(rawBody, headers, secret);
        if (!valid) return errorResponse("Invalid webhook signature", 401);
    } else {
        // Multiple connections — find the one whose secret validates
        for (const conn of connections) {
            const c = conn as Record<string, unknown>;
            const secret = (c.webhook_secret as string) ?? "";
            if (!secret) continue;
            const valid = await eventbriteAdapter.validateSignature(rawBody, headers, secret);
            if (valid) {
                connection = c;
                break;
            }
        }
        if (!connection) {
            return errorResponse("No matching connection for webhook signature", 401);
        }
    }

    const connectionId = connection.id as string;

    // -----------------------------------------------------------------------
    // 3. Deduplication
    // -----------------------------------------------------------------------
    const payloadHash = await computePayloadHash(rawBody);
    if (await isDuplicate(supabase, payloadHash, PROVIDER_NAME)) {
        return jsonResponse({ status: "duplicate", message: "Event already processed" });
    }

    // -----------------------------------------------------------------------
    // 4. Log webhook event
    // -----------------------------------------------------------------------
    const eventType = eventbriteAdapter.extractEventType(payload);
    const webhookEventId = await logWebhookEvent(supabase, {
        connectionId,
        providerName: PROVIDER_NAME,
        eventType,
        payloadHash,
        rawPayload: payload,
        status: "pending",
    });

    // -----------------------------------------------------------------------
    // 5. Normalize tickets
    // -----------------------------------------------------------------------
    const tickets = eventbriteAdapter.normalizeTickets(payload);
    if (tickets.length === 0) {
        if (webhookEventId) {
            await updateWebhookEventStatus(supabase, webhookEventId, "processed");
        }
        return jsonResponse({ status: "ok", message: "No tickets to process", processed: 0 });
    }

    // -----------------------------------------------------------------------
    // 6. Create sync event and process
    // -----------------------------------------------------------------------
    const syncEventId = await createSyncEvent(supabase, {
        connectionId,
        direction: "inbound",
        entityType: "tickets",
        metadata: { eventType, ticketCount: tickets.length },
    });

    let processed = 0;
    let failed = 0;

    for (const ticket of tickets) {
        try {
            // Look up or create credential type
            const { data: credType } = await supabase
                .from("credential_types")
                .select("id")
                .eq("name", ticket.ticketType)
                .eq("category", ticket.ticketCategory)
                .limit(1)
                .single();

            const credentialTypeId = credType?.id as string | undefined;

            // Upsert credential assignment
            const assignmentData = {
                credential_type_id: credentialTypeId ?? null,
                assignee_name: ticket.attendeeName,
                assignee_email: ticket.attendeeEmail,
                assignee_phone: ticket.attendeePhone,
                barcode_value: ticket.barcodeValue ?? ticket.providerTicketId,
                barcode_format: ticket.barcodeFormat,
                status: ticket.status === "active" ? "issued" : "revoked",
                zone_access: ticket.zoneAccess,
                org_id: connection.org_id,
                metadata: ticket.metadata,
            };

            const { data: assignment } = await supabase
                .from("credential_assignments")
                .upsert(assignmentData, { onConflict: "barcode_value" })
                .select("id")
                .single();

            // Update provider ticket map
            await upsertTicketMap(supabase, {
                connectionId,
                providerTicketId: ticket.providerTicketId,
                providerOrderId: ticket.providerOrderId ?? undefined,
                assignmentId: assignment?.id as string | undefined,
                syncStatus: "synced",
                lastSyncedAt: new Date().toISOString(),
                providerData: ticket.metadata,
            });

            processed++;
        } catch (err) {
            console.error(
                `Failed to process ticket ${ticket.providerTicketId}:`,
                (err as Error).message
            );
            failed++;
        }
    }

    // -----------------------------------------------------------------------
    // 7. Finalize
    // -----------------------------------------------------------------------
    const finalStatus =
        failed === 0 ? "completed" : failed === tickets.length ? "failed" : "partial";

    if (syncEventId) {
        await completeSyncEvent(supabase, syncEventId, {
            status: finalStatus,
            recordsProcessed: processed,
            recordsFailed: failed,
        });
    }

    await updateConnectionSyncTimestamp(supabase, connectionId);

    if (failed > 0) {
        await incrementConnectionErrorCount(supabase, connectionId);
    }

    if (webhookEventId) {
        await updateWebhookEventStatus(
            supabase,
            webhookEventId,
            failed === tickets.length ? "failed" : "processed"
        );
    }

    return jsonResponse({
        status: finalStatus,
        processed,
        failed,
        total: tickets.length,
    });
});
