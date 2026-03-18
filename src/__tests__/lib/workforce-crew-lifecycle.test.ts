import { describe, expect, it } from "vitest";
import { crewCreateSchema } from "@/lib/validation/schemas";
import { CREW_SHIFT_MACHINE, getMachineForEntity, TIME_ENTRY_MACHINE } from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const MEMBER: TransitionContext = { userRole: "member" };

describe("Crew Validation", () => {
    it("accepts valid crew member", () => {
        const r = crewCreateSchema.safeParse({
            name: "Jane Doe",
            email: "jane@example.com",
            role: "Audio Tech",
        });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.status).toBe("available");
    });
    it("rejects empty name", () => {
        expect(crewCreateSchema.safeParse({ name: "", email: "x@x.com", role: "X" }).success).toBe(
            false
        );
    });
    it("rejects invalid email", () => {
        expect(crewCreateSchema.safeParse({ name: "X", email: "bad", role: "X" }).success).toBe(
            false
        );
    });
    it("rejects negative hourly_rate", () => {
        expect(
            crewCreateSchema.safeParse({ name: "X", email: "x@x.com", role: "X", hourly_rate: -1 })
                .success
        ).toBe(false);
    });
    it("accepts all valid statuses", () => {
        for (const s of ["available", "on_project", "unavailable", "on_leave"]) {
            expect(
                crewCreateSchema.safeParse({ name: "X", email: "x@x.com", role: "X", status: s })
                    .success
            ).toBe(true);
        }
    });
});

describe("Crew Shift State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("crew_shift")).toBe(CREW_SHIFT_MACHINE);
    });
    it("has 7 states", () => {
        expect(CREW_SHIFT_MACHINE.states).toHaveLength(7);
    });
    it("checked_out, no_show, cancelled are terminal", () => {
        expect(isTerminalState(CREW_SHIFT_MACHINE, "checked_out")).toBe(true);
        expect(isTerminalState(CREW_SHIFT_MACHINE, "no_show")).toBe(true);
        expect(isTerminalState(CREW_SHIFT_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: scheduled→confirmed→checked_in→checked_out", () => {
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "scheduled", "confirmed", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "confirmed", "checked_in", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "checked_in", "checked_out", MEMBER).allowed
        ).toBe(true);
    });
    it("break cycle: checked_in→on_break→checked_in", () => {
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "checked_in", "on_break", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "on_break", "checked_in", MEMBER).allowed
        ).toBe(true);
    });
    it("skip confirm: scheduled→checked_in directly", () => {
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "scheduled", "checked_in", MEMBER).allowed
        ).toBe(true);
    });
    it("no-show from scheduled or confirmed", () => {
        expect(validateTransition(CREW_SHIFT_MACHINE, "scheduled", "no_show", PM).allowed).toBe(
            true
        );
        expect(validateTransition(CREW_SHIFT_MACHINE, "confirmed", "no_show", PM).allowed).toBe(
            true
        );
    });
    it("member cannot mark no-show", () => {
        expect(validateTransition(CREW_SHIFT_MACHINE, "scheduled", "no_show", MEMBER).allowed).toBe(
            false
        );
    });
});

describe("Time Entry State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("time_entry")).toBe(TIME_ENTRY_MACHINE);
    });
    it("invoiced is terminal", () => {
        expect(isTerminalState(TIME_ENTRY_MACHINE, "invoiced")).toBe(true);
    });
    it("happy path: draft→submitted→approved→invoiced", () => {
        expect(validateTransition(TIME_ENTRY_MACHINE, "draft", "submitted", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(TIME_ENTRY_MACHINE, "submitted", "approved", PM).allowed).toBe(
            true
        );
        const exec: TransitionContext = { userRole: "exec" };
        expect(validateTransition(TIME_ENTRY_MACHINE, "approved", "invoiced", exec).allowed).toBe(
            true
        );
    });
    it("rejection cycle: submitted→rejected→draft→submitted", () => {
        expect(validateTransition(TIME_ENTRY_MACHINE, "submitted", "rejected", PM).allowed).toBe(
            true
        );
        expect(validateTransition(TIME_ENTRY_MACHINE, "rejected", "draft", MEMBER).allowed).toBe(
            true
        );
    });
    it("revoke approval: approved→rejected", () => {
        const exec: TransitionContext = { userRole: "exec" };
        expect(validateTransition(TIME_ENTRY_MACHINE, "approved", "rejected", exec).allowed).toBe(
            true
        );
    });
});

describe("E2E: Crew Lifecycle", () => {
    it("Scenario: Schedule→confirm→check-in→break→resume→check-out→approve time→invoice", () => {
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "scheduled", "confirmed", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "confirmed", "checked_in", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "checked_in", "on_break", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "on_break", "checked_in", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "checked_in", "checked_out", MEMBER).allowed
        ).toBe(true);
        expect(validateTransition(TIME_ENTRY_MACHINE, "draft", "submitted", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(TIME_ENTRY_MACHINE, "submitted", "approved", PM).allowed).toBe(
            true
        );
    });
});
