"use client";

/**
 * Record Links — React Query hooks for the generic `record_links` table.
 * Enables AirTable/SmartSuite-style linked records across any entity types.
 *
 * Hooks:
 *  - useRecordLinks(entityType, entityId) — bi-directional fetch
 *  - useLinkRecords()                     — create a link
 *  - useUnlinkRecords()                   — delete a link
 *  - useSearchEntities(entityType, query) — debounced entity search for picker
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase/client";
import type { EntityType, LinkedRecord } from "@/types/production";

// ═══════════════════════════════════════════════════════════════
// ENTITY TABLE MAPPING — maps EntityType to Supabase table + name column
// ═══════════════════════════════════════════════════════════════

interface EntityTableConfig {
    table: string;
    nameColumn: string;
    statusColumn?: string | undefined;
}

const ENTITY_TABLE_MAP: Record<string, EntityTableConfig> = {
    project: { table: "projects", nameColumn: "name", statusColumn: "status" },
    location: { table: "locations", nameColumn: "name" },
    activation: { table: "activations", nameColumn: "name", statusColumn: "status" },
    event: { table: "events", nameColumn: "name", statusColumn: "status" },
    activity: { table: "activities", nameColumn: "name", statusColumn: "status" },
    task: { table: "tasks", nameColumn: "title", statusColumn: "status" },
    milestone: { table: "milestones", nameColumn: "name", statusColumn: "status" },
    deliverable: { table: "deliverables", nameColumn: "name", statusColumn: "status" },
    crew_member: { table: "crew_members", nameColumn: "name", statusColumn: "status" },
    vendor: { table: "vendors", nameColumn: "name", statusColumn: "status" },
    client: { table: "clients", nameColumn: "name" },
    stakeholder: { table: "stakeholders", nameColumn: "name" },
    asset: { table: "assets", nameColumn: "name", statusColumn: "status" },
    consumable: { table: "consumables", nameColumn: "name" },
    vehicle: { table: "vehicles", nameColumn: "name", statusColumn: "status" },
    purchase_order: { table: "purchase_orders", nameColumn: "description", statusColumn: "status" },
    invoice: { table: "invoices", nameColumn: "description", statusColumn: "status" },
    expense: { table: "production_expenses", nameColumn: "description", statusColumn: "status" },
    budget_line: { table: "production_budget_lines", nameColumn: "description" },
    shipment: { table: "shipments", nameColumn: "description", statusColumn: "status" },
    warehouse: { table: "warehouses", nameColumn: "name" },
    incident: { table: "incidents", nameColumn: "title", statusColumn: "status" },
    document: { table: "documents", nameColumn: "name", statusColumn: "status" },
    sop: { table: "sops", nameColumn: "title", statusColumn: "status" },
};

// ═══════════════════════════════════════════════════════════════
// RECORD LINK ROW TYPE
// ═══════════════════════════════════════════════════════════════

export interface RecordLinkRow {
    id: string;
    source_entity_type: string;
    source_entity_id: string;
    target_entity_type: string;
    target_entity_id: string;
    link_type: string;
    label: string | null;
    created_by: string | null;
    organization_id: string | null;
    created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// useRecordLinks — Fetch all links for a given record (bi-directional)
// ═══════════════════════════════════════════════════════════════

export function useRecordLinks(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["record_links", entityType, entityId],
        queryFn: async () => {
            // Fetch links where this record is the source
            const { data: asSource, error: sourceErr } = await fromTable("record_links")
                .select("*")
                .eq("source_entity_type", entityType)
                .eq("source_entity_id", entityId)
                .order("created_at", { ascending: false });
            if (sourceErr) throw sourceErr;

            // Fetch links where this record is the target
            const { data: asTarget, error: targetErr } = await fromTable("record_links")
                .select("*")
                .eq("target_entity_type", entityType)
                .eq("target_entity_id", entityId)
                .order("created_at", { ascending: false });
            if (targetErr) throw targetErr;

            const allLinks = [...(asSource ?? []), ...(asTarget ?? [])] as RecordLinkRow[];

            // Resolve linked record names by fetching from their respective tables
            const linkedRecords: LinkedRecord[] = [];

            for (const link of allLinks) {
                // Determine which side is the "other" record
                const isSource =
                    link.source_entity_type === entityType && link.source_entity_id === entityId;
                const otherType = isSource ? link.target_entity_type : link.source_entity_type;
                const otherId = isSource ? link.target_entity_id : link.source_entity_id;

                const config = ENTITY_TABLE_MAP[otherType];
                if (!config) {
                    linkedRecords.push({
                        id: otherId,
                        type: otherType as EntityType,
                        name: `${otherType} ${otherId.slice(0, 8)}`,
                        linkId: link.id,
                        linkType: link.link_type,
                        linkLabel: link.label ?? undefined,
                    });
                    continue;
                }

                try {
                    const selectCols = `id, ${config.nameColumn}${config.statusColumn ? `, ${config.statusColumn}` : ""}`;
                    const { data: record } = await fromTable(config.table)
                        .select(selectCols)
                        .eq("id", otherId)
                        .single();

                    if (record) {
                        const rec = record as Record<string, unknown>;
                        linkedRecords.push({
                            id: otherId,
                            type: otherType as EntityType,
                            name: String(
                                rec[config.nameColumn] ?? `${otherType} ${otherId.slice(0, 8)}`
                            ),
                            status: config.statusColumn
                                ? String(rec[config.statusColumn] ?? "")
                                : undefined,
                            linkId: link.id,
                            linkType: link.link_type,
                            linkLabel: link.label ?? undefined,
                        });
                    }
                } catch {
                    // If resolution fails, include a fallback entry
                    linkedRecords.push({
                        id: otherId,
                        type: otherType as EntityType,
                        name: `${otherType} ${otherId.slice(0, 8)}`,
                        linkId: link.id,
                        linkType: link.link_type,
                        linkLabel: link.label ?? undefined,
                    });
                }
            }

            return linkedRecords;
        },
        enabled: !!entityId,
    });
}

// ═══════════════════════════════════════════════════════════════
// useLinkRecords — Create a new link between two records
// ═══════════════════════════════════════════════════════════════

export interface LinkRecordsPayload {
    sourceEntityType: string;
    sourceEntityId: string;
    targetEntityType: string;
    targetEntityId: string;
    linkType?: string | undefined;
    label?: string | undefined;
}

export function useLinkRecords() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: LinkRecordsPayload) => {
            const { data, error } = await fromTable("record_links")
                .insert({
                    source_entity_type: payload.sourceEntityType,
                    source_entity_id: payload.sourceEntityId,
                    target_entity_type: payload.targetEntityType,
                    target_entity_id: payload.targetEntityId,
                    link_type: payload.linkType ?? "related",
                    label: payload.label ?? null,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            // Invalidate both sides of the link
            qc.invalidateQueries({
                queryKey: ["record_links", variables.sourceEntityType, variables.sourceEntityId],
            });
            qc.invalidateQueries({
                queryKey: ["record_links", variables.targetEntityType, variables.targetEntityId],
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// useUnlinkRecords — Delete an existing link
// ═══════════════════════════════════════════════════════════════

export function useUnlinkRecords() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (linkId: string) => {
            // First read the link to know which queries to invalidate
            const { data: link, error: readErr } = await fromTable("record_links")
                .select("*")
                .eq("id", linkId)
                .single();
            if (readErr) throw readErr;

            const { error } = await fromTable("record_links").delete().eq("id", linkId);
            if (error) throw error;

            return link as RecordLinkRow;
        },
        onSuccess: (link) => {
            if (link) {
                qc.invalidateQueries({
                    queryKey: ["record_links", link.source_entity_type, link.source_entity_id],
                });
                qc.invalidateQueries({
                    queryKey: ["record_links", link.target_entity_type, link.target_entity_id],
                });
            }
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// useSearchEntities — Search across an entity table for the picker
// ═══════════════════════════════════════════════════════════════

export interface EntitySearchResult {
    id: string;
    name: string;
    status?: string | undefined;
    entityType: EntityType;
}

export function useSearchEntities(entityType: string, query: string) {
    return useQuery({
        queryKey: ["entity_search", entityType, query],
        queryFn: async (): Promise<EntitySearchResult[]> => {
            const config = ENTITY_TABLE_MAP[entityType];
            if (!config) return [];

            const selectCols = `id, ${config.nameColumn}${config.statusColumn ? `, ${config.statusColumn}` : ""}`;
            const { data, error } = await fromTable(config.table)
                .select(selectCols)
                .ilike(config.nameColumn, `%${query}%`)
                .limit(20)
                .order(config.nameColumn, { ascending: true });
            if (error) throw error;

            return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
                id: String(row.id),
                name: String(row[config.nameColumn] ?? ""),
                status: config.statusColumn ? String(row[config.statusColumn] ?? "") : undefined,
                entityType: entityType as EntityType,
            }));
        },
        enabled: !!entityType && query.length >= 2,
        staleTime: 30_000,
    });
}

// ═══════════════════════════════════════════════════════════════
// ENTITY TABLE MAP EXPORT — for use by picker components
// ═══════════════════════════════════════════════════════════════

/** List of entity types that support search (have a table mapping). */
export const SEARCHABLE_ENTITY_TYPES = Object.keys(ENTITY_TABLE_MAP) as EntityType[];
