import { describe, expect, it } from "vitest";
import { CAMPAIGN_MACHINE, DOCUMENT_MACHINE, getMachineForEntity } from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const MEMBER: TransitionContext = { userRole: "member" };

describe("Campaign State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("campaign")).toBe(CAMPAIGN_MACHINE);
    });
    it("has 6 states", () => {
        expect(CAMPAIGN_MACHINE.states).toHaveLength(6);
    });
    it("completed and cancelled are terminal", () => {
        expect(isTerminalState(CAMPAIGN_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(CAMPAIGN_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: draft→planned→active→completed", () => {
        expect(validateTransition(CAMPAIGN_MACHINE, "draft", "planned", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "planned", "active", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "active", "completed", PM).allowed).toBe(true);
    });
    it("pause/resume: active→paused→active", () => {
        expect(validateTransition(CAMPAIGN_MACHINE, "active", "paused", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "paused", "active", PM).allowed).toBe(true);
    });
    it("back to draft: planned→draft", () => {
        expect(validateTransition(CAMPAIGN_MACHINE, "planned", "draft", PM).allowed).toBe(true);
    });
    it("cancel from any non-terminal state (exec/director only)", () => {
        for (const s of ["draft", "planned", "active", "paused"] as const) {
            expect(validateTransition(CAMPAIGN_MACHINE, s, "cancelled", EXEC).allowed).toBe(true);
        }
    });
    it("PM cannot cancel", () => {
        expect(validateTransition(CAMPAIGN_MACHINE, "draft", "cancelled", PM).allowed).toBe(false);
    });
    it("completed triggers generateReport", () => {
        const r = validateTransition(CAMPAIGN_MACHINE, "active", "completed", PM);
        expect(r.sideEffects).toContain("generateReport");
    });
});

describe("Document Lifecycle (Creative Context)", () => {
    it("happy path: draft→pending_review→approved→published", () => {
        expect(
            validateTransition(DOCUMENT_MACHINE, "draft", "pending_review", MEMBER).allowed
        ).toBe(true);
        expect(validateTransition(DOCUMENT_MACHINE, "pending_review", "approved", PM).allowed).toBe(
            true
        );
        expect(validateTransition(DOCUMENT_MACHINE, "approved", "published", PM).allowed).toBe(
            true
        );
    });
    it("supersede published document", () => {
        expect(validateTransition(DOCUMENT_MACHINE, "published", "superseded", PM).allowed).toBe(
            true
        );
        expect(isTerminalState(DOCUMENT_MACHINE, "superseded")).toBe(true);
    });
    it("archive from any approved state", () => {
        expect(validateTransition(DOCUMENT_MACHINE, "published", "archived", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(DOCUMENT_MACHINE, "approved", "archived", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(DOCUMENT_MACHINE, "draft", "archived", EXEC).allowed).toBe(true);
    });
});

describe("E2E: Creative Campaign Lifecycle", () => {
    it("Scenario: Brief→review→approve→publish→campaign→pause→resume→complete", () => {
        // Document (brief) lifecycle
        expect(
            validateTransition(DOCUMENT_MACHINE, "draft", "pending_review", MEMBER).allowed
        ).toBe(true);
        expect(validateTransition(DOCUMENT_MACHINE, "pending_review", "approved", PM).allowed).toBe(
            true
        );
        expect(validateTransition(DOCUMENT_MACHINE, "approved", "published", PM).allowed).toBe(
            true
        );
        // Campaign lifecycle
        expect(validateTransition(CAMPAIGN_MACHINE, "draft", "planned", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "planned", "active", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "active", "paused", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "paused", "active", PM).allowed).toBe(true);
        expect(validateTransition(CAMPAIGN_MACHINE, "active", "completed", PM).allowed).toBe(true);
    });
});
