"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./client";
import type {
    AdvanceListFilters,
    CatalogSearchFilters,
    CreateAdvanceItemRequest,
    CreateAdvanceRequest,
    UpdateAdvanceRequest,
} from "@/types";

// ═══════════════════════════════════════════════════════════════
// CATALOG CATEGORIES
// ═══════════════════════════════════════════════════════════════

export function useCatalogCategories(parentId?: string | null) {
    return useQuery({
        queryKey: ["catalog_categories", parentId],
        queryFn: async () => {
            let query = getSupabase()
                .from("catalog_categories")
                .select("*")
                .is("deleted_at", null)
                .order("sort_order", { ascending: true });

            if (parentId === null) {
                query = query.is("parent_id", null);
            } else if (parentId) {
                query = query.eq("parent_id", parentId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCatalogCategory(id: string) {
    return useQuery({
        queryKey: ["catalog_categories", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("catalog_categories")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// CATALOG ITEMS
// ═══════════════════════════════════════════════════════════════

export function useCatalogItems(filters?: CatalogSearchFilters) {
    return useQuery({
        queryKey: ["catalog_items", filters],
        queryFn: async () => {
            let query = getSupabase().from("catalog_items").select("*").is("deleted_at", null);

            if (filters?.category_id) query = query.eq("category_id", filters.category_id);
            if (filters?.category_type) {
                const { data: cats } = await getSupabase()
                    .from("catalog_categories")
                    .select("id")
                    .eq("category_type", filters.category_type);
                if (cats?.length) {
                    query = query.in(
                        "category_id",
                        cats.map((c: { id: string }) => c.id)
                    );
                }
            }
            if (filters?.status) query = query.eq("status", filters.status);
            if (filters?.is_critical_path !== undefined)
                query = query.eq("is_critical_path", filters.is_critical_path);
            if (filters?.tags?.length) query = query.overlaps("tags", filters.tags);
            if (filters?.min_cost !== undefined)
                query = query.gte("default_unit_cost", filters.min_cost);
            if (filters?.max_cost !== undefined)
                query = query.lte("default_unit_cost", filters.max_cost);

            const sortBy = filters?.sort_by ?? "sort_order";
            const sortOrder = filters?.sort_order ?? "asc";
            query = query.order(sortBy, { ascending: sortOrder === "asc" });

            if (filters?.per_page) {
                const page = filters.page ?? 1;
                const from = (page - 1) * filters.per_page;
                const to = from + filters.per_page - 1;
                query = query.range(from, to);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCatalogItemSearch(searchQuery: string) {
    return useQuery({
        queryKey: ["catalog_items", "search", searchQuery],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("catalog_items")
                .select("*")
                .is("deleted_at", null)
                .textSearch("search_vector", searchQuery, { type: "websearch" })
                .limit(50);
            if (error) throw error;
            return data;
        },
        enabled: searchQuery.length >= 2,
    });
}

export function useCatalogItem(id: string) {
    return useQuery({
        queryKey: ["catalog_items", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("catalog_items")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// CATALOG ITEM MODIFIERS + OPTIONS
// ═══════════════════════════════════════════════════════════════

export function useCatalogItemModifiers(catalogItemId: string) {
    return useQuery({
        queryKey: ["catalog_item_modifiers", catalogItemId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("catalog_item_modifiers")
                .select("*, catalog_modifier_options(*)")
                .eq("catalog_item_id", catalogItemId)
                .is("deleted_at", null)
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!catalogItemId,
    });
}

// ═══════════════════════════════════════════════════════════════
// CATALOG ORG OVERRIDES
// ═══════════════════════════════════════════════════════════════

export function useCatalogOrgOverrides(organizationId: string) {
    return useQuery({
        queryKey: ["catalog_org_overrides", organizationId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("catalog_org_overrides")
                .select("*")
                .eq("organization_id", organizationId)
                .is("deleted_at", null);
            if (error) throw error;
            return data;
        },
        enabled: !!organizationId,
    });
}

export function useCatalogOrgOverride(organizationId: string, catalogItemId: string) {
    return useQuery({
        queryKey: ["catalog_org_overrides", organizationId, catalogItemId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("catalog_org_overrides")
                .select("*")
                .eq("organization_id", organizationId)
                .eq("catalog_item_id", catalogItemId)
                .is("deleted_at", null)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!organizationId && !!catalogItemId,
    });
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION ADVANCES
// ═══════════════════════════════════════════════════════════════

export function useAdvances(filters?: AdvanceListFilters) {
    return useQuery({
        queryKey: ["production_advances", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("production_advances")
                .select(
                    `
                    *,
                    events:event_id(name),
                    projects:project_id(name),
                    submitted_by_profile:submitted_by(name, avatar_url),
                    point_of_contact_profile:point_of_contact(name, avatar_url),
                    approved_by_profile:approved_by(name)
                `
                )
                .is("deleted_at", null);

            if (filters?.status) {
                if (Array.isArray(filters.status)) {
                    query = query.in("status", filters.status);
                } else {
                    query = query.eq("status", filters.status);
                }
            }
            if (filters?.advance_type) query = query.eq("advance_type", filters.advance_type);
            if (filters?.priority) query = query.eq("priority", filters.priority);
            if (filters?.event_id) query = query.eq("event_id", filters.event_id);
            if (filters?.project_id) query = query.eq("project_id", filters.project_id);
            if (filters?.submitted_by) query = query.eq("submitted_by", filters.submitted_by);
            if (filters?.date_from) query = query.gte("created_at", filters.date_from);
            if (filters?.date_to) query = query.lte("created_at", filters.date_to);

            const sortBy = filters?.sort_by ?? "created_at";
            const sortOrder = filters?.sort_order ?? "desc";
            query = query.order(sortBy, { ascending: sortOrder === "asc" });

            if (filters?.per_page) {
                const page = filters.page ?? 1;
                const from = (page - 1) * filters.per_page;
                const to = from + filters.per_page - 1;
                query = query.range(from, to);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useAdvance(id: string) {
    return useQuery({
        queryKey: ["production_advances", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("production_advances")
                .select(
                    `
                    *,
                    events:event_id(name),
                    projects:project_id(name),
                    submitted_by_profile:submitted_by(name, avatar_url),
                    point_of_contact_profile:point_of_contact(name, avatar_url),
                    approved_by_profile:approved_by(name)
                `
                )
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateAdvance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: CreateAdvanceRequest) => {
            const { items, ...advanceData } = request;

            // Create the advance
            const { data: advance, error: advanceError } = await getSupabase()
                .from("production_advances")
                .insert({
                    event_id: advanceData.event_id,
                    project_id: advanceData.project_id,
                    title: advanceData.title,
                    description: advanceData.description,
                    advance_type: advanceData.advance_type,
                    priority: advanceData.priority ?? "medium",
                    service_start_date: advanceData.service_start_date,
                    service_end_date: advanceData.service_end_date,
                    internal_notes: advanceData.internal_notes,
                    client_notes: advanceData.client_notes,
                    source_template_id: advanceData.source_template_id,
                    submitted_by: (await getSupabase().auth.getUser()).data.user?.id,
                } as Record<string, unknown>)
                .select()
                .single();
            if (advanceError) throw advanceError;

            // Create line items
            if (items.length > 0) {
                const { error: itemsError } = await getSupabase()
                    .from("production_advance_items")
                    .insert(
                        items.map((item) => ({
                            advance_id: advance.id,
                            catalog_item_id: item.catalog_item_id,
                            category_id: item.category_id,
                            quantity_requested: item.quantity_requested,
                            unit_cost: item.unit_cost,
                            selected_modifiers: item.selected_modifiers ?? [],
                            item_specifications: item.item_specifications ?? {},
                            vendor_id: item.vendor_id,
                            notes: item.notes,
                            is_critical_path: item.is_critical_path ?? false,
                            delivery_zone: item.delivery_zone,
                            delivery_location: item.delivery_location,
                            location_id: item.location_id,
                            scheduled_delivery: item.scheduled_delivery,
                            start_date: item.start_date,
                            end_date: item.end_date,
                            operational_purpose: item.operational_purpose,
                            special_requests: item.special_requests,
                        })) as Record<string, unknown>[]
                    );
                if (itemsError) throw itemsError;
            }

            return advance;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
        },
    });
}

export function useUpdateAdvance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateAdvanceRequest & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("production_advances")
                .update(updates as Record<string, unknown>)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
            queryClient.invalidateQueries({ queryKey: ["production_advances", variables.id] });
        },
    });
}

export function useDeleteAdvance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("production_advances")
                .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE STATUS TRANSITIONS
// ═══════════════════════════════════════════════════════════════

export function useAdvanceStatusTransition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            status,
            reason,
        }: {
            id: string;
            status: string;
            reason?: string;
        }) => {
            const { data, error } = await getSupabase()
                .from("production_advances")
                .update({ status } as Record<string, unknown>)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;

            // Reason logged via separate history insert if needed
            if (reason) {
                await getSupabase()
                    .from("advance_status_history")
                    .update({ reason } as Record<string, unknown>)
                    .eq("entity_id", id)
                    .eq("to_status", status)
                    .order("created_at", { ascending: false })
                    .limit(1);
            }

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
            queryClient.invalidateQueries({ queryKey: ["production_advances", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["advance_status_history", variables.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE ITEMS
// ═══════════════════════════════════════════════════════════════

export function useAdvanceItems(advanceId: string) {
    return useQuery({
        queryKey: ["production_advance_items", advanceId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("production_advance_items")
                .select(
                    `
                    *,
                    catalog_items:catalog_item_id(name, sku, thumbnail_url),
                    catalog_categories:category_id(name, slug, category_type),
                    locations:location_id(name),
                    vendors:vendor_id(name),
                    assigned_to_profile:assigned_to(name)
                `
                )
                .eq("advance_id", advanceId)
                .is("deleted_at", null)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!advanceId,
    });
}

export function useCreateAdvanceItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: CreateAdvanceItemRequest & { advance_id: string }) => {
            const { data, error } = await getSupabase()
                .from("production_advance_items")
                .insert({
                    advance_id: item.advance_id,
                    catalog_item_id: item.catalog_item_id,
                    category_id: item.category_id,
                    quantity_requested: item.quantity_requested,
                    unit_cost: item.unit_cost,
                    selected_modifiers: item.selected_modifiers ?? [],
                    item_specifications: item.item_specifications ?? {},
                    vendor_id: item.vendor_id,
                    notes: item.notes,
                    is_critical_path: item.is_critical_path ?? false,
                    delivery_zone: item.delivery_zone,
                    delivery_location: item.delivery_location,
                    location_id: item.location_id,
                    scheduled_delivery: item.scheduled_delivery,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    operational_purpose: item.operational_purpose,
                    special_requests: item.special_requests,
                } as Record<string, unknown>)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            const advanceId = (data as Record<string, unknown>).advance_id as string;
            queryClient.invalidateQueries({ queryKey: ["production_advance_items", advanceId] });
            queryClient.invalidateQueries({ queryKey: ["production_advances", advanceId] });
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
        },
    });
}

export function useUpdateAdvanceItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            advance_id,
            ...updates
        }: Record<string, unknown> & { id: string; advance_id: string }) => {
            const { data, error } = await getSupabase()
                .from("production_advance_items")
                .update(updates as Record<string, unknown>)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return { ...data, advance_id };
        },
        onSuccess: (result) => {
            const advanceId = (result as Record<string, unknown>).advance_id as string;
            queryClient.invalidateQueries({ queryKey: ["production_advance_items", advanceId] });
            queryClient.invalidateQueries({ queryKey: ["production_advances", advanceId] });
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
        },
    });
}

export function useDeleteAdvanceItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, advance_id }: { id: string; advance_id: string }) => {
            const { error } = await getSupabase()
                .from("production_advance_items")
                .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
                .eq("id", id);
            if (error) throw error;
            return { advance_id };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({
                queryKey: ["production_advance_items", result.advance_id],
            });
            queryClient.invalidateQueries({ queryKey: ["production_advances", result.advance_id] });
            queryClient.invalidateQueries({ queryKey: ["production_advances"] });
        },
    });
}

export function useAdvanceItemStatusTransition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            advance_id,
            status,
            quantity_confirmed,
        }: {
            id: string;
            advance_id: string;
            status: string;
            quantity_confirmed?: number;
        }) => {
            const updates: Record<string, unknown> = { status };
            if (quantity_confirmed !== undefined) updates.quantity_confirmed = quantity_confirmed;

            const { data, error } = await getSupabase()
                .from("production_advance_items")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return { ...data, advance_id };
        },
        onSuccess: (result) => {
            const advanceId = (result as Record<string, unknown>).advance_id as string;
            queryClient.invalidateQueries({ queryKey: ["production_advance_items", advanceId] });
            queryClient.invalidateQueries({ queryKey: ["production_advances", advanceId] });
            queryClient.invalidateQueries({ queryKey: ["advance_status_history"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE STATUS HISTORY
// ═══════════════════════════════════════════════════════════════

export function useAdvanceStatusHistory(entityType: "advance" | "advance_item", entityId: string) {
    return useQuery({
        queryKey: ["advance_status_history", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("advance_status_history")
                .select("*")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!entityId,
    });
}

// ═══════════════════════════════════════════════════════════════
// ADVANCE TEMPLATES
// ═══════════════════════════════════════════════════════════════

export function useAdvanceTemplates(organizationId?: string) {
    return useQuery({
        queryKey: ["advance_templates", organizationId],
        queryFn: async () => {
            let query = getSupabase()
                .from("advance_templates")
                .select("*")
                .is("deleted_at", null)
                .order("use_count", { ascending: false });

            if (organizationId) query = query.eq("organization_id", organizationId);

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useAdvanceTemplate(id: string) {
    return useQuery({
        queryKey: ["advance_templates", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("advance_templates")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateAdvanceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: Record<string, unknown>) => {
            const { data, error } = await getSupabase()
                .from("advance_templates")
                .insert(template)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advance_templates"] });
        },
    });
}

export function useUpdateAdvanceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Record<string, unknown> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("advance_templates")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["advance_templates"] });
            queryClient.invalidateQueries({ queryKey: ["advance_templates", variables.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// FULFILLMENT — Item Status Transitions
// ═══════════════════════════════════════════════════════════════

export function useUpdateAdvanceItemStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            advanceId,
            itemId,
            status,
            quantity_confirmed,
        }: {
            advanceId: string;
            itemId: string;
            status: string;
            quantity_confirmed?: number;
        }) => {
            const res = await fetch(`/api/advancing/${advanceId}/items/${itemId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, quantity_confirmed }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    (err as Record<string, Record<string, string>>)?.error?.message ??
                        "Failed to update item status"
                );
            }
            return res.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["advances"] });
            queryClient.invalidateQueries({ queryKey: ["advances", variables.advanceId] });
            queryClient.invalidateQueries({ queryKey: ["advance_items", variables.advanceId] });
        },
    });
}

export function useDeleteAdvanceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("advance_templates")
                .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advance_templates"] });
        },
    });
}
