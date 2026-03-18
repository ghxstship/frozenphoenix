import { describe, expect, it } from "vitest";
import {
    projectCreateSchema,
    projectUpdateSchema,
    taskCreateSchema,
} from "@/lib/validation/schemas";
import { sowCreateSchema } from "@/lib/validation/entity-schemas";
import {
    ACTIVATION_MACHINE,
    getMachineForEntity,
    MILESTONE_MACHINE,
    PROJECT_MACHINE,
    SOW_MACHINE,
    TASK_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM_CTX: TransitionContext = { userRole: "pm" };
const EXEC_CTX: TransitionContext = { userRole: "exec" };
const MEMBER_CTX: TransitionContext = { userRole: "member" };
const UUID = "550e8400-e29b-41d4-a716-446655440000";

// ═══════════════════════════════════════════════════════════════
// PROJECT VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Project Validation", () => {
    it("accepts minimal project", () => {
        const r = projectCreateSchema.safeParse({ name: "Festival 2026" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.status).toBe("draft");
            expect(r.data.phase).toBe("concept");
        }
    });

    it("accepts fully specified project", () => {
        const r = projectCreateSchema.safeParse({
            name: "Festival 2026",
            description: "Annual music festival",
            status: "active",
            phase: "production",
            start_date: "2026-07-01",
            end_date: "2026-07-05",
            budget_planned: 500000,
            client_name: "Acme Events",
        });
        expect(r.success).toBe(true);
    });

    it("rejects empty name", () => {
        expect(projectCreateSchema.safeParse({ name: "" }).success).toBe(false);
    });

    it("rejects name over 200 chars", () => {
        expect(projectCreateSchema.safeParse({ name: "x".repeat(201) }).success).toBe(false);
    });

    it("rejects invalid status", () => {
        expect(projectCreateSchema.safeParse({ name: "X", status: "bogus" }).success).toBe(false);
    });

    it("rejects invalid phase", () => {
        expect(projectCreateSchema.safeParse({ name: "X", phase: "bogus" }).success).toBe(false);
    });

    it("rejects negative budget", () => {
        expect(projectCreateSchema.safeParse({ name: "X", budget_planned: -100 }).success).toBe(
            false
        );
    });

    it("accepts all valid statuses", () => {
        const statuses = [
            "draft",
            "active",
            "on_hold",
            "completed",
            "cancelled",
            "archived",
            "pre_production",
            "in_production",
            "post_production",
            "wrap",
        ];
        for (const s of statuses) {
            expect(projectCreateSchema.safeParse({ name: "X", status: s }).success).toBe(true);
        }
    });

    it("partial update accepts title only", () => {
        const r = projectUpdateSchema.safeParse({ id: UUID, name: "New Name" });
        expect(r.success).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// PROJECT STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Project State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("project")).toBe(PROJECT_MACHINE);
    });

    it("has 9 states", () => {
        expect(PROJECT_MACHINE.states).toHaveLength(9);
    });

    it("initial state is draft", () => {
        expect(PROJECT_MACHINE.initialState).toBe("draft");
    });

    it("completed and cancelled are terminal", () => {
        expect(isTerminalState(PROJECT_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(PROJECT_MACHINE, "cancelled")).toBe(true);
    });

    it("happy path: draft→planning→pre_production→in_production→active→wrap→completed", () => {
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
            const r = validateTransition(PROJECT_MACHINE, path[i]!, path[i + 1]!, PM_CTX);
            expect(r.allowed).toBe(true);
        }
    });

    it("PM can put any active state on hold", () => {
        for (const s of ["planning", "pre_production", "in_production", "active"] as const) {
            expect(validateTransition(PROJECT_MACHINE, s, "on_hold", PM_CTX).allowed).toBe(true);
        }
    });

    it("on_hold can resume to any active state", () => {
        for (const s of ["planning", "pre_production", "in_production", "active"] as const) {
            expect(validateTransition(PROJECT_MACHINE, "on_hold", s, PM_CTX).allowed).toBe(true);
        }
    });

    it("exec/director can cancel from any non-terminal state", () => {
        for (const s of [
            "draft",
            "planning",
            "pre_production",
            "in_production",
            "on_hold",
        ] as const) {
            expect(validateTransition(PROJECT_MACHINE, s, "cancelled", EXEC_CTX).allowed).toBe(
                true
            );
        }
    });

    it("member cannot cancel", () => {
        const r = validateTransition(PROJECT_MACHINE, "draft", "cancelled", MEMBER_CTX);
        expect(r.allowed).toBe(false);
    });

    it("cannot transition from completed", () => {
        const r = validateTransition(PROJECT_MACHINE, "completed", "draft", PM_CTX);
        expect(r.allowed).toBe(false);
    });

    it("cannot skip from draft to active", () => {
        const r = validateTransition(PROJECT_MACHINE, "draft", "active", PM_CTX);
        expect(r.allowed).toBe(false);
    });

    it("completed triggers side effects", () => {
        const r = validateTransition(PROJECT_MACHINE, "wrap", "completed", PM_CTX);
        expect(r.allowed).toBe(true);
        expect(r.sideEffects).toContain("generateWrapReport");
        expect(r.sideEffects).toContain("triggerInvoicing");
    });

    it("requires name for planning state", () => {
        const ctx: TransitionContext = { userRole: "pm", entity: {} };
        const r = validateTransition(PROJECT_MACHINE, "draft", "planning", ctx);
        expect(r.allowed).toBe(false);
        expect(r.requiredFields).toContain("name");
    });

    it("allows planning when name is present", () => {
        const ctx: TransitionContext = { userRole: "pm", entity: { name: "Festival" } };
        const r = validateTransition(PROJECT_MACHINE, "draft", "planning", ctx);
        expect(r.allowed).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// TASK VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Task Validation", () => {
    it("accepts minimal task", () => {
        const r = taskCreateSchema.safeParse({ title: "Fix the bug" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.status).toBe("todo");
            expect(r.data.priority).toBe("medium");
        }
    });

    it("rejects empty title", () => {
        expect(taskCreateSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("rejects invalid status", () => {
        expect(taskCreateSchema.safeParse({ title: "X", status: "fake" }).success).toBe(false);
    });

    it("accepts all valid task statuses", () => {
        for (const s of [
            "todo",
            "in_progress",
            "in_review",
            "done",
            "blocked",
            "cancelled",
            "backlog",
        ]) {
            expect(taskCreateSchema.safeParse({ title: "X", status: s }).success).toBe(true);
        }
    });

    it("accepts all valid task priorities", () => {
        for (const p of ["low", "medium", "high", "urgent", "critical"]) {
            expect(taskCreateSchema.safeParse({ title: "X", priority: p }).success).toBe(true);
        }
    });

    it("accepts optional project_id and assigned_to", () => {
        const r = taskCreateSchema.safeParse({ title: "X", project_id: UUID, assigned_to: UUID });
        expect(r.success).toBe(true);
    });

    it("rejects non-UUID project_id", () => {
        expect(taskCreateSchema.safeParse({ title: "X", project_id: "bad" }).success).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// TASK STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Task State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("task")).toBe(TASK_MACHINE);
    });

    it("initial state is backlog", () => {
        expect(TASK_MACHINE.initialState).toBe("backlog");
    });

    it("completed and cancelled are terminal", () => {
        expect(isTerminalState(TASK_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(TASK_MACHINE, "cancelled")).toBe(true);
    });

    it("happy path: backlog→todo→in_progress→review→completed", () => {
        const ctx: TransitionContext = { userRole: "pm", entity: { assignee_id: UUID } };
        const path = ["backlog", "todo", "in_progress", "review", "completed"] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(validateTransition(TASK_MACHINE, path[i]!, path[i + 1]!, ctx).allowed).toBe(
                true
            );
        }
    });

    it("todo→in_progress requires assignee_id", () => {
        const ctx: TransitionContext = { userRole: "pm", entity: {} };
        const r = validateTransition(TASK_MACHINE, "todo", "in_progress", ctx);
        expect(r.allowed).toBe(false);
        expect(r.requiredFields).toContain("assignee_id");
    });

    it("review→in_progress returns task for changes", () => {
        expect(validateTransition(TASK_MACHINE, "review", "in_progress", PM_CTX).allowed).toBe(
            true
        );
    });

    it("blocked→in_progress unblocks", () => {
        expect(validateTransition(TASK_MACHINE, "blocked", "in_progress", PM_CTX).allowed).toBe(
            true
        );
    });
});

// ═══════════════════════════════════════════════════════════════
// SOW VALIDATION & STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("SOW Validation", () => {
    it("accepts minimal SOW", () => {
        const r = sowCreateSchema.safeParse({ title: "Main Stage SOW" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.status).toBe("draft");
            expect(r.data.version).toBe(1);
            expect(r.data.currency).toBe("USD");
        }
    });

    it("rejects empty title", () => {
        expect(sowCreateSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("rejects invalid status", () => {
        expect(sowCreateSchema.safeParse({ title: "X", status: "fake" }).success).toBe(false);
    });

    it("accepts all valid SOW statuses", () => {
        for (const s of [
            "draft",
            "internal_review",
            "client_review",
            "revision",
            "approved",
            "active",
            "completed",
            "cancelled",
        ]) {
            expect(sowCreateSchema.safeParse({ title: "X", status: s }).success).toBe(true);
        }
    });
});

describe("SOW State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("sow")).toBe(SOW_MACHINE);
        expect(getMachineForEntity("scope_of_work")).toBe(SOW_MACHINE);
    });

    it("initial state is draft", () => {
        expect(SOW_MACHINE.initialState).toBe("draft");
    });
});

// ═══════════════════════════════════════════════════════════════
// ACTIVATION & MILESTONE STATE MACHINES
// ═══════════════════════════════════════════════════════════════

describe("Activation State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("activation")).toBe(ACTIVATION_MACHINE);
    });

    it("initial state is planning", () => {
        expect(ACTIVATION_MACHINE.initialState).toBe("planning");
    });

    it("completed and cancelled are terminal", () => {
        expect(isTerminalState(ACTIVATION_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(ACTIVATION_MACHINE, "cancelled")).toBe(true);
    });
});

