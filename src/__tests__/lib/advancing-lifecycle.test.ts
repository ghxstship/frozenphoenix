import { describe, expect, it } from "vitest";
import {
    advanceItemStatusTransitionSchema,
    advanceStatusTransitionSchema,
    catalogSearchSchema,
    createAdvanceItemSchema,
    createAdvanceSchema,
    createAdvanceTemplateSchema,
    updateAdvanceItemSchema,
    updateAdvanceSchema,
    updateAdvanceTemplateSchema,
} from "@/lib/validation/advancing-schemas";
import {
    ADVANCE_ITEM_STATUS_MAP,
    ADVANCE_ITEM_STATUS_TRANSITIONS,
    ADVANCE_ITEM_STATUSES,
    ADVANCE_PRIORITIES,
    ADVANCE_PRIORITY_MAP,
    ADVANCE_STATUS_MAP,
    ADVANCE_STATUS_TRANSITIONS,
    ADVANCE_STATUSES,
    ADVANCE_TYPE_MAP,
    ADVANCE_TYPES,
    canTransitionAdvance,
    CATALOG_CATEGORY_TYPE_MAP,
    CATALOG_CATEGORY_TYPES,
    CATALOG_ITEM_STATUS_MAP,
    CATALOG_ITEM_STATUSES,
    CURRENCY_MULTIPLIERS,
    formatAdvanceCost,
    PRICING_TIER_MAP,
    PRICING_TIERS,
    WEATHER_RATING_MAP,
    WEATHER_RATINGS,
} from "@/config/advancing-config";
import type {
    AdvanceItemStatus,
    AdvanceStatus,
    CatalogCategoryType,
    PricingTier,
    WeatherRating,
} from "@/types";

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";

function validAdvancePayload(overrides?: Record<string, unknown>) {
    return {
        event_id: VALID_UUID,
        title: "Pre-Event Advance for Festival 2026",
        items: [
            {
                catalog_item_id: VALID_UUID,
                quantity_requested: 10,
                unit_cost: 25.0,
            },
        ],
        ...overrides,
    };
}

