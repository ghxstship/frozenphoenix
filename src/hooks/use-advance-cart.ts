"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdvanceCartItem, AdvanceCartState } from "@/types";

interface AdvanceCartStore extends AdvanceCartState {
    addItem: (item: AdvanceCartItem) => void;
    removeItem: (catalogItemId: string) => void;
    updateItemQuantity: (catalogItemId: string, quantity: number) => void;
    updateItemModifiers: (
        catalogItemId: string,
        modifiers: AdvanceCartItem["selected_modifiers"]
    ) => void;
    updateItemNotes: (catalogItemId: string, notes: string) => void;
    updateItemCriticalPath: (catalogItemId: string, isCritical: boolean) => void;
    updateItemDelivery: (
        catalogItemId: string,
        delivery: {
            delivery_zone?: string | undefined;
            delivery_location?: string | undefined;
            location_id?: string | undefined;
            scheduled_delivery?: string | undefined;
        }
    ) => void;
    updateItemDates: (
        catalogItemId: string,
        dates: {
            start_date?: string | undefined;
            end_date?: string | undefined;
        }
    ) => void;
    updateItemEnrichment: (
        catalogItemId: string,
        enrichment: {
            category_id?: string | undefined;
            item_specifications?: Record<string, unknown> | undefined;
            operational_purpose?: string | undefined;
            special_requests?: string | undefined;
        }
    ) => void;
    setEventId: (eventId: string) => void;
    setProjectId: (projectId: string | undefined) => void;
    setAdvanceType: (advanceType: AdvanceCartState["advance_type"]) => void;
    setPriority: (priority: AdvanceCartState["priority"]) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setServiceDates: (start?: string, end?: string) => void;
    setSourceTemplateId: (templateId: string | undefined) => void;
    clearCart: () => void;
    loadFromTemplate: (items: AdvanceCartItem[], metadata?: Partial<AdvanceCartState>) => void;
}

function computeTotals(items: AdvanceCartItem[]) {
    const total_estimated_cost = items.reduce((sum, item) => {
        const modifierCost = (item.selected_modifiers ?? []).reduce((ms, m) => {
            if (m.adjustment_type === "flat") return ms + m.price_adjustment;
            if (m.adjustment_type === "per_unit") return ms + m.price_adjustment * item.quantity;
            if (m.adjustment_type === "percentage")
                return ms + item.unit_cost * item.quantity * (m.price_adjustment / 100);
            return ms;
        }, 0);
        return sum + item.unit_cost * item.quantity + modifierCost;
    }, 0);

    return {
        total_items: items.length,
        total_estimated_cost,
    };
}

const INITIAL_STATE: AdvanceCartState = {
    items: [],
    event_id: "",
    project_id: undefined,
    advance_type: "pre_event",
    priority: "medium",
    title: "",
    description: "",
    total_items: 0,
    total_estimated_cost: 0,
};

export const useAdvanceCart = create<AdvanceCartStore>()(
    persist(
        (set) => ({
            ...INITIAL_STATE,

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.catalog_item_id === item.catalog_item_id
                    );
                    let items: AdvanceCartItem[];
                    if (existing) {
                        items = state.items.map((i) =>
                            i.catalog_item_id === item.catalog_item_id
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        );
                    } else {
                        items = [...state.items, item];
                    }
                    return { items, ...computeTotals(items) };
                }),

            removeItem: (catalogItemId) =>
                set((state) => {
                    const items = state.items.filter((i) => i.catalog_item_id !== catalogItemId);
                    return { items, ...computeTotals(items) };
                }),

            updateItemQuantity: (catalogItemId, quantity) =>
                set((state) => {
                    if (quantity < 1) return state;
                    const items = state.items.map((i) =>
                        i.catalog_item_id === catalogItemId ? { ...i, quantity } : i
                    );
                    return { items, ...computeTotals(items) };
                }),

            updateItemModifiers: (catalogItemId, modifiers) =>
                set((state) => {
                    const items = state.items.map((i) =>
                        i.catalog_item_id === catalogItemId
                            ? { ...i, selected_modifiers: modifiers }
                            : i
                    );
                    return { items, ...computeTotals(items) };
                }),

            updateItemNotes: (catalogItemId, notes) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.catalog_item_id === catalogItemId ? { ...i, notes } : i
                    ),
                })),

            updateItemCriticalPath: (catalogItemId, is_critical_path) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.catalog_item_id === catalogItemId ? { ...i, is_critical_path } : i
                    ),
                })),

            updateItemDelivery: (catalogItemId, delivery) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.catalog_item_id === catalogItemId ? { ...i, ...delivery } : i
                    ),
                })),

            updateItemDates: (catalogItemId, dates) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.catalog_item_id === catalogItemId ? { ...i, ...dates } : i
                    ),
                })),

            updateItemEnrichment: (catalogItemId, enrichment) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.catalog_item_id === catalogItemId ? { ...i, ...enrichment } : i
                    ),
                })),

            setEventId: (event_id) => set({ event_id }),
            setProjectId: (project_id) => set({ project_id }),
            setAdvanceType: (advance_type) => set({ advance_type }),
            setPriority: (priority) => set({ priority }),
            setTitle: (title) => set({ title }),
            setDescription: (description) => set({ description }),
            setServiceDates: (service_start_date, service_end_date) =>
                set({ service_start_date, service_end_date }),
            setSourceTemplateId: (source_template_id) => set({ source_template_id }),

            clearCart: () => set(INITIAL_STATE),

            loadFromTemplate: (items, metadata) =>
                set({
                    items,
                    ...computeTotals(items),
                    ...(metadata ?? {}),
                }),
        }),
        {
            name: "advance-cart",
            partialize: (state) => ({
                items: state.items,
                event_id: state.event_id,
                project_id: state.project_id,
                advance_type: state.advance_type,
                priority: state.priority,
                title: state.title,
                description: state.description,
                service_start_date: state.service_start_date,
                service_end_date: state.service_end_date,
                source_template_id: state.source_template_id,
                total_items: state.total_items,
                total_estimated_cost: state.total_estimated_cost,
            }),
        }
    )
);
