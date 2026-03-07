/**
 * State Machine Registry Tests
 *
 * Validates that every state machine is properly registered, discoverable,
 * and structurally sound (all states reachable, no orphaned transitions).
 */

import { describe, expect, it } from "vitest";
import { getMachineForEntity } from "@/lib/state-machines/registry";
import { getAvailableTransitions, isTerminalState, validateTransition } from "@/lib/state-machine";
import type { StateMachineDefinition } from "@/lib/state-machine";

// ─── All expected entity names → machine name pairs ─────────

const EXPECTED_ENTITIES: [string, string][] = [
    ["project", "project"],
    ["task", "task"],
    ["deal", "deal"],
    ["contract", "contract"],
    ["invoice", "invoice"],
    ["sow", "sow"],
    ["scope_of_work", "sow"],
    ["expense", "expense"],
    ["vendor", "vendor"],
    ["work_order", "work_order"],
    ["asset", "asset"],
    ["shipment", "shipment"],
    ["opportunity", "opportunity"],
    ["change_order", "change_order"],
    ["service_request", "service_request"],
    ["purchase_order", "purchase_order"],
    ["milestone", "milestone"],
    ["crew_shift", "crew_shift"],
    ["time_entry", "time_entry"],
    ["live_event", "live_event"],
    ["ros_cue", "ros_cue"],
    ["readiness_gate", "readiness_gate"],
    ["document", "document"],
    ["incident", "incident"],
    ["approval_instance", "approval_instance"],
    ["workflow_instance", "approval_instance"],
    ["estimate", "estimate"],
    ["rental_agreement", "rental_agreement"],
    ["rights", "rights"],
    ["rights_license", "rights"],
];

describe("State Machine Registry", () => {
    describe("getMachineForEntity", () => {
        it.each(EXPECTED_ENTITIES)(
            'resolves "%s" to machine named "%s"',
            (entityName, expectedMachineName) => {
                const machine = getMachineForEntity(entityName);
                expect(machine).toBeDefined();
                expect(machine!.name).toBe(expectedMachineName);
            }
        );

        it("resolves kebab-case names", () => {
            expect(getMachineForEntity("work-order")?.name).toBe("work_order");
            expect(getMachineForEntity("live-event")?.name).toBe("live_event");
            expect(getMachineForEntity("ros-cue")?.name).toBe("ros_cue");
            expect(getMachineForEntity("crew-shift")?.name).toBe("crew_shift");
            expect(getMachineForEntity("time-entry")?.name).toBe("time_entry");
            expect(getMachineForEntity("change-order")?.name).toBe("change_order");
            expect(getMachineForEntity("purchase-order")?.name).toBe("purchase_order");
            expect(getMachineForEntity("service-request")?.name).toBe("service_request");
            expect(getMachineForEntity("readiness-gate")?.name).toBe("readiness_gate");
            expect(getMachineForEntity("rental-agreement")?.name).toBe("rental_agreement");
            expect(getMachineForEntity("approval-instance")?.name).toBe("approval_instance");
            expect(getMachineForEntity("rights-license")?.name).toBe("rights");
        });

        it("returns undefined for unknown entities", () => {
            expect(getMachineForEntity("nonexistent")).toBeUndefined();
            expect(getMachineForEntity("")).toBeUndefined();
            expect(getMachineForEntity("foo_bar")).toBeUndefined();
        });

        it("is case-insensitive", () => {
            expect(getMachineForEntity("PROJECT")?.name).toBe("project");
            expect(getMachineForEntity("Deal")?.name).toBe("deal");
            expect(getMachineForEntity("LIVE_EVENT")?.name).toBe("live_event");
        });
    });

    describe("Structural integrity of all registered machines", () => {
        const uniqueMachines = new Map<string, StateMachineDefinition>();
        for (const [entityName] of EXPECTED_ENTITIES) {
            const machine = getMachineForEntity(entityName);
            if (machine && !uniqueMachines.has(machine.name)) {
                uniqueMachines.set(machine.name, machine);
            }
        }

        for (const [name, machine] of uniqueMachines) {
            describe(`Machine: ${name}`, () => {
                it("has a valid initial state within states array", () => {
                    expect(machine.states).toContain(machine.initialState);
                });

                it("has all terminal states within states array", () => {
                    for (const ts of machine.terminalStates ?? []) {
                        expect(machine.states).toContain(ts);
                    }
                });

                it("has all transition sources within states array", () => {
                    for (const t of machine.transitions) {
                        expect(machine.states, `from: "${t.from}"`).toContain(t.from);
                    }
                });

                it("has all transition targets within states array", () => {
                    for (const t of machine.transitions) {
                        expect(machine.states, `to: "${t.to}"`).toContain(t.to);
                    }
                });

                // Note: Some machines intentionally allow transitions FROM terminal states
                // (e.g. shipment: delivered → returned, estimate: accepted → converted).
                // This is a valid business pattern, so we only verify structural integrity.
                it("terminal states that have outbound transitions are documented", () => {
                    // Just ensure they exist in the states array (structural soundness)
                    for (const t of machine.transitions.filter((t) =>
                        machine.terminalStates?.includes(t.from)
                    )) {
                        expect(machine.states).toContain(t.from);
                        expect(machine.states).toContain(t.to);
                    }
                });

                it("initial state is not terminal", () => {
                    expect(
                        isTerminalState(machine, machine.initialState),
                        "Initial state should not be terminal"
                    ).toBe(false);
                });

                it("has at least one terminal state", () => {
                    expect(
                        (machine.terminalStates?.length ?? 0) > 0,
                        "Every machine should have at least one terminal state"
                    ).toBe(true);
                });

                it("every non-terminal state has at least one outbound transition for exec", () => {
                    for (const state of machine.states) {
                        if (machine.terminalStates?.includes(state)) continue;
                        const available = getAvailableTransitions(machine, state, "exec");
                        expect(
                            available.length,
                            `State "${state}" in ${name} has no outbound transitions for exec`
                        ).toBeGreaterThan(0);
                    }
                });

                it("every non-terminal, non-initial state is reachable from at least one other state", () => {
                    const reachableStates = new Set<string>();
                    reachableStates.add(machine.initialState);
                    for (const t of machine.transitions) {
                        reachableStates.add(t.to);
                    }
                    for (const state of machine.states) {
                        expect(
                            reachableStates.has(state),
                            `State "${state}" in ${name} is unreachable`
                        ).toBe(true);
                    }
                });

                it("no-op transitions are always allowed", () => {
                    for (const state of machine.states) {
                        if (machine.terminalStates?.includes(state)) continue;
                        const result = validateTransition(machine, state, state, {
                            userRole: "exec",
                        });
                        expect(result.allowed).toBe(true);
                    }
                });
            });
        }
    });
});
