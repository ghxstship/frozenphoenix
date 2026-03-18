import { describe, expect, it } from "vitest";
import { assetCreateSchema } from "@/lib/validation/schemas";
import {
    ASSET_MACHINE,
    getMachineForEntity,
    RENTAL_AGREEMENT_MACHINE,
    SHIPMENT_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const MEMBER: TransitionContext = { userRole: "member" };

describe("Asset Validation", () => {
    it("accepts valid asset", () => {
        const r = assetCreateSchema.safeParse({ name: "Line Array Speaker", category: "Audio" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.condition).toBe("good");
            expect(r.data.owned_or_rental).toBe("owned");
        }
    });
    it("rejects empty name", () => {
        expect(assetCreateSchema.safeParse({ name: "", category: "X" }).success).toBe(false);
    });
    it("accepts all conditions", () => {
        for (const c of ["new", "good", "fair", "poor", "damaged", "decommissioned"]) {
            expect(
                assetCreateSchema.safeParse({ name: "X", category: "X", condition: c }).success
            ).toBe(true);
        }
    });
    it("rejects negative purchase_price", () => {
        expect(
            assetCreateSchema.safeParse({ name: "X", category: "X", purchase_price: -1 }).success
        ).toBe(false);
    });
});

describe("Asset State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("asset")).toBe(ASSET_MACHINE);
    });
    it("has 9 states", () => {
        expect(ASSET_MACHINE.states).toHaveLength(9);
    });
    it("decommissioned and lost are terminal", () => {
        expect(isTerminalState(ASSET_MACHINE, "decommissioned")).toBe(true);
        expect(isTerminalState(ASSET_MACHINE, "lost")).toBe(true);
    });
    it("happy path: available→reserved→checked_out→in_transit→deployed→in_transit→available", () => {
        expect(validateTransition(ASSET_MACHINE, "available", "reserved", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(ASSET_MACHINE, "reserved", "checked_out", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(ASSET_MACHINE, "checked_out", "in_transit", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(ASSET_MACHINE, "in_transit", "deployed", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(ASSET_MACHINE, "deployed", "in_transit", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(ASSET_MACHINE, "in_transit", "available", MEMBER).allowed).toBe(
            true
        );
    });
    it("maintenance cycle: available→needs_repair→in_maintenance→available", () => {
        expect(validateTransition(ASSET_MACHINE, "available", "needs_repair", MEMBER).allowed).toBe(
            true
        );
        expect(
            validateTransition(ASSET_MACHINE, "needs_repair", "in_maintenance", PM).allowed
        ).toBe(true);
        expect(validateTransition(ASSET_MACHINE, "in_maintenance", "available", PM).allowed).toBe(
            true
        );
    });
    it("decommission from maintenance", () => {
        expect(
            validateTransition(ASSET_MACHINE, "in_maintenance", "decommissioned", EXEC).allowed
        ).toBe(true);
    });
    it("mark lost from field states", () => {
        for (const s of ["checked_out", "in_transit", "deployed"] as const) {
            expect(validateTransition(ASSET_MACHINE, s, "lost", PM).allowed).toBe(true);
        }
    });
    it("release reservation: reserved→available", () => {
        expect(validateTransition(ASSET_MACHINE, "reserved", "available", MEMBER).allowed).toBe(
            true
        );
    });
    it("flag repair from deployed", () => {
        expect(validateTransition(ASSET_MACHINE, "deployed", "needs_repair", MEMBER).allowed).toBe(
            true
        );
    });
});

describe("Shipment State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("shipment")).toBe(SHIPMENT_MACHINE);
    });
    it("delivered, returned, cancelled are terminal", () => {
        expect(isTerminalState(SHIPMENT_MACHINE, "delivered")).toBe(true);
        expect(isTerminalState(SHIPMENT_MACHINE, "returned")).toBe(true);
        expect(isTerminalState(SHIPMENT_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: draft→booked→picked_up→in_transit→out_for_delivery→delivered", () => {
        expect(validateTransition(SHIPMENT_MACHINE, "draft", "booked", MEMBER).allowed).toBe(true);
        expect(validateTransition(SHIPMENT_MACHINE, "booked", "picked_up", MEMBER).allowed).toBe(
            true
        );
        expect(
            validateTransition(SHIPMENT_MACHINE, "picked_up", "in_transit", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(SHIPMENT_MACHINE, "in_transit", "out_for_delivery", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(SHIPMENT_MACHINE, "out_for_delivery", "delivered", MEMBER).allowed
        ).toBe(true);
    });
    it("customs detour: in_transit→at_customs→in_transit", () => {
        expect(validateTransition(SHIPMENT_MACHINE, "in_transit", "at_customs", PM).allowed).toBe(
            true
        );
        expect(validateTransition(SHIPMENT_MACHINE, "at_customs", "in_transit", PM).allowed).toBe(
            true
        );
    });
    it("return: delivered→returned", () => {
        expect(validateTransition(SHIPMENT_MACHINE, "delivered", "returned", PM).allowed).toBe(
            true
        );
    });
    it("delivered triggers notifications", () => {
        const r = validateTransition(SHIPMENT_MACHINE, "out_for_delivery", "delivered", MEMBER);
        expect(r.sideEffects).toContain("notifyRecipient");
        expect(r.sideEffects).toContain("updateInventory");
    });
});

describe("Rental Agreement State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("rental_agreement")).toBe(RENTAL_AGREEMENT_MACHINE);
    });
    it("returned and cancelled are terminal", () => {
        expect(isTerminalState(RENTAL_AGREEMENT_MACHINE, "returned")).toBe(true);
        expect(isTerminalState(RENTAL_AGREEMENT_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: draft→pending_approval→approved→active→returned", () => {
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "draft", "pending_approval", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "pending_approval", "approved", EXEC)
                .allowed
        ).toBe(true);
        expect(validateTransition(RENTAL_AGREEMENT_MACHINE, "approved", "active", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "active", "returned", MEMBER).allowed
        ).toBe(true);
    });
    it("extension: active→extended→active", () => {
        expect(validateTransition(RENTAL_AGREEMENT_MACHINE, "active", "extended", PM).allowed).toBe(
            true
        );
        expect(validateTransition(RENTAL_AGREEMENT_MACHINE, "extended", "active", PM).allowed).toBe(
            true
        );
    });
    it("overdue: active→overdue→returned", () => {
        expect(validateTransition(RENTAL_AGREEMENT_MACHINE, "active", "overdue", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "overdue", "returned", MEMBER).allowed
        ).toBe(true);
    });
});

describe("E2E: Asset Lifecycle", () => {
    it("Scenario: Procure→warehouse→deploy→strike→return→audit", () => {
        expect(validateTransition(ASSET_MACHINE, "available", "reserved", PM).allowed).toBe(true);
        expect(validateTransition(ASSET_MACHINE, "reserved", "checked_out", PM).allowed).toBe(true);
        expect(validateTransition(ASSET_MACHINE, "checked_out", "in_transit", PM).allowed).toBe(
            true
        );
        expect(validateTransition(SHIPMENT_MACHINE, "draft", "booked", PM).allowed).toBe(true);
        expect(validateTransition(ASSET_MACHINE, "in_transit", "deployed", PM).allowed).toBe(true);
        expect(validateTransition(ASSET_MACHINE, "deployed", "in_transit", PM).allowed).toBe(true);
        expect(validateTransition(ASSET_MACHINE, "in_transit", "available", PM).allowed).toBe(true);
    });
});
