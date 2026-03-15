/**
 * Edge Function: webhook-square
 * Receives Square POS webhook payloads, validates signature, deduplicates,
 * normalizes transactions, and inserts into pos_transactions + pos_transaction_items.
 */

import { computePayloadHash, createServiceClient, errorResponse, isDuplicate, jsonResponse, logWebhookEvent, updateWebhookEventStatus } from "../_shared/webhook-utils.ts";
import { completeSyncEvent, createSyncEvent, incrementConnectionErrorCount, updateConnectionSyncTimestamp } from "../_shared/sync-utils.ts";
import { squareAdapter } from "../_shared/provider-adapters/square.ts";

const PROVIDER_NAME = "square";

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
    // 1. Find active connection
    // -----------------------------------------------------------------------
    const { data: connections } = await supabase
        .from("provider_connections")
        .select("id, webhook_secret, org_id, event_id")
        .eq("provider_name", PROVIDER_NAME)
        .eq("status", "active");

    if (!connections || connections.length === 0) {
        return errorResponse("No active Square connection found", 404);
    }

    // -----------------------------------------------------------------------
    // 2. Disambiguate connection + validate signature
    //    If multiple active connections exist, match by webhook secret.
    // -----------------------------------------------------------------------
    const headers: Record<string, string> = {};
    req.headers.forEach((v: string, k: string) => { headers[k.toLowerCase()] = v; });

    let connection: Record<string, unknown> | null = null;

    if (connections.length === 1) {
        connection = connections[0] as Record<string, unknown>;
        const secret = (connection.webhook_secret as string) ?? "";
        if (secret) {
            const valid = await squareAdapter.validateSignature(rawBody, headers, secret);
            if (!valid) return errorResponse("Invalid webhook signature", 401);
        }
    } else {
        // Multiple connections — find the one whose secret validates
        for (const conn of connections) {
            const c = conn as Record<string, unknown>;
            const secret = (c.webhook_secret as string) ?? "";
            if (!secret) continue;
            const valid = await squareAdapter.validateSignature(rawBody, headers, secret);
            if (valid) { connection = c; break; }
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
    const eventType = squareAdapter.extractEventType(payload);
    const webhookEventId = await logWebhookEvent(supabase, {
        connectionId,
        providerName: PROVIDER_NAME,
        eventType,
        payloadHash,
        rawPayload: payload,
        status: "pending",
    });

    // -----------------------------------------------------------------------
    // 5. Normalize transactions
    // -----------------------------------------------------------------------
    const transactions = squareAdapter.normalizeTransactions(payload);
    if (transactions.length === 0) {
        if (webhookEventId) {
            await updateWebhookEventStatus(supabase, webhookEventId, "processed");
        }
        return jsonResponse({ status: "ok", message: "No transactions to process", processed: 0 });
    }

    // -----------------------------------------------------------------------
    // 6. Create sync event and process
    // -----------------------------------------------------------------------
    const syncEventId = await createSyncEvent(supabase, {
        connectionId,
        direction: "inbound",
        entityType: "pos_transactions",
        metadata: { eventType, transactionCount: transactions.length },
    });

    let processed = 0;
    let failed = 0;

    for (const txn of transactions) {
        try {
            // Insert POS transaction
            const { data: posTxn, error: txnError } = await supabase
                .from("pos_transactions")
                .insert({
                    connection_id: connectionId,
                    provider_transaction_id: txn.providerTransactionId,
                    transaction_type: txn.transactionType,
                    total_amount: txn.totalAmount,
                    tax_amount: txn.taxAmount,
                    tip_amount: txn.tipAmount,
                    discount_amount: txn.discountAmount,
                    currency: txn.currency,
                    payment_method: txn.paymentMethod,
                    category: txn.category,
                    completed_at: txn.completedAt,
                    event_id: connection.event_id ?? null,
                    org_id: connection.org_id,
                    metadata: txn.metadata,
                })
                .select("id")
                .single();

            if (txnError) throw txnError;

            // Insert line items
            if (posTxn && txn.items.length > 0) {
                const items = txn.items.map((item) => ({
                    transaction_id: posTxn.id,
                    name: item.name,
                    sku: item.sku,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    total_price: item.totalPrice,
                    category: item.category,
                }));

                await supabase.from("pos_transaction_items").insert(items);
            }

            processed++;
        } catch (err) {
            console.error(`Failed to process transaction ${txn.providerTransactionId}:`, (err as Error).message);
            failed++;
        }
    }

    // -----------------------------------------------------------------------
    // 7. Finalize
    // -----------------------------------------------------------------------
    const finalStatus = failed === 0 ? "completed" : failed === transactions.length ? "failed" : "partial";

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
            failed === transactions.length ? "failed" : "processed",
        );
    }

    return jsonResponse({
        status: finalStatus,
        processed,
        failed,
        total: transactions.length,
    });
});
