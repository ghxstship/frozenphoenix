/**
 * Extended State Machine Tests — All 21 Previously-Untested Machines
 *
 * Covers every workstream's lifecycle state machines with:
 * - Initial state verification
 * - State count verification
 * - Terminal state verification
 * - Happy-path lifecycle simulation
 * - RBAC enforcement (role-gated transitions)
 * - Required field enforcement (where applicable)
 * - Side effect collection
 * - Edge cases (hold/resume, cancel, reopen, etc.)
 */

import { describe, expect, it } from "vitest";
import { getAvailableTransitions, isTerminalState, validateTransition } from "@/lib/state-machine";
import type { PermissionLevel } from "@/types";

// ─── Machine imports ────────────────────────────────────────
import { DEAL_MACHINE } from "@/lib/state-machines/deal";
import { OPPORTUNITY_MACHINE } from "@/lib/state-machines/opportunity";
import { SOW_MACHINE } from "@/lib/state-machines/sow";
import { MILESTONE_MACHINE } from "@/lib/state-machines/milestone";
import { CHANGE_ORDER_MACHINE } from "@/lib/state-machines/change-order";
import { EXPENSE_MACHINE } from "@/lib/state-machines/expense";
import { ESTIMATE_MACHINE } from "@/lib/state-machines/estimate";
import { PURCHASE_ORDER_MACHINE } from "@/lib/state-machines/purchase-order";
import { TIME_ENTRY_MACHINE } from "@/lib/state-machines/time-entry";
import { CREW_SHIFT_MACHINE } from "@/lib/state-machines/crew-shift";
import { WORK_ORDER_MACHINE } from "@/lib/state-machines/work-order";
import { ASSET_MACHINE } from "@/lib/state-machines/asset";
import { SHIPMENT_MACHINE } from "@/lib/state-machines/shipment";
import { RENTAL_AGREEMENT_MACHINE } from "@/lib/state-machines/rental-agreement";
import { LIVE_EVENT_MACHINE } from "@/lib/state-machines/live-event";
import { ROS_CUE_MACHINE } from "@/lib/state-machines/ros-cue";
import { READINESS_GATE_MACHINE } from "@/lib/state-machines/readiness-gate";
import { INCIDENT_MACHINE } from "@/lib/state-machines/incident";
import { DOCUMENT_MACHINE } from "@/lib/state-machines/document";
import { SERVICE_REQUEST_MACHINE } from "@/lib/state-machines/service-request";
import { RIGHTS_MACHINE } from "@/lib/state-machines/rights";

// ─── Helpers ────────────────────────────────────────────────

function ctx(
    role: PermissionLevel,
    entity?: Record<string, unknown>,
    guards?: Record<string, (e: Record<string, unknown>) => boolean>
) {
    return { userRole: role, entity, guards };
}

/** Assert a full ordered path of transitions succeeds for a given role */
function assertHappyPath(
    machine: Parameters<typeof validateTransition>[0],
    path: string[],
    role: PermissionLevel,
    entity?: Record<string, unknown>,
    guards?: Record<string, (e: Record<string, unknown>) => boolean>
) {
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i]!;
        const to = path[i + 1]!;
        const result = validateTransition(
            machine as unknown as Parameters<typeof validateTransition>[0],
            from as unknown as Parameters<typeof validateTransition>[1],
            to as unknown as Parameters<typeof validateTransition>[2],
            ctx(role, entity, guards)
        );
        expect(result.allowed, `Expected ${from} → ${to} to be allowed for ${role}`).toBe(true);
    }
}

// ═══════════════════════════════════════════════════════════════
// WS-01: SALES & CRM
// ═══════════════════════════════════════════════════════════════

describe("WS-01: Deal State Machine", () => {
    it("has correct initial state and structure", () => {
        expect(DEAL_MACHINE.initialState).toBe("lead");
        expect(DEAL_MACHINE.states).toHaveLength(6);
        expect(DEAL_MACHINE.terminalStates).toContain("won");
        expect(DEAL_MACHINE.terminalStates).toContain("lost");
    });

    it("allows full sales pipeline: lead → qualified → proposal → negotiation → won", () => {
        assertHappyPath(
            DEAL_MACHINE,
            ["lead", "qualified", "proposal", "negotiation", "won"],
            "pm"
        );
    });

    it("collects side effects on close-won", () => {
        const result = validateTransition(DEAL_MACHINE, "negotiation", "won", ctx("pm"));
        expect(result.allowed).toBe(true);
        expect(result.sideEffects).toContain("notifyTeam");
        expect(result.sideEffects).toContain("createProject");
    });

    it("allows disqualification from any pipeline stage to lost", () => {
        for (const state of ["lead", "qualified", "proposal", "negotiation"] as const) {
            const result = validateTransition(DEAL_MACHINE, state, "lost", ctx("pm"));
            expect(result.allowed, `${state} → lost should be allowed`).toBe(true);
        }
    });

    it("allows proposal revision: proposal → qualified", () => {
        expect(validateTransition(DEAL_MACHINE, "proposal", "qualified", ctx("pm")).allowed).toBe(
            true
        );
    });

    it("blocks member from qualifying leads", () => {
        expect(validateTransition(DEAL_MACHINE, "lead", "qualified", ctx("member")).allowed).toBe(
            false
        );
    });

    it("cannot transition from won (terminal)", () => {
        const result = validateTransition(DEAL_MACHINE, "won", "lead", ctx("exec"));
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("terminal state");
    });
});

