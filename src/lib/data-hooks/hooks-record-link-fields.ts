"use client";

/**
 * Record Link Fields — Lookup and Rollup computed field hooks.
 *
 * - useLookupField: pulls a specific field from linked records
 * - useRollupField: aggregates a numeric field across linked records
 */

import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase/client";
import { useRecordLinks } from "./hooks-record-links";
import type { EntityType } from "@/types/production";

// ═══════════════════════════════════════════════════════════════
// ENTITY TABLE MAP (shared)
// ═══════════════════════════════════════════════════════════════

const ENTITY_TABLE_MAP: Record<string, { table: string; nameColumn: string }> = {
    project: { table: "projects", nameColumn: "name" },
    location: { table: "locations", nameColumn: "name" },
    activation: { table: "activations", nameColumn: "name" },
    event: { table: "events", nameColumn: "name" },
    activity: { table: "activities", nameColumn: "name" },
    task: { table: "tasks", nameColumn: "title" },
    milestone: { table: "milestones", nameColumn: "name" },
    deliverable: { table: "deliverables", nameColumn: "name" },
    crew_member: { table: "crew_members", nameColumn: "name" },
    vendor: { table: "vendors", nameColumn: "name" },
    client: { table: "clients", nameColumn: "name" },
    stakeholder: { table: "stakeholders", nameColumn: "name" },
    asset: { table: "assets", nameColumn: "name" },
    consumable: { table: "consumables", nameColumn: "name" },
    vehicle: { table: "vehicles", nameColumn: "name" },
    purchase_order: { table: "purchase_orders", nameColumn: "description" },
    invoice: { table: "invoices", nameColumn: "description" },
    expense: { table: "production_expenses", nameColumn: "description" },
    budget_line: { table: "production_budget_lines", nameColumn: "description" },
    shipment: { table: "shipments", nameColumn: "description" },
    warehouse: { table: "warehouses", nameColumn: "name" },
    incident: { table: "incidents", nameColumn: "title" },
    document: { table: "documents", nameColumn: "name" },
    sop: { table: "sops", nameColumn: "title" },
};

// ═══════════════════════════════════════════════════════════════
// LOOKUP FIELD — Pull a specific field from each linked record
// ═══════════════════════════════════════════════════════════════

export interface LookupResult {
    recordId: string;
    recordName: string;
    recordType: EntityType;
    value: unknown;
}

/**
 * Reads linked records of a given type and resolves a specific field from each.
 *
 * Example: useLookupField("project", projectId, "task", "status")
 * → returns [{recordId, recordName, value: "in_progress"}, ...]
 */
export function useLookupField(
    entityType: string,
    entityId: string,
    linkedEntityType: string,
    fieldKey: string
) {
    const { data: linkedRecords } = useRecordLinks(entityType, entityId);

    // Filter to only the requested linked entity type
    const relevantRecords = (linkedRecords ?? []).filter((lr) => lr.type === linkedEntityType);
    const ids = relevantRecords.map((r) => r.id);

    return useQuery({
        queryKey: ["lookup_field", entityType, entityId, linkedEntityType, fieldKey, ids],
        queryFn: async (): Promise<LookupResult[]> => {
            const config = ENTITY_TABLE_MAP[linkedEntityType];
            if (!config || ids.length === 0) return [];

            const { data, error } = await fromTable(config.table)
                .select(`id, ${config.nameColumn}, ${fieldKey}`)
                .in("id", ids);
            if (error) throw error;

            return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
                recordId: String(row.id),
                recordName: String(row[config.nameColumn] ?? ""),
                recordType: linkedEntityType as EntityType,
                value: row[fieldKey],
            }));
        },
        enabled: ids.length > 0,
    });
}

// ═══════════════════════════════════════════════════════════════
// ROLLUP FIELD — Aggregate a numeric field across linked records
// ═══════════════════════════════════════════════════════════════

export type RollupAggregation = "sum" | "avg" | "count" | "min" | "max";

export interface RollupResult {
    aggregation: RollupAggregation;
    value: number;
    count: number;
}

/**
 * Aggregates a numeric field across linked records of a given type.
 *
 * Example: useRollupField("project", projectId, "task", "estimated_hours", "sum")
 * → { value: 120, count: 8, aggregation: "sum" }
 */
export function useRollupField(
    entityType: string,
    entityId: string,
    linkedEntityType: string,
    fieldKey: string,
    aggregation: RollupAggregation = "sum"
) {
    const { data: linkedRecords } = useRecordLinks(entityType, entityId);

    const relevantRecords = (linkedRecords ?? []).filter((lr) => lr.type === linkedEntityType);
    const ids = relevantRecords.map((r) => r.id);

    return useQuery({
        queryKey: [
            "rollup_field",
            entityType,
            entityId,
            linkedEntityType,
            fieldKey,
            aggregation,
            ids,
        ],
        queryFn: async (): Promise<RollupResult> => {
            const config = ENTITY_TABLE_MAP[linkedEntityType];
            if (!config || ids.length === 0) {
                return { aggregation, value: 0, count: 0 };
            }

            const { data, error } = await fromTable(config.table)
                .select(`id, ${fieldKey}`)
                .in("id", ids);
            if (error) throw error;

            const values = ((data ?? []) as Record<string, unknown>[])
                .map((row) => Number(row[fieldKey]))
                .filter((v) => !isNaN(v));

            const count = values.length;
            if (count === 0) return { aggregation, value: 0, count: 0 };

            let value: number;
            switch (aggregation) {
                case "sum":
                    value = values.reduce((a, b) => a + b, 0);
                    break;
                case "avg":
                    value = values.reduce((a, b) => a + b, 0) / count;
                    break;
                case "min":
                    value = Math.min(...values);
                    break;
                case "max":
                    value = Math.max(...values);
                    break;
                case "count":
                    value = count;
                    break;
            }

            return { aggregation, value, count };
        },
        enabled: ids.length > 0,
    });
}
