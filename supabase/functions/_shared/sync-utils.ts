/**
 * Shared sync utilities for Supabase Edge Functions.
 * Handles sync event lifecycle, conflict resolution, and batch processing.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncDirection = "inbound" | "outbound";
export type SyncStatus = "pending" | "in_progress" | "completed" | "failed" | "partial";

export interface SyncEventRecord {
    id: string;
    connectionId: string;
    direction: SyncDirection;
    entityType: string;
    status: SyncStatus;
    recordsProcessed: number;
    recordsFailed: number;
    errorMessage: string | null;
    metadata: Record<string, unknown>;
}

export interface ConflictPolicy {
    entityType: string;
    fieldName: string;
    resolution:
        | "source_of_truth"
        | "last_write_wins"
        | "provider_wins"
        | "compvss_wins"
        | "manual";
    sourceOfTruth: "provider" | "compvss" | null;
}

// ---------------------------------------------------------------------------
// Sync Event Lifecycle
// ---------------------------------------------------------------------------

export async function createSyncEvent(
    supabase: ReturnType<typeof createClient>,
    params: {
        connectionId: string;
        direction: SyncDirection;
        entityType: string;
        metadata?: Record<string, unknown>;
    },
): Promise<string | null> {
    const { data, error } = await supabase
        .from("sync_events")
        .insert({
            connection_id: params.connectionId,
            direction: params.direction,
            entity_type: params.entityType,
            status: "in_progress",
            started_at: new Date().toISOString(),
            records_processed: 0,
            records_failed: 0,
            metadata: params.metadata ?? {},
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to create sync event:", error.message);
        return null;
    }
    return data?.id ?? null;
}

export async function completeSyncEvent(
    supabase: ReturnType<typeof createClient>,
    syncEventId: string,
    result: {
        status: SyncStatus;
        recordsProcessed: number;
        recordsFailed: number;
        errorMessage?: string;
    },
): Promise<void> {
    await supabase
        .from("sync_events")
        .update({
            status: result.status,
            records_processed: result.recordsProcessed,
            records_failed: result.recordsFailed,
            error_message: result.errorMessage ?? null,
            completed_at: new Date().toISOString(),
        })
        .eq("id", syncEventId);
}

// ---------------------------------------------------------------------------
// Provider Connection Helpers
// ---------------------------------------------------------------------------

export async function getActiveConnection(
    supabase: ReturnType<typeof createClient>,
    connectionId: string,
): Promise<Record<string, unknown> | null> {
    const { data, error } = await supabase
        .from("provider_connections")
        .select("*")
        .eq("id", connectionId)
        .eq("status", "active")
        .single();

    if (error || !data) return null;
    return data as Record<string, unknown>;
}

export async function getConnectionByProvider(
    supabase: ReturnType<typeof createClient>,
    providerName: string,
    orgId: string,
): Promise<Record<string, unknown> | null> {
    const { data, error } = await supabase
        .from("provider_connections")
        .select("*")
        .eq("provider_name", providerName)
        .eq("org_id", orgId)
        .eq("status", "active")
        .single();

    if (error || !data) return null;
    return data as Record<string, unknown>;
}

export async function updateConnectionSyncTimestamp(
    supabase: ReturnType<typeof createClient>,
    connectionId: string,
): Promise<void> {
    await supabase
        .from("provider_connections")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", connectionId);
}

export async function incrementConnectionErrorCount(
    supabase: ReturnType<typeof createClient>,
    connectionId: string,
): Promise<void> {
    // Attempt atomic increment via RPC (requires increment_connection_error_count function in DB).
    // Falls back to read-then-write if RPC is not available.
    const { error: rpcError } = await supabase.rpc("increment_connection_error_count", {
        p_connection_id: connectionId,
        p_error_threshold: 10,
    });

    if (!rpcError) return;

    // Fallback: non-atomic read-then-write (acceptable for low-concurrency webhooks)
    console.warn("increment_connection_error_count RPC not available, using fallback:", rpcError.message);
    const { data } = await supabase
        .from("provider_connections")
        .select("error_count")
        .eq("id", connectionId)
        .single();

    const currentCount = (data?.error_count as number) ?? 0;
    const newCount = currentCount + 1;

    await supabase
        .from("provider_connections")
        .update({
            error_count: newCount,
            ...(newCount >= 10 ? { status: "error" } : {}),
        })
        .eq("id", connectionId);
}

// ---------------------------------------------------------------------------
// Conflict Resolution
// ---------------------------------------------------------------------------

export async function getConflictPolicies(
    supabase: ReturnType<typeof createClient>,
    connectionId: string,
    entityType: string,
): Promise<ConflictPolicy[]> {
    const { data } = await supabase
        .from("sync_conflict_policies")
        .select("*")
        .eq("connection_id", connectionId)
        .eq("entity_type", entityType);

    return (data ?? []).map((p: Record<string, unknown>) => ({
        entityType: p.entity_type as string,
        fieldName: p.field_name as string,
        resolution: p.resolution as ConflictPolicy["resolution"],
        sourceOfTruth: (p.source_of_truth as ConflictPolicy["sourceOfTruth"]) ?? null,
    }));
}

export function resolveConflict(
    policy: ConflictPolicy,
    providerValue: unknown,
    localValue: unknown,
    providerUpdatedAt: string,
    localUpdatedAt: string,
): unknown {
    switch (policy.resolution) {
        case "provider_wins":
            return providerValue;
        case "compvss_wins":
            return localValue;
        case "last_write_wins":
            return new Date(providerUpdatedAt) > new Date(localUpdatedAt)
                ? providerValue
                : localValue;
        case "source_of_truth":
            return policy.sourceOfTruth === "provider" ? providerValue : localValue;
        case "manual":
            // Return local value and flag for manual review
            return localValue;
        default:
            return localValue;
    }
}

// ---------------------------------------------------------------------------
// Batch Processing Helper
// ---------------------------------------------------------------------------

export async function processBatch<T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<{ processed: number; failed: number }>,
): Promise<{ totalProcessed: number; totalFailed: number }> {
    let totalProcessed = 0;
    let totalFailed = 0;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const result = await processor(batch);
        totalProcessed += result.processed;
        totalFailed += result.failed;
    }

    return { totalProcessed, totalFailed };
}

// ---------------------------------------------------------------------------
// Provider Ticket Map Helpers
// ---------------------------------------------------------------------------

export async function upsertTicketMap(
    supabase: ReturnType<typeof createClient>,
    params: {
        connectionId: string;
        providerTicketId: string;
        providerOrderId?: string;
        assignmentId?: string;
        syncStatus: string;
        lastSyncedAt: string;
        providerData?: Record<string, unknown>;
    },
): Promise<void> {
    await supabase.from("provider_ticket_map").upsert(
        {
            connection_id: params.connectionId,
            provider_ticket_id: params.providerTicketId,
            provider_order_id: params.providerOrderId ?? null,
            assignment_id: params.assignmentId ?? null,
            sync_status: params.syncStatus,
            last_synced_at: params.lastSyncedAt,
            provider_data: params.providerData ?? {},
        },
        { onConflict: "connection_id,provider_ticket_id" },
    );
}