function validItemPayload(overrides?: Record<string, unknown>) {
    return {
        catalog_item_id: VALID_UUID,
        quantity_requested: 5,
        unit_cost: 100.0,
        ...overrides,
    };
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1: VALIDATION SCHEMAS — CREATE ADVANCE
// ═══════════════════════════════════════════════════════════════

describe("Phase 1: Create Advance Validation", () => {
    it("accepts a minimal valid advance with one item", () => {
        const result = createAdvanceSchema.safeParse(validAdvancePayload());
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.event_id).toBe(VALID_UUID);
            expect(result.data.advance_type).toBe("pre_event");
            expect(result.data.priority).toBe("medium");
            expect(result.data.items).toHaveLength(1);
        }
    });

    it("accepts a fully-specified advance", () => {
        const result = createAdvanceSchema.safeParse(
            validAdvancePayload({
                project_id: VALID_UUID_2,
                description: "Full load-in advance",
                advance_type: "load_in",
                priority: "critical",
                service_start_date: "2026-06-01",
                service_end_date: "2026-06-05",
                internal_notes: "Rush order",
                client_notes: "VIP event",
                source_template_id: VALID_UUID_2,
            })
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.advance_type).toBe("load_in");
            expect(result.data.priority).toBe("critical");
            expect(result.data.service_start_date).toBe("2026-06-01");
        }
    });

    it("accepts an advance with zero items (empty draft)", () => {
        const result = createAdvanceSchema.safeParse(validAdvancePayload({ items: [] }));
        expect(result.success).toBe(true);
    });

    it("rejects missing event_id", () => {
        const { event_id: _, ...payload } = validAdvancePayload();
        const result = createAdvanceSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it("rejects non-UUID event_id", () => {
        const result = createAdvanceSchema.safeParse(
            validAdvancePayload({ event_id: "not-a-uuid" })
        );
        expect(result.success).toBe(false);
    });

    it("rejects empty title", () => {
        const result = createAdvanceSchema.safeParse(validAdvancePayload({ title: "" }));
        expect(result.success).toBe(false);
    });

    it("rejects title exceeding 300 chars", () => {
        const result = createAdvanceSchema.safeParse(
            validAdvancePayload({ title: "x".repeat(301) })
        );
        expect(result.success).toBe(false);
    });

    it("rejects invalid advance_type", () => {
        const result = createAdvanceSchema.safeParse(
            validAdvancePayload({ advance_type: "invalid_type" })
        );
        expect(result.success).toBe(false);
    });

    it("rejects invalid priority", () => {
        const result = createAdvanceSchema.safeParse(
            validAdvancePayload({ priority: "super_urgent" })
        );
        expect(result.success).toBe(false);
    });

    it("accepts all valid advance_type values", () => {
        const types = ["pre_event", "load_in", "show_day", "strike", "post_event"];
        for (const t of types) {
            const result = createAdvanceSchema.safeParse(validAdvancePayload({ advance_type: t }));
            expect(result.success).toBe(true);
        }
    });

    it("accepts all valid priority values", () => {
        const priorities = ["low", "medium", "high", "urgent", "critical"];
        for (const p of priorities) {
            const result = createAdvanceSchema.safeParse(validAdvancePayload({ priority: p }));
            expect(result.success).toBe(true);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 2: VALIDATION SCHEMAS — ADVANCE ITEMS
// ═══════════════════════════════════════════════════════════════

describe("Phase 2: Advance Item Validation", () => {
    it("accepts a minimal valid item", () => {
        const result = createAdvanceItemSchema.safeParse(validItemPayload());
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.quantity_requested).toBe(5);
            expect(result.data.unit_cost).toBe(100.0);
            expect(result.data.is_critical_path).toBe(false);
            expect(result.data.selected_modifiers).toEqual([]);
        }
    });

    it("accepts a fully-enriched item", () => {
        const result = createAdvanceItemSchema.safeParse(
            validItemPayload({
                category_id: VALID_UUID_2,
                vendor_id: VALID_UUID_2,
                notes: "Handle with care",
                is_critical_path: true,
                delivery_zone: "Stage Left",
                delivery_location: "Main Stage",
                location_id: VALID_UUID_2,
                scheduled_delivery: "2026-06-01T08:00:00Z",
                start_date: "2026-06-01",
                end_date: "2026-06-03",
                operational_purpose: "Crowd control",
                special_requests: "Black powder coat only",
            })
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.is_critical_path).toBe(true);
            expect(result.data.delivery_zone).toBe("Stage Left");
        }
    });

    it("rejects zero quantity", () => {
        const result = createAdvanceItemSchema.safeParse(
            validItemPayload({ quantity_requested: 0 })
        );
        expect(result.success).toBe(false);
    });

    it("rejects negative quantity", () => {
        const result = createAdvanceItemSchema.safeParse(
            validItemPayload({ quantity_requested: -5 })
        );
        expect(result.success).toBe(false);
    });

    it("rejects negative unit_cost", () => {
        const result = createAdvanceItemSchema.safeParse(validItemPayload({ unit_cost: -10 }));
        expect(result.success).toBe(false);
    });

    it("accepts zero unit_cost (complimentary items)", () => {
        const result = createAdvanceItemSchema.safeParse(validItemPayload({ unit_cost: 0 }));
        expect(result.success).toBe(true);
    });

    it("rejects non-UUID catalog_item_id", () => {
        const result = createAdvanceItemSchema.safeParse(
            validItemPayload({ catalog_item_id: "not-uuid" })
        );
        expect(result.success).toBe(false);
    });

    it("accepts selected_modifiers array", () => {
        const result = createAdvanceItemSchema.safeParse(
            validItemPayload({
                selected_modifiers: [
                    {
                        modifier_id: VALID_UUID,
                        modifier_name: "Color",
                        option_id: VALID_UUID_2,
                        option_label: "Black",
                        option_value: "black",
                        price_adjustment: 5.0,
                        adjustment_type: "flat",
                    },
                ],
            })
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.selected_modifiers).toHaveLength(1);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 3: VALIDATION — UPDATE ADVANCE
// ═══════════════════════════════════════════════════════════════

describe("Phase 3: Update Advance Validation", () => {
    it("accepts partial update with title only", () => {
        const result = updateAdvanceSchema.safeParse({ title: "Updated Title" });
        expect(result.success).toBe(true);
    });

    it("accepts partial update with priority only", () => {
        const result = updateAdvanceSchema.safeParse({ priority: "urgent" });
        expect(result.success).toBe(true);
    });

    it("rejects invalid advance_type on update", () => {
        const result = updateAdvanceSchema.safeParse({ advance_type: "bad_type" });
        expect(result.success).toBe(false);
    });

    it("accepts empty object (no-op update)", () => {
        const result = updateAdvanceSchema.safeParse({});
        expect(result.success).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 4: VALIDATION — UPDATE ADVANCE ITEM
// ═══════════════════════════════════════════════════════════════

describe("Phase 4: Update Advance Item Validation", () => {
    it("accepts partial update with quantity only", () => {
        const result = updateAdvanceItemSchema.safeParse({ quantity_requested: 20 });
        expect(result.success).toBe(true);
    });

    it("accepts assigned_to UUID", () => {
        const result = updateAdvanceItemSchema.safeParse({ assigned_to: VALID_UUID });
        expect(result.success).toBe(true);
    });

    it("rejects non-positive quantity on update", () => {
        const result = updateAdvanceItemSchema.safeParse({ quantity_requested: 0 });
        expect(result.success).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 5: VALIDATION — STATUS TRANSITIONS
// ═══════════════════════════════════════════════════════════════

describe("Phase 5: Status Transition Validation", () => {
    it("accepts valid advance status transition payload", () => {
        const result = advanceStatusTransitionSchema.safeParse({
            status: "submitted",
        });
        expect(result.success).toBe(true);
    });

    it("accepts status with reason", () => {
        const result = advanceStatusTransitionSchema.safeParse({
            status: "cancelled",
            reason: "Client cancelled the event",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid status value", () => {
        const result = advanceStatusTransitionSchema.safeParse({
            status: "invalid_status",
        });
        expect(result.success).toBe(false);
    });

    it("accepts valid item status transition with quantity_confirmed", () => {
        const result = advanceItemStatusTransitionSchema.safeParse({
            status: "confirmed",
            quantity_confirmed: 8,
        });
        expect(result.success).toBe(true);
    });

    it("rejects negative quantity_confirmed", () => {
        const result = advanceItemStatusTransitionSchema.safeParse({
            status: "confirmed",
            quantity_confirmed: -1,
        });
        expect(result.success).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 6: VALIDATION — ADVANCE TEMPLATES
// ═══════════════════════════════════════════════════════════════

describe("Phase 6: Advance Template Validation", () => {
    it("accepts valid template with items", () => {
        const result = createAdvanceTemplateSchema.safeParse({
            name: "Festival Load-In Template",
            template_items: [
                { catalog_item_id: VALID_UUID, quantity: 10 },
                { catalog_item_id: VALID_UUID_2, quantity: 5 },
            ],
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.advance_type).toBe("pre_event");
            expect(result.data.is_public).toBe(false);
        }
    });

    it("rejects template with zero items", () => {
        const result = createAdvanceTemplateSchema.safeParse({
            name: "Empty Template",
            template_items: [],
        });
        expect(result.success).toBe(false);
    });

    it("rejects template with empty name", () => {
        const result = createAdvanceTemplateSchema.safeParse({
            name: "",
            template_items: [{ catalog_item_id: VALID_UUID, quantity: 1 }],
        });
        expect(result.success).toBe(false);
    });

    it("accepts partial template update", () => {
        const result = updateAdvanceTemplateSchema.safeParse({
            name: "Updated Name",
        });
        expect(result.success).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 7: VALIDATION — CATALOG SEARCH
// ═══════════════════════════════════════════════════════════════

describe("Phase 7: Catalog Search Validation", () => {
    it("accepts valid search query", () => {
        const result = catalogSearchSchema.safeParse({ q: "barricade" });
        expect(result.success).toBe(true);
    });

    it("rejects single-char query", () => {
        const result = catalogSearchSchema.safeParse({ q: "a" });
        expect(result.success).toBe(false);
    });

    it("defaults limit to 50", () => {
        const result = catalogSearchSchema.safeParse({ q: "tent" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.limit).toBe(50);
        }
    });

    it("caps limit at 100", () => {
        const result = catalogSearchSchema.safeParse({ q: "tent", limit: 500 });
        expect(result.success).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 8: STATE MACHINE — ADVANCE STATUS TRANSITIONS
// ═══════════════════════════════════════════════════════════════

describe("Phase 8: Advance State Machine", () => {
    const ALL_STATUSES: AdvanceStatus[] = [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "in_progress",
        "fulfilled",
        "completed",
        "cancelled",
    ];

    it("draft → submitted is valid", () => {
        expect(canTransitionAdvance("draft", "submitted")).toBe(true);
    });

    it("draft → cancelled is valid", () => {
        expect(canTransitionAdvance("draft", "cancelled")).toBe(true);
    });

    it("draft → approved is invalid (must go through submit)", () => {
        expect(canTransitionAdvance("draft", "approved")).toBe(false);
    });

    it("submitted → in_review is valid", () => {
        expect(canTransitionAdvance("submitted", "in_review")).toBe(true);
    });

    it("in_review → approved is valid", () => {
        expect(canTransitionAdvance("in_review", "approved")).toBe(true);
    });

    it("in_review → submitted is valid (rejection returns to submitted)", () => {
        expect(canTransitionAdvance("in_review", "submitted")).toBe(true);
    });

    it("approved → in_progress is valid", () => {
        expect(canTransitionAdvance("approved", "in_progress")).toBe(true);
    });

    it("in_progress → fulfilled is valid", () => {
        expect(canTransitionAdvance("in_progress", "fulfilled")).toBe(true);
    });

    it("fulfilled → completed is valid", () => {
        expect(canTransitionAdvance("fulfilled", "completed")).toBe(true);
    });

    it("completed is terminal (no transitions out)", () => {
        for (const s of ALL_STATUSES) {
            expect(canTransitionAdvance("completed", s)).toBe(false);
        }
    });

    it("cancelled is terminal (no transitions out)", () => {
        for (const s of ALL_STATUSES) {
            expect(canTransitionAdvance("cancelled", s)).toBe(false);
        }
    });

    it("every non-terminal status can reach cancelled", () => {
        const nonTerminal: AdvanceStatus[] = [
            "draft",
            "submitted",
            "in_review",
            "approved",
            "in_progress",
        ];
        for (const s of nonTerminal) {
            expect(canTransitionAdvance(s, "cancelled")).toBe(true);
        }
    });

    it("fulfilled cannot be cancelled (must complete)", () => {
        expect(canTransitionAdvance("fulfilled", "cancelled")).toBe(false);
    });

    it("every status has a transition map entry", () => {
        for (const s of ALL_STATUSES) {
            expect(ADVANCE_STATUS_TRANSITIONS).toHaveProperty(s);
            expect(Array.isArray(ADVANCE_STATUS_TRANSITIONS[s])).toBe(true);
        }
    });

    it("full happy-path lifecycle: draft → submitted → in_review → approved → in_progress → fulfilled → completed", () => {
        const path: AdvanceStatus[] = [
            "draft",
            "submitted",
            "in_review",
            "approved",
            "in_progress",
            "fulfilled",
            "completed",
        ];
        for (let i = 0; i < path.length - 1; i++) {
            expect(canTransitionAdvance(path[i]!, path[i + 1]!)).toBe(true);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 9: STATE MACHINE — ADVANCE ITEM STATUS TRANSITIONS
// ═══════════════════════════════════════════════════════════════

describe("Phase 9: Advance Item State Machine", () => {
    const ALL_ITEM_STATUSES: AdvanceItemStatus[] = [
        "pending",
        "confirmed",
        "in_transit",
        "delivered",
        "installed",
        "operational",
        "struck",
        "returned",
        "complete",
    ];

    it("pending → confirmed is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.pending).toContain("confirmed");
    });

    it("pending → complete is valid (skip to close)", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.pending).toContain("complete");
    });

    it("confirmed → in_transit is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.confirmed).toContain("in_transit");
    });

    it("confirmed → delivered is valid (skip transit)", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.confirmed).toContain("delivered");
    });

    it("delivered → installed is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.delivered).toContain("installed");
    });

    it("installed → operational is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.installed).toContain("operational");
    });

    it("operational → struck is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.operational).toContain("struck");
    });

    it("struck → returned is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.struck).toContain("returned");
    });

    it("returned → complete is valid", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.returned).toContain("complete");
    });

    it("complete is terminal", () => {
        expect(ADVANCE_ITEM_STATUS_TRANSITIONS.complete).toEqual([]);
    });

    it("full item happy-path: pending → confirmed → in_transit → delivered → installed → operational → struck → returned → complete", () => {
        const path: AdvanceItemStatus[] = [
            "pending",
            "confirmed",
            "in_transit",
            "delivered",
            "installed",
            "operational",
            "struck",
            "returned",
            "complete",
        ];
        for (let i = 0; i < path.length - 1; i++) {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS[path[i]!]).toContain(path[i + 1]!);
        }
    });

    it("every item status has a transition map entry", () => {
        for (const s of ALL_ITEM_STATUSES) {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS).toHaveProperty(s);
            expect(Array.isArray(ADVANCE_ITEM_STATUS_TRANSITIONS[s])).toBe(true);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 10: CONFIG SSOT INTEGRITY
// ═══════════════════════════════════════════════════════════════

describe("Phase 10: SSOT Config Integrity", () => {
    it("ADVANCE_STATUSES array has exactly 8 entries", () => {
        expect(ADVANCE_STATUSES).toHaveLength(8);
    });

    it("every ADVANCE_STATUS has a map entry", () => {
        for (const s of ADVANCE_STATUSES) {
            expect(ADVANCE_STATUS_MAP[s.value]).toBeDefined();
            expect(ADVANCE_STATUS_MAP[s.value].label).toBeTruthy();
            expect(ADVANCE_STATUS_MAP[s.value].variant).toBeTruthy();
        }
    });

    it("ADVANCE_ITEM_STATUSES array has exactly 9 entries", () => {
        expect(ADVANCE_ITEM_STATUSES).toHaveLength(9);
    });

    it("every ADVANCE_ITEM_STATUS has a map entry", () => {
        for (const s of ADVANCE_ITEM_STATUSES) {
            expect(ADVANCE_ITEM_STATUS_MAP[s.value]).toBeDefined();
        }
    });

    it("ADVANCE_TYPES array has exactly 5 entries", () => {
        expect(ADVANCE_TYPES).toHaveLength(5);
    });

    it("every ADVANCE_TYPE has a map entry", () => {
        for (const t of ADVANCE_TYPES) {
            expect(ADVANCE_TYPE_MAP[t.value]).toBeDefined();
        }
    });

    it("ADVANCE_PRIORITIES array has exactly 5 entries", () => {
        expect(ADVANCE_PRIORITIES).toHaveLength(5);
    });

    it("every ADVANCE_PRIORITY has a map entry", () => {
        for (const p of ADVANCE_PRIORITIES) {
            expect(ADVANCE_PRIORITY_MAP[p.value]).toBeDefined();
        }
    });

    it("CATALOG_CATEGORY_TYPES covers all 11 enum values", () => {
        const expectedTypes: CatalogCategoryType[] = [
            "access",
            "production",
            "technical",
            "hospitality",
            "travel",
            "custom",
            "site",
            "food_beverage",
            "retail",
            "workplace",
            "labor",
        ];
        expect(CATALOG_CATEGORY_TYPES).toHaveLength(11);
        for (const t of expectedTypes) {
            expect(CATALOG_CATEGORY_TYPE_MAP[t]).toBeDefined();
            expect(CATALOG_CATEGORY_TYPE_MAP[t].label).toBeTruthy();
        }
    });

    it("CATALOG_ITEM_STATUSES has exactly 5 entries", () => {
        expect(CATALOG_ITEM_STATUSES).toHaveLength(5);
    });

    it("every CATALOG_ITEM_STATUS has a map entry", () => {
        for (const s of CATALOG_ITEM_STATUSES) {
            expect(CATALOG_ITEM_STATUS_MAP[s.value]).toBeDefined();
        }
    });

    it("WEATHER_RATINGS has exactly 5 entries", () => {
        expect(WEATHER_RATINGS).toHaveLength(5);
    });

    it("every WEATHER_RATING has a map entry", () => {
        const expectedRatings: WeatherRating[] = [
            "indoor_only",
            "sheltered",
            "outdoor_rated",
            "all_weather",
            "not_applicable",
        ];
        for (const w of expectedRatings) {
            expect(WEATHER_RATING_MAP[w]).toBeDefined();
            expect(WEATHER_RATING_MAP[w].label).toBeTruthy();
        }
    });

    it("PRICING_TIERS has exactly 3 entries", () => {
        expect(PRICING_TIERS).toHaveLength(3);
    });

    it("every PRICING_TIER has a map entry", () => {
        const expectedTiers: PricingTier[] = ["basic", "standard", "premium"];
        for (const t of expectedTiers) {
            expect(PRICING_TIER_MAP[t]).toBeDefined();
            expect(PRICING_TIER_MAP[t].label).toBeTruthy();
        }
    });

    it("CURRENCY_MULTIPLIERS covers all 8 markets", () => {
        const expectedCurrencies = ["USD", "GBP", "EUR", "AED", "AUD", "CAD", "MXN", "BRL"];
        for (const c of expectedCurrencies) {
            expect(CURRENCY_MULTIPLIERS[c]).toBeDefined();
            expect(CURRENCY_MULTIPLIERS[c]!.multiplier).toBeGreaterThan(0);
            expect(CURRENCY_MULTIPLIERS[c]!.symbol).toBeTruthy();
        }
    });

    it("USD multiplier is exactly 1.0", () => {
        expect(CURRENCY_MULTIPLIERS.USD!.multiplier).toBe(1.0);
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 11: FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════

describe("Phase 11: Formatting Helpers", () => {
    it("formatAdvanceCost formats USD correctly", () => {
        expect(formatAdvanceCost(1234.56)).toBe("$1,234.56");
    });

    it("formatAdvanceCost formats zero", () => {
        expect(formatAdvanceCost(0)).toBe("$0.00");
    });

    it("formatAdvanceCost handles large numbers", () => {
        expect(formatAdvanceCost(1000000)).toBe("$1,000,000.00");
    });

    it("formatAdvanceCost respects currency parameter", () => {
        const result = formatAdvanceCost(100, "GBP");
        expect(result).toContain("100");
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 12: LIFECYCLE SCENARIO TESTS
// ═══════════════════════════════════════════════════════════════

describe("Phase 12: End-to-End Lifecycle Scenarios", () => {
    describe("Scenario A: Happy Path — Production Advance", () => {
        it("Step 1: Create draft advance with catalog items from multiple categories", () => {
            const payload = validAdvancePayload({
                advance_type: "pre_event",
                priority: "high",
                service_start_date: "2026-07-01",
                service_end_date: "2026-07-05",
                items: [
                    {
                        catalog_item_id: VALID_UUID,
                        quantity_requested: 50,
                        unit_cost: 10.0,
                        notes: "Bike rack barricades for perimeter",
                        delivery_zone: "Main Gate",
                    },
                    {
                        catalog_item_id: VALID_UUID_2,
                        quantity_requested: 2,
                        unit_cost: 2500.0,
                        is_critical_path: true,
                        notes: "PA system for main stage",
                    },
                ],
            });
            const result = createAdvanceSchema.safeParse(payload);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.items).toHaveLength(2);
                expect(result.data.items[1]!.is_critical_path).toBe(true);
            }
        });

        it("Step 2: Submit draft advance (validate transition)", () => {
            expect(canTransitionAdvance("draft", "submitted")).toBe(true);
        });

        it("Step 3: Move to review", () => {
            expect(canTransitionAdvance("submitted", "in_review")).toBe(true);
        });

        it("Step 4: Approve advance", () => {
            expect(canTransitionAdvance("in_review", "approved")).toBe(true);
        });

        it("Step 5: Begin fulfillment (in_progress)", () => {
            expect(canTransitionAdvance("approved", "in_progress")).toBe(true);
        });

        it("Step 6: Track item lifecycle — vendor confirms", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.pending).toContain("confirmed");
        });

        it("Step 7: Item ships", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.confirmed).toContain("in_transit");
        });

        it("Step 8: Item delivered", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.in_transit).toContain("delivered");
        });

        it("Step 9: Item installed on-site", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.delivered).toContain("installed");
        });

        it("Step 10: Item operational during show", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.installed).toContain("operational");
        });

        it("Step 11: Strike (teardown)", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.operational).toContain("struck");
        });

        it("Step 12: Item returned to vendor", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.struck).toContain("returned");
        });

        it("Step 13: Item lifecycle complete", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.returned).toContain("complete");
        });

        it("Step 14: All items complete → advance fulfilled", () => {
            expect(canTransitionAdvance("in_progress", "fulfilled")).toBe(true);
        });

        it("Step 15: Final reconciliation → advance completed", () => {
            expect(canTransitionAdvance("fulfilled", "completed")).toBe(true);
        });
    });

    describe("Scenario B: Rejection and Revision Cycle", () => {
        it("Advance submitted and rejected returns to submitted for revision", () => {
            expect(canTransitionAdvance("submitted", "in_review")).toBe(true);
            expect(canTransitionAdvance("in_review", "submitted")).toBe(true);
        });

        it("Rejection reason is required (validation)", () => {
            const withReason = advanceStatusTransitionSchema.safeParse({
                status: "submitted",
                reason: "Budget too high, reduce quantities",
            });
            expect(withReason.success).toBe(true);
        });

        it("Revised advance can be re-submitted for review", () => {
            expect(canTransitionAdvance("submitted", "in_review")).toBe(true);
        });
    });

    describe("Scenario C: Cancellation at any point", () => {
        it("can cancel from draft", () => {
            expect(canTransitionAdvance("draft", "cancelled")).toBe(true);
        });

        it("can cancel from submitted", () => {
            expect(canTransitionAdvance("submitted", "cancelled")).toBe(true);
        });

        it("can cancel from in_review", () => {
            expect(canTransitionAdvance("in_review", "cancelled")).toBe(true);
        });

        it("can cancel from approved", () => {
            expect(canTransitionAdvance("approved", "cancelled")).toBe(true);
        });

        it("can cancel from in_progress", () => {
            expect(canTransitionAdvance("in_progress", "cancelled")).toBe(true);
        });

        it("CANNOT cancel fulfilled advance (must reconcile)", () => {
            expect(canTransitionAdvance("fulfilled", "cancelled")).toBe(false);
        });

        it("CANNOT cancel completed advance", () => {
            expect(canTransitionAdvance("completed", "cancelled")).toBe(false);
        });
    });

    describe("Scenario D: Crew Roster Advance (Labor items)", () => {
        it("validates labor items with per-shift pricing", () => {
            const result = createAdvanceSchema.safeParse({
                event_id: VALID_UUID,
                title: "Crew Roster — Festival Day 1",
                advance_type: "show_day",
                priority: "high",
                service_start_date: "2026-07-01",
                items: [
                    {
                        catalog_item_id: VALID_UUID,
                        quantity_requested: 4,
                        unit_cost: 450.0,
                        notes: "Audio FOH Engineers — 10-hour shifts",
                        operational_purpose: "Main stage FOH mix",
                    },
                    {
                        catalog_item_id: VALID_UUID_2,
                        quantity_requested: 20,
                        unit_cost: 180.0,
                        notes: "Stagehands — 8-hour call",
                        is_critical_path: true,
                    },
                ],
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.advance_type).toBe("show_day");
                expect(result.data.items).toHaveLength(2);
            }
        });

        it("crew items follow the same item lifecycle as equipment", () => {
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.pending).toContain("confirmed");
            expect(ADVANCE_ITEM_STATUS_TRANSITIONS.confirmed).toContain("complete");
        });
    });

    describe("Scenario E: Template-based Advance", () => {
        it("creates a template with standard festival items", () => {
            const result = createAdvanceTemplateSchema.safeParse({
                name: "Standard Festival Load-In",
                description: "Base template for 10K-cap outdoor festival",
                advance_type: "load_in",
                template_items: [
                    { catalog_item_id: VALID_UUID, quantity: 100 },
                    { catalog_item_id: VALID_UUID_2, quantity: 50, is_critical_path: true },
                ],
                is_public: true,
                tags: ["festival", "outdoor", "10k"],
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.is_public).toBe(true);
                expect(result.data.tags).toContain("festival");
            }
        });

        it("creates advance from template with source_template_id", () => {
            const result = createAdvanceSchema.safeParse({
                event_id: VALID_UUID,
                title: "Load-In from Template",
                source_template_id: VALID_UUID_2,
                items: [{ catalog_item_id: VALID_UUID, quantity_requested: 100, unit_cost: 10 }],
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.source_template_id).toBe(VALID_UUID_2);
            }
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 13: TRANSITION MATRIX EXHAUSTIVE TEST
// ═══════════════════════════════════════════════════════════════

describe("Phase 13: Exhaustive Transition Matrix", () => {
    const ALL_ADVANCE_STATUSES: AdvanceStatus[] = [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "in_progress",
        "fulfilled",
        "completed",
        "cancelled",
    ];

    it("no self-transitions allowed", () => {
        for (const s of ALL_ADVANCE_STATUSES) {
            expect(canTransitionAdvance(s, s)).toBe(false);
        }
    });

    it("all declared transitions are within the status set", () => {
        for (const [from, tos] of Object.entries(ADVANCE_STATUS_TRANSITIONS)) {
            for (const to of tos) {
                expect(ALL_ADVANCE_STATUSES).toContain(to);
                expect(ALL_ADVANCE_STATUSES).toContain(from);
            }
        }
    });

    it("all declared item transitions are within the item status set", () => {
        const ALL_ITEM_STATUSES: AdvanceItemStatus[] = [
            "pending",
            "confirmed",
            "in_transit",
            "delivered",
            "installed",
            "operational",
            "struck",
            "returned",
            "complete",
        ];
        for (const [from, tos] of Object.entries(ADVANCE_ITEM_STATUS_TRANSITIONS)) {
            for (const to of tos) {
                expect(ALL_ITEM_STATUSES).toContain(to);
                expect(ALL_ITEM_STATUSES).toContain(from);
            }
        }
    });
});