describe("WS-01: Opportunity State Machine", () => {
    it("has correct initial state and structure", () => {
        expect(OPPORTUNITY_MACHINE.initialState).toBe("discovery");
        expect(OPPORTUNITY_MACHINE.states).toHaveLength(9);
        expect(OPPORTUNITY_MACHINE.terminalStates).toContain("closed_won");
        expect(OPPORTUNITY_MACHINE.terminalStates).toContain("closed_lost");
    });

    it("allows full pipeline: discovery → qualification → proposal_sent → negotiation → verbal_commit → contract_out → closed_won", () => {
        assertHappyPath(
            OPPORTUNITY_MACHINE,
            [
                "discovery",
                "qualification",
                "proposal_sent",
                "negotiation",
                "verbal_commit",
                "contract_out",
                "closed_won",
            ],
            "pm"
        );
    });

    it("collects side effects on close-won", () => {
        const result = validateTransition(
            OPPORTUNITY_MACHINE,
            "contract_out",
            "closed_won",
            ctx("pm")
        );
        expect(result.sideEffects).toContain("createProject");
        expect(result.sideEffects).toContain("notifyTeam");
    });

    it("allows hold from multiple stages", () => {
        for (const state of [
            "discovery",
            "qualification",
            "proposal_sent",
            "negotiation",
        ] as const) {
            expect(
                validateTransition(OPPORTUNITY_MACHINE, state, "on_hold", ctx("pm")).allowed
            ).toBe(true);
        }
    });

    it("allows resume from hold", () => {
        expect(
            validateTransition(OPPORTUNITY_MACHINE, "on_hold", "discovery", ctx("pm")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-02: PRODUCTION LIFECYCLE
// ═══════════════════════════════════════════════════════════════

describe("WS-02: SOW State Machine", () => {
    it("has correct initial state and structure", () => {
        expect(SOW_MACHINE.initialState).toBe("draft");
        expect(SOW_MACHINE.states).toHaveLength(9);
        expect(SOW_MACHINE.terminalStates).toContain("completed");
        expect(SOW_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full lifecycle: draft → pending_review → pending_approval → approved → active → completed", () => {
        const entity = { title: "SOW-001", project_id: "p1", start_date: "2026-01-01" };
        assertHappyPath(
            SOW_MACHINE,
            ["draft", "pending_review", "pending_approval", "approved", "active", "completed"],
            "director",
            entity
        );
    });

    it("requires title and project_id for pending_review", () => {
        const result = validateTransition(SOW_MACHINE, "draft", "pending_review", ctx("pm", {}));
        expect(result.allowed).toBe(false);
        expect(result.requiredFields).toContain("title");
        expect(result.requiredFields).toContain("project_id");
    });

    it("allows amendment cycle: active → amendment → pending_review", () => {
        expect(validateTransition(SOW_MACHINE, "active", "amendment", ctx("pm")).allowed).toBe(
            true
        );
        const entity = { title: "SOW-001", project_id: "p1" };
        expect(
            validateTransition(SOW_MACHINE, "amendment", "pending_review", ctx("pm", entity))
                .allowed
        ).toBe(true);
    });

    it("pm cannot approve (only exec/director)", () => {
        expect(
            validateTransition(SOW_MACHINE, "pending_approval", "approved", ctx("pm")).allowed
        ).toBe(false);
    });

    it("collects triggerInvoicing on completion", () => {
        const result = validateTransition(SOW_MACHINE, "active", "completed", ctx("pm"));
        expect(result.sideEffects).toContain("triggerInvoicing");
    });

    it("allows hold/resume cycle", () => {
        expect(validateTransition(SOW_MACHINE, "active", "on_hold", ctx("pm")).allowed).toBe(true);
        expect(validateTransition(SOW_MACHINE, "on_hold", "active", ctx("pm")).allowed).toBe(true);
    });
});

describe("WS-02: Milestone State Machine", () => {
    it("has correct initial state", () => {
        expect(MILESTONE_MACHINE.initialState).toBe("pending");
    });

    it("allows happy-path: pending → in_progress → completed", () => {
        assertHappyPath(MILESTONE_MACHINE, ["pending", "in_progress", "completed"], "pm");
    });

    it("allows overdue and recovery", () => {
        expect(
            validateTransition(MILESTONE_MACHINE, "in_progress", "overdue", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(MILESTONE_MACHINE, "overdue", "in_progress", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(MILESTONE_MACHINE, "overdue", "completed", ctx("pm")).allowed
        ).toBe(true);
    });

    it("collects triggerApproval on completion", () => {
        const result = validateTransition(MILESTONE_MACHINE, "in_progress", "completed", ctx("pm"));
        expect(result.sideEffects).toContain("triggerApproval");
    });

    it("cancellation requires director+", () => {
        expect(
            validateTransition(MILESTONE_MACHINE, "pending", "cancelled", ctx("director")).allowed
        ).toBe(true);
        expect(
            validateTransition(MILESTONE_MACHINE, "pending", "cancelled", ctx("pm")).allowed
        ).toBe(false);
    });
});

describe("WS-02: Change Order State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(CHANGE_ORDER_MACHINE.initialState).toBe("draft");
        expect(CHANGE_ORDER_MACHINE.terminalStates).toContain("implemented");
        expect(CHANGE_ORDER_MACHINE.terminalStates).toContain("rejected");
        expect(CHANGE_ORDER_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full lifecycle: draft → submitted → under_review → approved → implemented", () => {
        assertHappyPath(
            CHANGE_ORDER_MACHINE,
            ["draft", "submitted", "under_review", "approved", "implemented"],
            "director"
        );
    });

    it("pm cannot approve change orders (only exec/director)", () => {
        expect(
            validateTransition(CHANGE_ORDER_MACHINE, "under_review", "approved", ctx("pm")).allowed
        ).toBe(false);
    });

    it("allows return for revision: under_review → draft", () => {
        expect(
            validateTransition(CHANGE_ORDER_MACHINE, "under_review", "draft", ctx("director"))
                .allowed
        ).toBe(true);
    });

    it("collects updateBudget and notifyPM on approval", () => {
        const result = validateTransition(
            CHANGE_ORDER_MACHINE,
            "under_review",
            "approved",
            ctx("director")
        );
        expect(result.sideEffects).toContain("updateBudget");
        expect(result.sideEffects).toContain("notifyPM");
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-04: FINANCE & BILLING
// ═══════════════════════════════════════════════════════════════

describe("WS-04: Expense State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(EXPENSE_MACHINE.initialState).toBe("draft");
        expect(EXPENSE_MACHINE.terminalStates).toContain("reimbursed");
        expect(EXPENSE_MACHINE.terminalStates).toContain("void");
    });

    it("allows full lifecycle: draft → pending → approved → reimbursed", () => {
        const entity = { amount: 150, category: "travel", description: "Client meeting" };
        expect(
            validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx("member", entity)).allowed
        ).toBe(true);
        expect(
            validateTransition(EXPENSE_MACHINE, "pending", "approved", ctx("director", entity))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(EXPENSE_MACHINE, "approved", "reimbursed", ctx("director", entity))
                .allowed
        ).toBe(true);
    });

    it("requires amount, category, description for pending", () => {
        const result = validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx("member", {}));
        expect(result.allowed).toBe(false);
        expect(result.requiredFields).toContain("amount");
        expect(result.requiredFields).toContain("category");
    });

    it("member can submit but not approve", () => {
        const entity = { amount: 50, category: "meals", description: "Lunch" };
        expect(
            validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx("member", entity)).allowed
        ).toBe(true);
        expect(
            validateTransition(EXPENSE_MACHINE, "pending", "approved", ctx("member")).allowed
        ).toBe(false);
    });

    it("allows rejection and revision cycle", () => {
        expect(validateTransition(EXPENSE_MACHINE, "pending", "rejected", ctx("pm")).allowed).toBe(
            true
        );
        expect(
            validateTransition(EXPENSE_MACHINE, "rejected", "draft", ctx("member")).allowed
        ).toBe(true);
    });

    it("collects updateBudget side effect on reimbursement", () => {
        const result = validateTransition(
            EXPENSE_MACHINE,
            "approved",
            "reimbursed",
            ctx("director")
        );
        expect(result.sideEffects).toContain("updateBudget");
    });
});

describe("WS-04: Estimate State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(ESTIMATE_MACHINE.initialState).toBe("draft");
        expect(ESTIMATE_MACHINE.terminalStates).toContain("converted");
        expect(ESTIMATE_MACHINE.terminalStates).toContain("expired");
    });

    it("allows full lifecycle: draft → pending_review → sent → accepted → converted", () => {
        // pending_review → sent requires director (Approve & Send)
        assertHappyPath(ESTIMATE_MACHINE, ["draft", "pending_review"], "pm");
        assertHappyPath(
            ESTIMATE_MACHINE,
            ["pending_review", "sent", "accepted", "converted"],
            "director"
        );
    });

    it("client can accept an estimate", () => {
        expect(
            validateTransition(ESTIMATE_MACHINE, "sent", "accepted", ctx("client")).allowed
        ).toBe(true);
    });
});

describe("WS-04: Purchase Order State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(PURCHASE_ORDER_MACHINE.initialState).toBe("draft");
        expect(PURCHASE_ORDER_MACHINE.terminalStates).toContain("matched");
        expect(PURCHASE_ORDER_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full lifecycle: draft → pending_approval → approved → issued → received → matched", () => {
        assertHappyPath(
            PURCHASE_ORDER_MACHINE,
            ["draft", "pending_approval", "approved", "issued", "received", "matched"],
            "director"
        );
    });

    it("allows partial receipt: issued → partially_received → received", () => {
        expect(
            validateTransition(
                PURCHASE_ORDER_MACHINE,
                "issued",
                "partially_received",
                ctx("member")
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(
                PURCHASE_ORDER_MACHINE,
                "partially_received",
                "received",
                ctx("member")
            ).allowed
        ).toBe(true);
    });

    it("allows dispute: received → disputed → received", () => {
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "received", "disputed", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "disputed", "received", ctx("director"))
                .allowed
        ).toBe(true);
    });

    it("pm cannot approve purchase orders", () => {
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "pending_approval", "approved", ctx("pm"))
                .allowed
        ).toBe(false);
    });

    it("collects notifyVendor on issue", () => {
        const result = validateTransition(PURCHASE_ORDER_MACHINE, "approved", "issued", ctx("pm"));
        expect(result.sideEffects).toContain("notifyVendor");
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-05: PEOPLE & WORKFORCE
// ═══════════════════════════════════════════════════════════════

describe("WS-05: Time Entry State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(TIME_ENTRY_MACHINE.initialState).toBe("draft");
        expect(TIME_ENTRY_MACHINE.terminalStates).toContain("invoiced");
    });

    it("allows full lifecycle: draft → submitted → approved → invoiced", () => {
        assertHappyPath(
            TIME_ENTRY_MACHINE,
            ["draft", "submitted", "approved", "invoiced"],
            "director"
        );
    });

    it("member can submit but not approve", () => {
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "draft", "submitted", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "submitted", "approved", ctx("member")).allowed
        ).toBe(false);
    });

    it("allows rejection and revision cycle", () => {
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "submitted", "rejected", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "rejected", "draft", ctx("member")).allowed
        ).toBe(true);
    });

    it("allows revoking approval", () => {
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "approved", "rejected", ctx("director")).allowed
        ).toBe(true);
    });
});

