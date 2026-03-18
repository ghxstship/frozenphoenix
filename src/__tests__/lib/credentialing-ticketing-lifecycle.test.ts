import { describe, expect, it } from "vitest";
import { getMachineForEntity } from "@/lib/state-machines";
import { validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };

describe("Credentialing State Machine Registry", () => {
    it("approval_instance machine exists (used for credential approval workflows)", () => {
        const m = getMachineForEntity("approval_instance");
        expect(m).toBeDefined();
        expect(m!.states).toContain("pending");
        expect(m!.states).toContain("completed");
    });

    it("approval instance can complete credential approval", () => {
        expect(
            validateTransition(
                getMachineForEntity("approval_instance")!,
                "pending",
                "in_progress",
                PM
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(
                getMachineForEntity("approval_instance")!,
                "in_progress",
                "completed",
                PM
            ).allowed
        ).toBe(true);
    });

    it("escalation path exists for credential disputes", () => {
        expect(
            validateTransition(
                getMachineForEntity("approval_instance")!,
                "in_progress",
                "escalated",
                PM
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(
                getMachineForEntity("approval_instance")!,
                "escalated",
                "completed",
                EXEC
            ).allowed
        ).toBe(true);
    });
});

describe("Credentialing Domain Validation", () => {
    it("service_request machine handles credential-related tickets", () => {
        const m = getMachineForEntity("service_request");
        expect(m).toBeDefined();
        expect(m!.states).toContain("new");
        expect(m!.states).toContain("resolved");
        expect(m!.states).toContain("closed");
    });

    it("service request lifecycle works for credential issues", () => {
        const m = getMachineForEntity("service_request")!;
        expect(validateTransition(m, "new", "triaged", PM).allowed).toBe(true);
        expect(validateTransition(m, "triaged", "assigned", PM).allowed).toBe(true);
    });
});
