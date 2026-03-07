/**
 * State Machine Unit Tests
 *
 * Covers: core engine (validateTransition, getAvailableTransitions, isTerminalState)
 * + 6 entity machines (project, task, contract, invoice, vendor, approval-instance).
 */

import { describe, expect, it } from "vitest";
import {
    defineStateMachine,
    getAvailableTransitions,
    isTerminalState,
    validateTransition,
} from "@/lib/state-machine";
import { PROJECT_MACHINE } from "@/lib/state-machines/project";
import { TASK_MACHINE } from "@/lib/state-machines/task";
import { CONTRACT_MACHINE } from "@/lib/state-machines/contract";
import { INVOICE_MACHINE } from "@/lib/state-machines/invoice";
import { VENDOR_MACHINE } from "@/lib/state-machines/vendor";
import { APPROVAL_INSTANCE_MACHINE } from "@/lib/state-machines/approval-instance";
import type { PermissionLevel } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────

function ctx(
    role: PermissionLevel,
    entity?: Record<string, unknown>,
    guards?: Record<string, (e: Record<string, unknown>) => boolean>
) {
    return { userRole: role, entity, guards };
}

// ═══════════════════════════════════════════════════════════════
// CORE ENGINE TESTS
// ═══════════════════════════════════════════════════════════════