describe("WS-05: Crew Shift State Machine", () => {
    it("has correct initial state", () => {
        expect(CREW_SHIFT_MACHINE.initialState).toBe("scheduled");
    });

    it("allows full lifecycle: scheduled → confirmed → checked_in → checked_out", () => {
        assertHappyPath(
            CREW_SHIFT_MACHINE,
            ["scheduled", "confirmed", "checked_in", "checked_out"],
            "member"
        );
    });

    it("allows break cycle: checked_in → on_break → checked_in", () => {
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "checked_in", "on_break", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "on_break", "checked_in", ctx("member")).allowed
        ).toBe(true);
    });

    it("allows no_show and cancelled", () => {
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "scheduled", "no_show", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(CREW_SHIFT_MACHINE, "scheduled", "cancelled", ctx("pm")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-06: VENDOR & CONTRACTOR
// ═══════════════════════════════════════════════════════════════

describe("WS-06: Work Order State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(WORK_ORDER_MACHINE.initialState).toBe("draft");
        expect(WORK_ORDER_MACHINE.terminalStates).toContain("invoiced");
        expect(WORK_ORDER_MACHINE.terminalStates).toContain("cancelled");
        expect(WORK_ORDER_MACHINE.states).toHaveLength(13);
    });

    it("allows full lifecycle: draft → pending_approval → approved → assigned → scheduled → in_progress → pending_review → completed → invoiced", () => {
        assertHappyPath(
            WORK_ORDER_MACHINE,
            [
                "draft",
                "pending_approval",
                "approved",
                "assigned",
                "scheduled",
                "in_progress",
                "pending_review",
                "completed",
                "invoiced",
            ],
            "director"
        );
    });

    it("collaborator can start work and submit for review", () => {
        expect(
            validateTransition(WORK_ORDER_MACHINE, "scheduled", "in_progress", ctx("collaborator"))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(
                WORK_ORDER_MACHINE,
                "in_progress",
                "pending_review",
                ctx("collaborator")
            ).allowed
        ).toBe(true);
    });

    it("allows revision cycle: pending_review → revision_required → in_progress", () => {
        expect(
            validateTransition(WORK_ORDER_MACHINE, "pending_review", "revision_required", ctx("pm"))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(
                WORK_ORDER_MACHINE,
                "revision_required",
                "in_progress",
                ctx("collaborator")
            ).allowed
        ).toBe(true);
    });

    it("allows hold/resume cycle", () => {
        expect(
            validateTransition(WORK_ORDER_MACHINE, "in_progress", "on_hold", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "on_hold", "in_progress", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows dispute resolution: completed → disputed → completed", () => {
        expect(
            validateTransition(WORK_ORDER_MACHINE, "completed", "disputed", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(WORK_ORDER_MACHINE, "disputed", "completed", ctx("director")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-07: ASSETS & LOGISTICS
// ═══════════════════════════════════════════════════════════════

describe("WS-07: Asset State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(ASSET_MACHINE.initialState).toBe("available");
        expect(ASSET_MACHINE.terminalStates).toContain("decommissioned");
        expect(ASSET_MACHINE.terminalStates).toContain("lost");
    });

    it("allows reserve → checkout → transit → deploy → return cycle", () => {
        assertHappyPath(
            ASSET_MACHINE,
            ["available", "reserved", "checked_out", "in_transit", "deployed"],
            "member"
        );
        // Return via transit
        expect(
            validateTransition(ASSET_MACHINE, "deployed", "in_transit", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(ASSET_MACHINE, "in_transit", "available", ctx("member")).allowed
        ).toBe(true);
    });

    it("allows repair cycle: deployed → needs_repair → in_maintenance → available", () => {
        expect(
            validateTransition(ASSET_MACHINE, "deployed", "needs_repair", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(ASSET_MACHINE, "needs_repair", "in_maintenance", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(ASSET_MACHINE, "in_maintenance", "available", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows decommission from maintenance (director+)", () => {
        expect(
            validateTransition(ASSET_MACHINE, "in_maintenance", "decommissioned", ctx("director"))
                .allowed
        ).toBe(true);
        expect(
            validateTransition(ASSET_MACHINE, "in_maintenance", "decommissioned", ctx("pm")).allowed
        ).toBe(false);
    });

    it("allows marking lost from deployed", () => {
        expect(validateTransition(ASSET_MACHINE, "deployed", "lost", ctx("pm")).allowed).toBe(true);
    });
});

describe("WS-07: Shipment State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(SHIPMENT_MACHINE.initialState).toBe("draft");
        expect(SHIPMENT_MACHINE.terminalStates).toContain("delivered");
        expect(SHIPMENT_MACHINE.terminalStates).toContain("returned");
        expect(SHIPMENT_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full logistics lifecycle: draft → booked → picked_up → in_transit → out_for_delivery → delivered", () => {
        assertHappyPath(
            SHIPMENT_MACHINE,
            ["draft", "booked", "picked_up", "in_transit", "out_for_delivery", "delivered"],
            "member"
        );
    });

    it("allows customs hold: in_transit → at_customs → in_transit", () => {
        expect(
            validateTransition(SHIPMENT_MACHINE, "in_transit", "at_customs", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(SHIPMENT_MACHINE, "at_customs", "in_transit", ctx("pm")).allowed
        ).toBe(true);
    });

    it("collects side effects on delivery", () => {
        const result = validateTransition(
            SHIPMENT_MACHINE,
            "out_for_delivery",
            "delivered",
            ctx("member")
        );
        expect(result.sideEffects).toContain("notifyRecipient");
        expect(result.sideEffects).toContain("updateInventory");
    });

    it("allows return from delivered (process return)", () => {
        expect(
            validateTransition(SHIPMENT_MACHINE, "delivered", "returned", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows direct delivery from in_transit", () => {
        expect(
            validateTransition(SHIPMENT_MACHINE, "in_transit", "delivered", ctx("member")).allowed
        ).toBe(true);
    });
});

describe("WS-07: Rental Agreement State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(RENTAL_AGREEMENT_MACHINE.initialState).toBe("draft");
        expect(RENTAL_AGREEMENT_MACHINE.terminalStates).toContain("returned");
        expect(RENTAL_AGREEMENT_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full lifecycle: draft → pending_approval → approved → active → returned", () => {
        // pending_approval → approved requires director
        assertHappyPath(RENTAL_AGREEMENT_MACHINE, ["draft", "pending_approval"], "pm");
        assertHappyPath(
            RENTAL_AGREEMENT_MACHINE,
            ["pending_approval", "approved", "active", "returned"],
            "director"
        );
    });

    it("allows extension cycle: active → extended → active", () => {
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "active", "extended", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "extended", "active", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows overdue → returned (late)", () => {
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "active", "overdue", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(RENTAL_AGREEMENT_MACHINE, "overdue", "returned", ctx("member"))
                .allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-09: LIVE EVENT OPERATIONS
// ═══════════════════════════════════════════════════════════════

describe("WS-09: Live Event State Machine", () => {
    it("has correct initial state", () => {
        expect(LIVE_EVENT_MACHINE.initialState).toBe("planning");
    });

    it("has 12 states", () => {
        expect(LIVE_EVENT_MACHINE.states).toHaveLength(12);
    });

    it("allows full lifecycle: planning → pre_production → advancing → load_in → rehearsal → show_ready → live → strike → load_out → reconciliation → wrapped", () => {
        // show_ready → live requires guard "allGatesPassed", test with guard
        const guards = { allGatesPassed: () => true };
        assertHappyPath(
            LIVE_EVENT_MACHINE,
            ["planning", "pre_production", "advancing", "load_in", "rehearsal"],
            "pm"
        );
        // rehearsal → show_ready has guard
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "rehearsal", "show_ready", ctx("pm", {}, guards))
                .allowed
        ).toBe(true);
        assertHappyPath(
            LIVE_EVENT_MACHINE,
            ["show_ready", "live", "strike", "load_out", "reconciliation", "wrapped"],
            "pm"
        );
    });

    it("defines wrapped as terminal", () => {
        expect(isTerminalState(LIVE_EVENT_MACHINE, "wrapped")).toBe(true);
    });

    it("allows intermission cycle: live → intermission → live", () => {
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "live", "intermission", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(LIVE_EVENT_MACHINE, "intermission", "live", ctx("pm")).allowed
        ).toBe(true);
    });

    it("rehearsal → show_ready blocked without guard", () => {
        const noGuards = { allGatesPassed: () => false };
        expect(
            validateTransition(
                LIVE_EVENT_MACHINE,
                "rehearsal",
                "show_ready",
                ctx("pm", {}, noGuards)
            ).allowed
        ).toBe(false);
    });
});

describe("WS-09: ROS Cue State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(ROS_CUE_MACHINE.initialState).toBe("standby");
        expect(ROS_CUE_MACHINE.terminalStates).toContain("completed");
        expect(ROS_CUE_MACHINE.terminalStates).toContain("skipped");
    });

    it("allows full cue lifecycle: standby → warned → go → executing → completed", () => {
        assertHappyPath(
            ROS_CUE_MACHINE,
            ["standby", "warned", "go", "executing", "completed"],
            "member"
        );
    });

    it("collects postToChannel on go", () => {
        const result = validateTransition(ROS_CUE_MACHINE, "warned", "go", ctx("member"));
        expect(result.sideEffects).toContain("postToChannel");
    });

    it("allows skip from standby and warned", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "standby", "skipped", ctx("pm")).allowed).toBe(
            true
        );
        expect(validateTransition(ROS_CUE_MACHINE, "warned", "skipped", ctx("pm")).allowed).toBe(
            true
        );
    });

    it("allows hold from multiple states", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "standby", "held", ctx("pm")).allowed).toBe(
            true
        );
        expect(validateTransition(ROS_CUE_MACHINE, "warned", "held", ctx("pm")).allowed).toBe(true);
        expect(validateTransition(ROS_CUE_MACHINE, "go", "held", ctx("pm")).allowed).toBe(true);
    });

    it("allows release from hold", () => {
        expect(validateTransition(ROS_CUE_MACHINE, "held", "standby", ctx("pm")).allowed).toBe(
            true
        );
    });

    it("member cannot skip cues (only pm+)", () => {
        expect(
            validateTransition(ROS_CUE_MACHINE, "standby", "skipped", ctx("member")).allowed
        ).toBe(false);
    });
});

describe("WS-09: Readiness Gate State Machine", () => {
    it("has correct initial state", () => {
        expect(READINESS_GATE_MACHINE.initialState).toBe("not_started");
    });

    it("allows progression: not_started → in_progress → passed", () => {
        assertHappyPath(READINESS_GATE_MACHINE, ["not_started", "in_progress", "passed"], "pm");
    });

    it("allows failure and re-check cycle", () => {
        expect(
            validateTransition(READINESS_GATE_MACHINE, "in_progress", "failed", ctx("pm")).allowed
        ).toBe(true);
        expect(
            validateTransition(READINESS_GATE_MACHINE, "failed", "in_progress", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows waiver from failed or not_started (director+)", () => {
        expect(
            validateTransition(READINESS_GATE_MACHINE, "failed", "waived", ctx("director")).allowed
        ).toBe(true);
        expect(
            validateTransition(READINESS_GATE_MACHINE, "not_started", "waived", ctx("director"))
                .allowed
        ).toBe(true);
    });

    it("pm cannot waive", () => {
        expect(
            validateTransition(READINESS_GATE_MACHINE, "failed", "waived", ctx("pm")).allowed
        ).toBe(false);
    });
});

describe("WS-09: Incident State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(INCIDENT_MACHINE.initialState).toBe("reported");
        expect(INCIDENT_MACHINE.terminalStates).toContain("closed");
    });

    it("allows full lifecycle: reported → triaged → investigating → mitigating → resolved → post_mortem → closed", () => {
        assertHappyPath(
            INCIDENT_MACHINE,
            ["reported", "triaged", "investigating", "mitigating", "resolved", "post_mortem"],
            "pm"
        );
        // post_mortem → closed requires director
        expect(
            validateTransition(INCIDENT_MACHINE, "post_mortem", "closed", ctx("director")).allowed
        ).toBe(true);
    });

    it("allows direct resolve from investigating", () => {
        expect(
            validateTransition(INCIDENT_MACHINE, "investigating", "resolved", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows reopen from resolved", () => {
        expect(
            validateTransition(INCIDENT_MACHINE, "resolved", "investigating", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows close without post-mortem (director only)", () => {
        expect(
            validateTransition(INCIDENT_MACHINE, "resolved", "closed", ctx("director")).allowed
        ).toBe(true);
        expect(validateTransition(INCIDENT_MACHINE, "resolved", "closed", ctx("pm")).allowed).toBe(
            false
        );
    });

    it("collects notifySafetyTeam on triage", () => {
        const result = validateTransition(INCIDENT_MACHINE, "reported", "triaged", ctx("pm"));
        expect(result.sideEffects).toContain("notifySafetyTeam");
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-11: CREATIVE & DOCUMENTS
// ═══════════════════════════════════════════════════════════════

describe("WS-11: Document State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(DOCUMENT_MACHINE.initialState).toBe("draft");
        expect(DOCUMENT_MACHINE.terminalStates).toContain("archived");
        expect(DOCUMENT_MACHINE.terminalStates).toContain("superseded");
    });

    it("allows full lifecycle: draft → pending_review → approved → published", () => {
        assertHappyPath(
            DOCUMENT_MACHINE,
            ["draft", "pending_review", "approved", "published"],
            "pm"
        );
    });

    it("allows return cycle: pending_review → draft", () => {
        expect(
            validateTransition(DOCUMENT_MACHINE, "pending_review", "draft", ctx("pm")).allowed
        ).toBe(true);
    });

    it("allows archival from published (director only)", () => {
        expect(
            validateTransition(DOCUMENT_MACHINE, "published", "archived", ctx("director")).allowed
        ).toBe(true);
        expect(
            validateTransition(DOCUMENT_MACHINE, "published", "archived", ctx("pm")).allowed
        ).toBe(false);
    });

    it("allows supersede from published", () => {
        expect(
            validateTransition(DOCUMENT_MACHINE, "published", "superseded", ctx("pm")).allowed
        ).toBe(true);
    });

    it("member can submit for review", () => {
        expect(
            validateTransition(DOCUMENT_MACHINE, "draft", "pending_review", ctx("member")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// WS-12: LEGAL & COMPLIANCE
// ═══════════════════════════════════════════════════════════════

describe("WS-12: Rights / IP License State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(RIGHTS_MACHINE.initialState).toBe("draft");
        expect(RIGHTS_MACHINE.terminalStates).toContain("expired");
        expect(RIGHTS_MACHINE.terminalStates).toContain("revoked");
    });

    it("allows full lifecycle: draft → pending_clearance → cleared → active → expired", () => {
        assertHappyPath(
            RIGHTS_MACHINE,
            ["draft", "pending_clearance", "cleared", "active", "expired"],
            "director"
        );
    });

    it("allows dispute resolution: active → disputed → active", () => {
        expect(validateTransition(RIGHTS_MACHINE, "active", "disputed", ctx("pm")).allowed).toBe(
            true
        );
        expect(
            validateTransition(RIGHTS_MACHINE, "disputed", "active", ctx("director")).allowed
        ).toBe(true);
    });

    it("allows revocation from active or disputed", () => {
        expect(
            validateTransition(RIGHTS_MACHINE, "active", "revoked", ctx("director")).allowed
        ).toBe(true);
        expect(
            validateTransition(RIGHTS_MACHINE, "disputed", "revoked", ctx("director")).allowed
        ).toBe(true);
    });
});

describe("WS-12: Service Request State Machine", () => {
    it("has correct initial state and terminals", () => {
        expect(SERVICE_REQUEST_MACHINE.initialState).toBe("new");
        expect(SERVICE_REQUEST_MACHINE.terminalStates).toContain("closed");
        expect(SERVICE_REQUEST_MACHINE.terminalStates).toContain("cancelled");
    });

    it("allows full lifecycle: new → triaged → assigned → in_progress → resolved → closed", () => {
        assertHappyPath(
            SERVICE_REQUEST_MACHINE,
            ["new", "triaged", "assigned", "in_progress", "resolved", "closed"],
            "pm"
        );
    });

    it("allows pending info cycle with client", () => {
        expect(
            validateTransition(
                SERVICE_REQUEST_MACHINE,
                "in_progress",
                "pending_info",
                ctx("member")
            ).allowed
        ).toBe(true);
        expect(
            validateTransition(
                SERVICE_REQUEST_MACHINE,
                "pending_info",
                "in_progress",
                ctx("client")
            ).allowed
        ).toBe(true);
    });

    it("allows reopen: resolved → in_progress", () => {
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "resolved", "in_progress", ctx("client"))
                .allowed
        ).toBe(true);
    });

    it("client can close resolved requests", () => {
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "resolved", "closed", ctx("client")).allowed
        ).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// CROSS-CUTTING: Terminal state enforcement across ALL machines
// ═══════════════════════════════════════════════════════════════

describe("Cross-cutting: Terminal state enforcement", () => {
    // Terminal states with NO explicit outbound transitions — fully blocked
    const blockedTerminals: [string, Parameters<typeof isTerminalState>[0], string][] = [
        ["deal:won", DEAL_MACHINE, "won"],
        ["deal:lost", DEAL_MACHINE, "lost"],
        ["opportunity:closed_won", OPPORTUNITY_MACHINE, "closed_won"],
        ["opportunity:closed_lost", OPPORTUNITY_MACHINE, "closed_lost"],
        ["sow:completed", SOW_MACHINE, "completed"],
        ["sow:cancelled", SOW_MACHINE, "cancelled"],
        ["expense:reimbursed", EXPENSE_MACHINE, "reimbursed"],
        ["expense:void", EXPENSE_MACHINE, "void"],
        ["work_order:invoiced", WORK_ORDER_MACHINE, "invoiced"],
        ["work_order:cancelled", WORK_ORDER_MACHINE, "cancelled"],
        ["shipment:returned", SHIPMENT_MACHINE, "returned"],
        ["shipment:cancelled", SHIPMENT_MACHINE, "cancelled"],
        ["ros_cue:completed", ROS_CUE_MACHINE, "completed"],
        ["ros_cue:skipped", ROS_CUE_MACHINE, "skipped"],
        ["service_request:closed", SERVICE_REQUEST_MACHINE, "closed"],
        ["service_request:cancelled", SERVICE_REQUEST_MACHINE, "cancelled"],
        ["rights:expired", RIGHTS_MACHINE, "expired"],
        ["rights:revoked", RIGHTS_MACHINE, "revoked"],
        ["time_entry:invoiced", TIME_ENTRY_MACHINE, "invoiced"],
        ["purchase_order:matched", PURCHASE_ORDER_MACHINE, "matched"],
        ["purchase_order:cancelled", PURCHASE_ORDER_MACHINE, "cancelled"],
    ];

    it.each(blockedTerminals)(
        "%s is terminal and blocks outbound transitions",
        (_label, machine, state) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(isTerminalState(machine as any, state as any)).toBe(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const available = getAvailableTransitions(machine as any, state as any, "exec");
            expect(available).toEqual([]);
        }
    );

    // Terminal states WITH explicit outbound transitions (valid business patterns)
    it("shipment:delivered is terminal but allows explicit return transition", () => {
        expect(isTerminalState(SHIPMENT_MACHINE, "delivered")).toBe(true);
        const available = getAvailableTransitions(SHIPMENT_MACHINE, "delivered", "exec");
        expect(available.length).toBeGreaterThan(0);
        expect(available.some((t) => t.to === "returned")).toBe(true);
    });

    it("estimate:accepted is terminal but allows explicit convert transition", () => {
        expect(isTerminalState(ESTIMATE_MACHINE, "accepted")).toBe(true);
        const available = getAvailableTransitions(ESTIMATE_MACHINE, "accepted", "exec");
        expect(available.length).toBeGreaterThan(0);
        expect(available.some((t) => t.to === "converted")).toBe(true);
    });

    it("estimate:rejected is terminal but allows explicit revise transition", () => {
        expect(isTerminalState(ESTIMATE_MACHINE, "rejected")).toBe(true);
        const available = getAvailableTransitions(ESTIMATE_MACHINE, "rejected", "exec");
        expect(available.length).toBeGreaterThan(0);
        expect(available.some((t) => t.to === "draft")).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// CROSS-CUTTING: RBAC role isolation across ALL machines
// ═══════════════════════════════════════════════════════════════

describe("Cross-cutting: Client/collaborator role isolation", () => {
    it("client cannot create projects (no draft → planning)", () => {
        // Deals, SOWs, expenses, work orders — all block client from initiating
        expect(validateTransition(DEAL_MACHINE, "lead", "qualified", ctx("client")).allowed).toBe(
            false
        );
        expect(
            validateTransition(WORK_ORDER_MACHINE, "draft", "pending_approval", ctx("client"))
                .allowed
        ).toBe(false);
    });

    it("collaborator cannot approve anything", () => {
        expect(
            validateTransition(EXPENSE_MACHINE, "pending", "approved", ctx("collaborator")).allowed
        ).toBe(false);
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "submitted", "approved", ctx("collaborator"))
                .allowed
        ).toBe(false);
    });

    it("member has limited approval scope", () => {
        // Member can submit time entries but cannot approve
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "draft", "submitted", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(TIME_ENTRY_MACHINE, "submitted", "approved", ctx("member")).allowed
        ).toBe(false);
        // Member can execute cues but not skip them
        expect(
            validateTransition(ROS_CUE_MACHINE, "standby", "warned", ctx("member")).allowed
        ).toBe(true);
        expect(
            validateTransition(ROS_CUE_MACHINE, "standby", "skipped", ctx("member")).allowed
        ).toBe(false);
    });
});
