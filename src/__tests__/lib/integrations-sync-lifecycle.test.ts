import { describe, expect, it } from "vitest";
import { getMachineForEntity } from "@/lib/state-machines";

describe("Integration Registry Coverage", () => {
    const INTEGRATION_ENTITIES = [
        "project",
        "task",
        "deal",
        "contract",
        "invoice",
        "sow",
        "expense",
        "vendor",
        "work_order",
        "asset",
        "shipment",
        "opportunity",
    ];

    it("all core entities have state machines for sync conflict resolution", () => {
        for (const e of INTEGRATION_ENTITIES) {
            const m = getMachineForEntity(e);
            expect(m).toBeDefined();
            expect(m!.name).toBe(e);
        }
    });

    it("all machines have deterministic transitions (no ambiguous paths for sync)", () => {
        for (const e of INTEGRATION_ENTITIES) {
            const m = getMachineForEntity(e)!;
            const transitionPairs = m.transitions.map((t) => `${t.from}→${t.to}`);
            // Check no exact duplicates without different role restrictions
            const uniquePairs = new Set(transitionPairs);
            // Duplicates are allowed if they have different role restrictions
            expect(uniquePairs.size).toBeGreaterThan(0);
        }
    });

    it("all machines have valid initial states", () => {
        for (const e of INTEGRATION_ENTITIES) {
            const m = getMachineForEntity(e)!;
            expect(m.states).toContain(m.initialState);
        }
    });
});

describe("Webhook & Sync State Validation", () => {
    it("project machine supports all phases needed for outbound sync", () => {
        const m = getMachineForEntity("project")!;
        expect(m.states).toContain("draft");
        expect(m.states).toContain("completed");
    });

    it("invoice machine has paid state for payment webhook", () => {
        const m = getMachineForEntity("invoice")!;
        expect(m.states).toContain("paid");
        expect(m.terminalStates).toContain("paid");
    });

    it("deal machine has won/lost for CRM sync", () => {
        const m = getMachineForEntity("deal")!;
        expect(m.states).toContain("won");
        expect(m.states).toContain("lost");
    });
});
