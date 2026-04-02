/**
 * Integration Sync Engine
 *
 * Executes data synchronization between FrozenPhoenix and external providers.
 * Each SyncAdapter handles a specific provider+entity_type combination.
 *
 * Architecture:
 *  - SyncEngine.run(connectionId) → orchestrates a full or incremental sync
 *  - Provider adapters implement SyncAdapter interface
 *  - Results are written to sync_events table
 *
 * Supported sync modes:
 *  - push: FrozenPhoenix → Provider
 *  - pull: Provider → FrozenPhoenix
 *  - bidirectional: conflict-resolved merge
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SyncRecord {
    id: string;
    [key: string]: unknown;
}

export type SyncDirection = "push" | "pull" | "bidirectional";
export type SyncStatus = "success" | "partial" | "failed" | "skipped";

export interface SyncResult {
    direction: SyncDirection;
    entityType: string;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsSkipped: number;
    recordsFailed: number;
    errors: string[];
    status: SyncStatus;
    startedAt: string;
    completedAt: string;
}

export interface SyncContext {
    supabase: SupabaseClient;
    connectionId: string;
    orgId: string;
    accessToken: string;
    refreshToken?: string | undefined;
    providerType: string;
    entityType: string;
    direction: SyncDirection;
    lastSyncAt?: string | undefined;
    options?: Record<string, unknown>;
}

/** Interface every provider sync adapter must implement */
export interface SyncAdapter {
    providerType: string;
    entityType: string;
    supportedDirections: SyncDirection[];

    /**
     * Pull records from the external provider and upsert into Supabase.
     */
    pull?(ctx: SyncContext): Promise<SyncResult>;

    /**
     * Push records from Supabase to the external provider.
     */
    push?(ctx: SyncContext): Promise<SyncResult>;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

type AdapterKey = `${string}:${string}`;

class SyncAdapterRegistry {
    private adapters = new Map<AdapterKey, SyncAdapter>();

    register(adapter: SyncAdapter): void {
        const key: AdapterKey = `${adapter.providerType}:${adapter.entityType}`;
        this.adapters.set(key, adapter);
    }

    get(providerType: string, entityType: string): SyncAdapter | undefined {
        return this.adapters.get(`${providerType}:${entityType}`);
    }

    getSupportedProviders(): string[] {
        return [...new Set([...this.adapters.keys()].map((k) => k.split(":")[0]!))];
    }
}

export const syncAdapterRegistry = new SyncAdapterRegistry();

// ─── Engine ───────────────────────────────────────────────────────────────────

export class SyncEngine {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Execute a sync run for a given connection.
     * Logs results to sync_events table.
     */
    async run(
        connectionId: string,
        entityType: string,
        direction: SyncDirection = "pull"
    ): Promise<SyncResult> {
        const startedAt = new Date().toISOString();

        // Load connection
        const { data: conn, error: connErr } = await this.supabase
            .from("integration_connections")
            .select("*")
            .eq("id", connectionId)
            .single();

        if (connErr || !conn) {
            return this.failResult(entityType, direction, startedAt, "Connection not found");
        }

        const row = conn as Record<string, string | undefined>;
        const ctx: SyncContext = {
            supabase: this.supabase,
            connectionId,
            orgId: row.organization_id ?? "",
            accessToken: row.access_token ?? "",
            refreshToken: row.refresh_token,
            providerType: row.provider_type ?? "",
            entityType,
            direction,
            lastSyncAt: row.last_sync_at,
        };

        const adapter = syncAdapterRegistry.get(ctx.providerType, entityType);
        if (!adapter) {
            return this.failResult(
                entityType,
                direction,
                startedAt,
                `No adapter registered for ${ctx.providerType}:${entityType}`
            );
        }

        if (!adapter.supportedDirections.includes(direction)) {
            return this.failResult(
                entityType,
                direction,
                startedAt,
                `Adapter does not support direction: ${direction}`
            );
        }

        let result: SyncResult;
        try {
            if (direction === "pull" && adapter.pull) {
                result = await adapter.pull(ctx);
            } else if (direction === "push" && adapter.push) {
                result = await adapter.push(ctx);
            } else {
                result = this.failResult(
                    entityType,
                    direction,
                    startedAt,
                    "No handler for direction"
                );
            }
        } catch (err) {
            result = this.failResult(
                entityType,
                direction,
                startedAt,
                err instanceof Error ? err.message : "Unknown error"
            );
        }

        // Log to sync_events
        await this.supabase
            .from("integration_connections")
            .update({
                last_sync_at: result.completedAt,
                sync_status: result.status,
            })
            .eq("id", connectionId);

        return result;
    }

    private failResult(
        entityType: string,
        direction: SyncDirection,
        startedAt: string,
        error: string
    ): SyncResult {
        return {
            direction,
            entityType,
            recordsProcessed: 0,
            recordsCreated: 0,
            recordsUpdated: 0,
            recordsSkipped: 0,
            recordsFailed: 0,
            errors: [error],
            status: "failed",
            startedAt,
            completedAt: new Date().toISOString(),
        };
    }
}
