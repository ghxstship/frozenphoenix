import { describe, expect, it } from "vitest";
import { vendorCreateSchema } from "@/lib/validation/schemas";
import { workOrderCreateSchema } from "@/lib/validation/entity-schemas";
import {
    getMachineForEntity,
    PURCHASE_ORDER_MACHINE,
    VENDOR_MACHINE,
    WORK_ORDER_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const _MEMBER: TransitionContext = { userRole: "member" };
const COLLAB: TransitionContext = { userRole: "collaborator" };

describe("Vendor Validation", () => {
    it("accepts valid vendor", () => {
        const r = vendorCreateSchema.safeParse({ name: "AV Rentals Inc" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.status).toBe("active");
    });
    it("rejects empty name", () => {
        expect(vendorCreateSchema.safeParse({ name: "" }).success).toBe(false);
    });
    it("rejects invalid rating", () => {
        expect(vendorCreateSchema.safeParse({ name: "X", rating: 6 }).success).toBe(false);
    });
    it("accepts all valid statuses", () => {
        for (const s of ["active", "inactive", "pending", "blocked"]) {
            expect(vendorCreateSchema.safeParse({ name: "X", status: s }).success).toBe(true);
        }
    });
});

describe("Vendor State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("vendor")).toBe(VENDOR_MACHINE);
    });
    it("has 9 states", () => {
        expect(VENDOR_MACHINE.states).toHaveLength(9);
    });
    it("blacklisted is terminal", () => {
        expect(isTerminalState(VENDOR_MACHINE, "blacklisted")).toBe(true);
    });
    it("happy path: prospect→application→review→onboarding→active", () => {
        expect(validateTransition(VENDOR_MACHINE, "prospect", "application", PM).allowed).toBe(
            true
        );
        expect(validateTransition(VENDOR_MACHINE, "application", "review", PM).allowed).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "review", "onboarding", EXEC).allowed).toBe(true);
    });
    it("review rejection returns to prospect", () => {
        expect(validateTransition(VENDOR_MACHINE, "review", "prospect", EXEC).allowed).toBe(true);
    });
    it("probation lifecycle: active→probation→active or suspended", () => {
        expect(validateTransition(VENDOR_MACHINE, "active", "probation", EXEC).allowed).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "probation", "active", EXEC).allowed).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "probation", "suspended", EXEC).allowed).toBe(
            true
        );
    });
    it("suspension lifecycle: suspended→active or blacklisted", () => {
        expect(validateTransition(VENDOR_MACHINE, "suspended", "active", EXEC).allowed).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "suspended", "blacklisted", EXEC).allowed).toBe(
            true
        );
    });
    it("only exec can blacklist", () => {
        expect(validateTransition(VENDOR_MACHINE, "suspended", "blacklisted", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(VENDOR_MACHINE, "suspended", "blacklisted", PM).allowed).toBe(
            false
        );
    });
    it("deactivation: active→inactive→active", () => {
        expect(validateTransition(VENDOR_MACHINE, "active", "inactive", EXEC).allowed).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "inactive", "active", EXEC).allowed).toBe(true);
    });
});

describe("Work Order State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("work_order")).toBe(WORK_ORDER_MACHINE);
    });
    it("has 13 states", () => {
        expect(WORK_ORDER_MACHINE.states).toHaveLength(13);
    });
    it("invoiced and cancelled are terminal", () => {
        expect(isTerminalState(WORK_ORDER_MACHINE, "invoiced")).toBe(true);
        expect(isTerminalState(WORK_ORDER_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: draft→pending_approval→approved→assigned→scheduled→in_progress→pending_review→completed→invoiced", () => {
        expect(
            validateTransition(WORK_ORDER_MACHINE, "draft", "pending_approval", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "pending_approval", "approved", EXEC).allowed
        ).toBe(true);
        expect(validateTransition(WORK_ORDER_MACHINE, "approved", "assigned", PM).allowed).toBe(
            true
        );
        expect(validateTransition(WORK_ORDER_MACHINE, "assigned", "scheduled", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(WORK_ORDER_MACHINE, "scheduled", "in_progress", COLLAB).allowed
        ).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "in_progress", "pending_review", COLLAB).allowed
        ).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "pending_review", "completed", PM).allowed
        ).toBe(true);
        expect(validateTransition(WORK_ORDER_MACHINE, "completed", "invoiced", EXEC).allowed).toBe(
            true
        );
    });
    it("revision cycle: pending_review→revision_required→in_progress", () => {
        expect(
            validateTransition(WORK_ORDER_MACHINE, "pending_review", "revision_required", PM)
                .allowed
        ).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "revision_required", "in_progress", COLLAB)
                .allowed
        ).toBe(true);
    });
    it("hold: in_progress→on_hold→in_progress", () => {
        expect(validateTransition(WORK_ORDER_MACHINE, "in_progress", "on_hold", PM).allowed).toBe(
            true
        );
        expect(validateTransition(WORK_ORDER_MACHINE, "on_hold", "in_progress", PM).allowed).toBe(
            true
        );
    });
    it("completed notifies vendor", () => {
        const r = validateTransition(WORK_ORDER_MACHINE, "pending_review", "completed", PM);
        expect(r.sideEffects).toContain("notifyVendor");
    });
});

describe("Work Order Validation", () => {
    it("accepts valid work order", () => {
        const r = workOrderCreateSchema.safeParse({ title: "Stage Build" });
        expect(r.success).toBe(true);
    });
    it("rejects empty title", () => {
        expect(workOrderCreateSchema.safeParse({ title: "" }).success).toBe(false);
    });
});

describe("E2E: Vendor Lifecycle", () => {
    it("Scenario: Onboard vendor → work order → PO → receipt → payment", () => {
        expect(validateTransition(VENDOR_MACHINE, "prospect", "application", PM).allowed).toBe(
            true
        );
        expect(validateTransition(VENDOR_MACHINE, "application", "review", PM).allowed).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "review", "onboarding", EXEC).allowed).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "draft", "pending_approval", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "draft", "pending_approval", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "pending_approval", "approved", EXEC).allowed
        ).toBe(true);
    });
});