describe("State Machine Core Engine", () => {
    describe("validateTransition", () => {
        it("rejects invalid source state", () => {
            const result = validateTransition(
                PROJECT_MACHINE,
                "nonexistent" as never,
                "planning",
                ctx("exec")
            );
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("Invalid source state");
        });

        it("rejects invalid target state", () => {
            const result = validateTransition(
                PROJECT_MACHINE,
                "draft",
                "nonexistent" as never,
                ctx("exec")
            );
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("Invalid target state");
        });

        it("allows no-op transition (same state)", () => {
            const result = validateTransition(PROJECT_MACHINE, "draft", "draft", ctx("pm"));
            expect(result.allowed).toBe(true);
            expect(result.sideEffects).toEqual([]);
        });

        it("blocks transitions from terminal states", () => {
            const result = validateTransition(
                PROJECT_MACHINE,
                "completed",
                "planning",
                ctx("exec")
            );
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("terminal state");
        });

        it("blocks undefined transitions", () => {
            const result = validateTransition(PROJECT_MACHINE, "draft", "completed", ctx("exec"));
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("No transition defined");
        });

        it("blocks unauthorized roles", () => {
            const result = validateTransition(TASK_MACHINE, "review", "completed", ctx("member"));
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("not permitted");
        });

        it("collects side effects from transition + onEnter", () => {
            const result = validateTransition(PROJECT_MACHINE, "wrap", "completed", ctx("pm"));
            expect(result.allowed).toBe(true);
            expect(result.sideEffects).toContain("notifyStakeholders");
            expect(result.sideEffects).toContain("generateWrapReport");
            expect(result.sideEffects).toContain("triggerInvoicing");
        });

        it("enforces required fields", () => {
            const result = validateTransition(
                TASK_MACHINE,
                "todo",
                "in_progress",
                ctx("pm", { title: "Test" }) // missing assignee_id
            );
            expect(result.allowed).toBe(false);
            expect(result.requiredFields).toContain("assignee_id");
        });

        it("passes when required fields are present", () => {
            const result = validateTransition(
                TASK_MACHINE,
                "todo",
                "in_progress",
                ctx("pm", { assignee_id: "user-123" }, { hasAssignee: () => true })
            );
            expect(result.allowed).toBe(true);
        });

        it("evaluates guard functions", () => {
            const result = validateTransition(
                TASK_MACHINE,
                "todo",
                "in_progress",
                ctx("pm", { assignee_id: "user-123" }, { hasAssignee: () => false })
            );
            // Guard fails → "Guard conditions not met"
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain("Guard conditions not met");
        });
    });

    describe("getAvailableTransitions", () => {
        it("returns empty for terminal states", () => {
            const result = getAvailableTransitions(PROJECT_MACHINE, "completed", "exec");
            expect(result).toEqual([]);
        });

        it("returns valid transitions for pm from draft", () => {
            const result = getAvailableTransitions(PROJECT_MACHINE, "draft", "pm");
            const targets = result.map((r) => r.to);
            expect(targets).toContain("planning");
            // PM cannot cancel from draft (only exec/director)
            expect(targets).not.toContain("cancelled");
        });

        it("returns cancel for exec from draft", () => {
            const result = getAvailableTransitions(PROJECT_MACHINE, "draft", "exec");
            const targets = result.map((r) => r.to);
            expect(targets).toContain("planning");
            expect(targets).toContain("cancelled");
        });

        it("excludes transitions not allowed for role", () => {
            const result = getAvailableTransitions(VENDOR_MACHINE, "suspended", "pm");
            const targets = result.map((r) => r.to);
            // Only exec can blacklist
            expect(targets).not.toContain("blacklisted");
        });

        it("deduplicates target states", () => {
            const result = getAvailableTransitions(PROJECT_MACHINE, "on_hold", "pm");
            const targets = result.map((r) => r.to);
            // Should have unique targets
            expect(targets.length).toBe(new Set(targets).size);
        });
    });

    describe("isTerminalState", () => {
        it("returns true for terminal states", () => {
            expect(isTerminalState(PROJECT_MACHINE, "completed")).toBe(true);
            expect(isTerminalState(PROJECT_MACHINE, "cancelled")).toBe(true);
        });

        it("returns false for non-terminal states", () => {
            expect(isTerminalState(PROJECT_MACHINE, "draft")).toBe(false);
            expect(isTerminalState(PROJECT_MACHINE, "active")).toBe(false);
        });
    });

    describe("defineStateMachine", () => {
        it("throws on invalid transition source state", () => {
            expect(() =>
                defineStateMachine({
                    name: "test",
                    initialState: "a",
                    states: ["a", "b"] as const,
                    transitions: [{ from: "invalid" as never, to: "b" }],
                })
            ).toThrow("not in states array");
        });

        it("throws on invalid transition target state", () => {
            expect(() =>
                defineStateMachine({
                    name: "test",
                    initialState: "a",
                    states: ["a", "b"] as const,
                    transitions: [{ from: "a", to: "invalid" as never }],
                })
            ).toThrow("not in states array");
        });

        it("throws on invalid terminal state", () => {
            expect(() =>
                defineStateMachine({
                    name: "test",
                    initialState: "a",
                    states: ["a", "b"] as const,
                    terminalStates: ["invalid" as never],
                    transitions: [],
                })
            ).toThrow("not in states array");
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// PROJECT MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Project State Machine", () => {
    it("has correct initial state", () => {
        expect(PROJECT_MACHINE.initialState).toBe("draft");
    });

    it("defines 9 states", () => {
        expect(PROJECT_MACHINE.states).toHaveLength(9);
    });

    it("defines completed and cancelled as terminal", () => {
        expect(PROJECT_MACHINE.terminalStates).toContain("completed");
        expect(PROJECT_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full happy-path lifecycle", () => {
        const path = [
            "draft",
            "planning",
            "pre_production",
            "in_production",
            "active",
            "wrap",
            "completed",
        ] as const;
        for (let i = 0; i < path.length - 1; i++) {
            const result = validateTransition(
                PROJECT_MACHINE,
                path[i]!,
                path[i + 1]!,
                ctx("pm", {
                    name: "P",
                    start_date: "2026-01-01",
                    end_date: "2026-06-01",
                    manager_id: "u1",
                })
            );
            expect(result.allowed).toBe(true);
        }
    });

    it("allows hold/resume from active states", () => {
        const holdable = ["planning", "pre_production", "in_production", "active"] as const;
        for (const state of holdable) {
            const result = validateTransition(PROJECT_MACHINE, state, "on_hold", ctx("pm"));
            expect(result.allowed).toBe(true);
        }
    });

    it("requires name for planning", () => {
        const result = validateTransition(PROJECT_MACHINE, "draft", "planning", ctx("pm", {}));
        expect(result.allowed).toBe(false);
        expect(result.requiredFields).toContain("name");
    });
});

// ═══════════════════════════════════════════════════════════════
// TASK MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Task State Machine", () => {
    it("has correct initial state", () => {
        expect(TASK_MACHINE.initialState).toBe("backlog");
    });

    it("defines 7 states", () => {
        expect(TASK_MACHINE.states).toHaveLength(7);
    });

    it("allows backlog → todo → in_progress → review → completed", () => {
        const entity = { assignee_id: "u1" };
        const guards = { hasAssignee: (e: Record<string, unknown>) => !!e.assignee_id };
        expect(validateTransition(TASK_MACHINE, "backlog", "todo", ctx("member")).allowed).toBe(
            true
        );
        expect(
            validateTransition(TASK_MACHINE, "todo", "in_progress", ctx("member", entity, guards))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(TASK_MACHINE, "in_progress", "review", ctx("member")).allowed
        ).toBe(true);
        expect(validateTransition(TASK_MACHINE, "review", "completed", ctx("pm")).allowed).toBe(
            true
        );
    });

    it("member cannot approve a review", () => {
        const result = validateTransition(TASK_MACHINE, "review", "completed", ctx("member"));
        expect(result.allowed).toBe(false);
    });

    it("allows block/unblock cycle", () => {
        expect(
            validateTransition(TASK_MACHINE, "in_progress", "blocked", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(TASK_MACHINE, "blocked", "in_progress", ctx("member")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// CONTRACT MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Contract State Machine", () => {
    it("has correct initial state", () => {
        expect(CONTRACT_MACHINE.initialState).toBe("draft");
    });

    it("defines expired and terminated as terminal", () => {
        expect(CONTRACT_MACHINE.terminalStates).toContain("expired");
        expect(CONTRACT_MACHINE.terminalStates).toContain("terminated");
    });

    it("allows full lifecycle: draft → review → signature → active → expired", () => {
        const entity = {
            title: "C",
            contract_type: "vendor",
            start_date: "2026-01-01",
            end_date: "2026-12-31",
        };
        const guards = { hasRequiredFields: () => true };
        expect(
            validateTransition(
                CONTRACT_MACHINE,
                "draft",
                "pending_review",
                ctx("pm", entity, guards)
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(
                CONTRACT_MACHINE,
                "pending_review",
                "pending_signature",
                ctx("director", entity)
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(
                CONTRACT_MACHINE,
                "pending_signature",
                "active",
                ctx("director", entity)
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(CONTRACT_MACHINE, "active", "expired", ctx("director")).allowed
        ).toBe(true);
    });

    it("pm cannot approve contracts", () => {
        const result = validateTransition(
            CONTRACT_MACHINE,
            "pending_review",
            "pending_signature",
            ctx("pm")
        );
        expect(result.allowed).toBe(false);
    });

    it("requires fields for pending_review", () => {
        const result = validateTransition(
            CONTRACT_MACHINE,
            "draft",
            "pending_review",
            ctx("pm", {}, { hasRequiredFields: () => true })
        );
        expect(result.allowed).toBe(false);
        expect(result.requiredFields).toContain("title");
    });
});

// ═══════════════════════════════════════════════════════════════
// INVOICE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Invoice State Machine", () => {
    it("has correct initial state", () => {
        expect(INVOICE_MACHINE.initialState).toBe("draft");
    });

    it("defines paid, void, written_off as terminal", () => {
        expect(INVOICE_MACHINE.terminalStates).toContain("paid");
        expect(INVOICE_MACHINE.terminalStates).toContain("void");
        expect(INVOICE_MACHINE.terminalStates).toContain("written_off");
    });

    it("allows happy-path: draft → pending → approved → sent → paid", () => {
        expect(validateTransition(INVOICE_MACHINE, "draft", "pending", ctx("pm")).allowed).toBe(
            true
        );
        expect(
            validateTransition(INVOICE_MACHINE, "pending", "approved", ctx("director")).allowed
        ).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "approved", "sent", ctx("pm")).allowed).toBe(
            true
        );
        expect(validateTransition(INVOICE_MACHINE, "sent", "paid", ctx("pm")).allowed).toBe(true);
    });

    it("client can dispute a sent invoice", () => {
        expect(validateTransition(INVOICE_MACHINE, "sent", "disputed", ctx("client")).allowed).toBe(
            true
        );
    });

    it("only exec can write off", () => {
        expect(
            validateTransition(INVOICE_MACHINE, "overdue", "written_off", ctx("exec")).allowed
        ).toBe(true);
        expect(
            validateTransition(INVOICE_MACHINE, "overdue", "written_off", ctx("director")).allowed
        ).toBe(false);
    });

    it("cannot transition from paid (terminal)", () => {
        const result = validateTransition(INVOICE_MACHINE, "paid", "sent", ctx("exec"));
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("terminal state");
    });
});

// ═══════════════════════════════════════════════════════════════
// VENDOR MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Vendor State Machine", () => {
    it("has correct initial state", () => {
        expect(VENDOR_MACHINE.initialState).toBe("prospect");
    });

    it("defines blacklisted as terminal", () => {
        expect(VENDOR_MACHINE.terminalStates).toContain("blacklisted");
        expect(VENDOR_MACHINE.terminalStates).toHaveLength(1);
    });

    it("allows full onboarding: prospect → application → review → onboarding → active", () => {
        const entity = { compliance_docs: true };
        const guards = { hasComplianceDocs: () => true };
        expect(
            validateTransition(VENDOR_MACHINE, "prospect", "application", ctx("pm")).allowed
        ).toBe(true);
        expect(validateTransition(VENDOR_MACHINE, "application", "review", ctx("pm")).allowed).toBe(
            true
        );
        expect(
            validateTransition(VENDOR_MACHINE, "review", "onboarding", ctx("director")).allowed
        ).toBe(true);
        expect(
            validateTransition(VENDOR_MACHINE, "onboarding", "active", ctx("pm", entity, guards))
                .allowed
        ).toBe(true);
    });

    it("only exec can blacklist", () => {
        expect(
            validateTransition(VENDOR_MACHINE, "suspended", "blacklisted", ctx("exec")).allowed
        ).toBe(true);
        expect(
            validateTransition(VENDOR_MACHINE, "suspended", "blacklisted", ctx("director")).allowed
        ).toBe(false);
    });

    it("allows suspend/reinstate cycle", () => {
        expect(
            validateTransition(VENDOR_MACHINE, "active", "suspended", ctx("director")).allowed
        ).toBe(true);
        expect(
            validateTransition(VENDOR_MACHINE, "suspended", "active", ctx("director")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// APPROVAL INSTANCE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Approval Instance State Machine", () => {
    it("has correct initial state", () => {
        expect(APPROVAL_INSTANCE_MACHINE.initialState).toBe("pending");
    });

    it("defines completed and cancelled as terminal", () => {
        expect(APPROVAL_INSTANCE_MACHINE.terminalStates).toContain("completed");
        expect(APPROVAL_INSTANCE_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows pending → in_progress → completed", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "pending", "in_progress", ctx("member"))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "completed", ctx("pm"))
                .allowed
        ).toBe(true);
    });

    it("allows escalation and de-escalation", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "escalated", ctx("pm"))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(
                APPROVAL_INSTANCE_MACHINE,
                "escalated",
                "in_progress",
                ctx("director")
            ).allowed
        ).toBe(true);
    });

    it("allows cancel from multiple states", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "pending", "cancelled", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(
                APPROVAL_INSTANCE_MACHINE,
                "in_progress",
                "cancelled",
                ctx("director")
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "escalated", "cancelled", ctx("director"))
                .allowed
        ).toBe(true);
    });

    it("member cannot cancel in_progress", () => {
        const result = validateTransition(
            APPROVAL_INSTANCE_MACHINE,
            "in_progress",
            "cancelled",
            ctx("member")
        );
        expect(result.allowed).toBe(false);
    });
});