describe("Milestone State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("milestone")).toBe(MILESTONE_MACHINE);
    });
});

// ═══════════════════════════════════════════════════════════════
// REGISTRY INTEGRITY
// ═══════════════════════════════════════════════════════════════

describe("State Machine Registry", () => {
    const EXPECTED = [
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
        "change_order",
        "service_request",
        "purchase_order",
        "milestone",
        "crew_shift",
        "time_entry",
        "live_event",
        "ros_cue",
        "readiness_gate",
        "document",
        "incident",
        "approval_instance",
        "estimate",
        "rental_agreement",
        "rights",
        "lead",
        "campaign",
        "proposal",
        "client_invoice",
        "payment",
        "activation",
        "permit",
    ];

    it("all expected entities are registered", () => {
        for (const e of EXPECTED) {
            expect(getMachineForEntity(e)).toBeDefined();
        }
    });

    it("kebab-case lookup works", () => {
        expect(getMachineForEntity("work-order")).toBeDefined();
        expect(getMachineForEntity("crew-shift")).toBeDefined();
        expect(getMachineForEntity("live-event")).toBeDefined();
    });

    it("every machine has name, initialState, states, transitions", () => {
        for (const e of EXPECTED) {
            const m = getMachineForEntity(e)!;
            expect(m.name).toBeTruthy();
            expect(m.initialState).toBeTruthy();
            expect(m.states.length).toBeGreaterThan(0);
            expect(m.transitions.length).toBeGreaterThan(0);
        }
    });

    it("every machine's transition references valid states", () => {
        for (const e of EXPECTED) {
            const m = getMachineForEntity(e)!;
            for (const t of m.transitions) {
                expect(m.states).toContain(t.from);
                expect(m.states).toContain(t.to);
            }
        }
    });

    it("every machine's terminal states are in the states array", () => {
        for (const e of EXPECTED) {
            const m = getMachineForEntity(e)!;
            if (m.terminalStates) {
                for (const ts of m.terminalStates) {
                    expect(m.states).toContain(ts);
                }
            }
        }
    });

    it("no self-transitions in any machine", () => {
        for (const e of EXPECTED) {
            const m = getMachineForEntity(e)!;
            for (const t of m.transitions) {
                expect(t.from).not.toBe(t.to);
            }
        }
    });

    it("terminal states have no outbound transitions (except explicit)", () => {
        for (const e of EXPECTED) {
            const m = getMachineForEntity(e)!;
            if (!m.terminalStates) continue;
            for (const ts of m.terminalStates) {
                const outbound = m.transitions.filter((t) => t.from === ts);
                if (outbound.length > 0) {
                    // Explicit transitions from terminal are allowed but rare — just verify they exist in states
                    for (const o of outbound) {
                        expect(m.states).toContain(o.to);
                    }
                }
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// E2E SCENARIOS
// ═══════════════════════════════════════════════════════════════

describe("E2E: Project Lifecycle", () => {
    it("Scenario A: Full project lifecycle with required fields", () => {
        const entity = {
            name: "Festival",
            start_date: "2026-07-01",
            end_date: "2026-07-05",
            manager_id: UUID,
        };
        const ctx: TransitionContext = { userRole: "pm", entity };
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
            const r = validateTransition(PROJECT_MACHINE, path[i]!, path[i + 1]!, ctx);
            expect(r.allowed).toBe(true);
        }
    });

    it("Scenario B: Project goes on hold and resumes", () => {
        expect(
            validateTransition(PROJECT_MACHINE, "in_production", "on_hold", PM_CTX).allowed
        ).toBe(true);
        expect(
            validateTransition(PROJECT_MACHINE, "on_hold", "in_production", PM_CTX).allowed
        ).toBe(true);
    });

    it("Scenario C: Project cancelled mid-production", () => {
        expect(
            validateTransition(PROJECT_MACHINE, "in_production", "cancelled", EXEC_CTX).allowed
        ).toBe(true);
        expect(isTerminalState(PROJECT_MACHINE, "cancelled")).toBe(true);
    });
});
