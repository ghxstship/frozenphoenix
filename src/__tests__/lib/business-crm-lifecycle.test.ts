import { describe, expect, it } from "vitest";
import { dealCreateSchema } from "@/lib/validation/schemas";
import { opportunityCreateSchema } from "@/lib/validation/entity-schemas";
import {
    CHANGE_ORDER_MACHINE,
    DEAL_MACHINE,
    ESTIMATE_MACHINE,
    getMachineForEntity,
    LEAD_MACHINE,
    OPPORTUNITY_MACHINE,
    PROPOSAL_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const _DIR: TransitionContext = { userRole: "director" };
const MEMBER: TransitionContext = { userRole: "member" };
const CLIENT: TransitionContext = { userRole: "client" };

// ═══════════════════════════════════════════════════════════════
// DEAL VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Deal Validation", () => {
    it("accepts minimal deal", () => {
        const r = dealCreateSchema.safeParse({
            title: "Festival Sponsorship",
            company_name: "Acme",
            value: 10000,
        });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.stage).toBe("lead");
            expect(r.data.probability).toBe(50);
        }
    });
    it("rejects empty title", () => {
        expect(dealCreateSchema.safeParse({ title: "", company_name: "X", value: 0 }).success).toBe(
            false
        );
    });
    it("rejects empty company_name", () => {
        expect(dealCreateSchema.safeParse({ title: "X", company_name: "", value: 0 }).success).toBe(
            false
        );
    });
    it("rejects negative value", () => {
        expect(
            dealCreateSchema.safeParse({ title: "X", company_name: "X", value: -1 }).success
        ).toBe(false);
    });
    it("rejects probability > 100", () => {
        expect(
            dealCreateSchema.safeParse({
                title: "X",
                company_name: "X",
                value: 0,
                probability: 101,
            }).success
        ).toBe(false);
    });
    it("rejects probability < 0", () => {
        expect(
            dealCreateSchema.safeParse({ title: "X", company_name: "X", value: 0, probability: -1 })
                .success
        ).toBe(false);
    });
    it("rejects invalid stage", () => {
        expect(
            dealCreateSchema.safeParse({ title: "X", company_name: "X", value: 0, stage: "fake" })
                .success
        ).toBe(false);
    });
    it("accepts all valid stages", () => {
        for (const s of [
            "lead",
            "qualified",
            "proposal",
            "negotiation",
            "closed_won",
            "closed_lost",
        ]) {
            expect(
                dealCreateSchema.safeParse({ title: "X", company_name: "X", value: 0, stage: s })
                    .success
            ).toBe(true);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITY VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Opportunity Validation", () => {
    it("accepts minimal opportunity", () => {
        const r = opportunityCreateSchema.safeParse({ title: "Main Stage Sponsorship" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.stage).toBe("identified");
            expect(r.data.probability).toBe(20);
        }
    });
    it("rejects empty title", () => {
        expect(opportunityCreateSchema.safeParse({ title: "" }).success).toBe(false);
    });
    it("accepts all valid stages", () => {
        for (const s of [
            "identified",
            "qualified",
            "proposal",
            "negotiation",
            "verbal_commit",
            "won",
            "lost",
            "dormant",
        ]) {
            expect(opportunityCreateSchema.safeParse({ title: "X", stage: s }).success).toBe(true);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// LEAD STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Lead State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("lead")).toBe(LEAD_MACHINE);
    });
    it("initial state is new", () => {
        expect(LEAD_MACHINE.initialState).toBe("new");
    });
    it("has 6 states", () => {
        expect(LEAD_MACHINE.states).toHaveLength(6);
    });
    it("converted and disqualified are terminal", () => {
        expect(isTerminalState(LEAD_MACHINE, "converted")).toBe(true);
        expect(isTerminalState(LEAD_MACHINE, "disqualified")).toBe(true);
    });
    it("happy path: new→contacted→qualified→converted", () => {
        const path = ["new", "contacted", "qualified", "converted"] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(validateTransition(LEAD_MACHINE, path[i]!, path[i + 1]!, PM).allowed).toBe(true);
        }
    });
    it("nurture path: contacted→nurturing→qualified→converted", () => {
        expect(validateTransition(LEAD_MACHINE, "contacted", "nurturing", PM).allowed).toBe(true);
        expect(validateTransition(LEAD_MACHINE, "nurturing", "qualified", PM).allowed).toBe(true);
    });
    it("can disqualify from any non-terminal state", () => {
        for (const s of ["new", "contacted", "nurturing", "qualified"] as const) {
            expect(validateTransition(LEAD_MACHINE, s, "disqualified", PM).allowed).toBe(true);
        }
    });
    it("cannot transition from converted", () => {
        expect(validateTransition(LEAD_MACHINE, "converted", "new", PM).allowed).toBe(false);
    });
    it("conversion triggers createDeal side effect", () => {
        const r = validateTransition(LEAD_MACHINE, "qualified", "converted", PM);
        expect(r.sideEffects).toContain("createDeal");
    });
    it("member can contact but not qualify", () => {
        expect(validateTransition(LEAD_MACHINE, "new", "contacted", MEMBER).allowed).toBe(true);
        expect(validateTransition(LEAD_MACHINE, "contacted", "qualified", MEMBER).allowed).toBe(
            false
        );
    });
});

// ═══════════════════════════════════════════════════════════════
// DEAL STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Deal State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("deal")).toBe(DEAL_MACHINE);
    });
    it("initial state is lead", () => {
        expect(DEAL_MACHINE.initialState).toBe("lead");
    });
    it("won and lost are terminal", () => {
        expect(isTerminalState(DEAL_MACHINE, "won")).toBe(true);
        expect(isTerminalState(DEAL_MACHINE, "lost")).toBe(true);
    });
    it("happy path: lead→qualified→proposal→negotiation→won", () => {
        const path = ["lead", "qualified", "proposal", "negotiation", "won"] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(validateTransition(DEAL_MACHINE, path[i]!, path[i + 1]!, PM).allowed).toBe(true);
        }
    });
    it("can lose from any non-terminal state", () => {
        for (const s of ["lead", "qualified", "proposal", "negotiation"] as const) {
            expect(validateTransition(DEAL_MACHINE, s, "lost", PM).allowed).toBe(true);
        }
    });
    it("proposal→qualified allows revision", () => {
        expect(validateTransition(DEAL_MACHINE, "proposal", "qualified", PM).allowed).toBe(true);
    });
    it("negotiation→proposal allows resend", () => {
        expect(validateTransition(DEAL_MACHINE, "negotiation", "proposal", PM).allowed).toBe(true);
    });
    it("won triggers createProject side effect", () => {
        const r = validateTransition(DEAL_MACHINE, "negotiation", "won", PM);
        expect(r.sideEffects).toContain("createProject");
    });
});

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITY STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Opportunity State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("opportunity")).toBe(OPPORTUNITY_MACHINE);
    });
    it("initial state is discovery", () => {
        expect(OPPORTUNITY_MACHINE.initialState).toBe("discovery");
    });
    it("closed_won and closed_lost are terminal", () => {
        expect(isTerminalState(OPPORTUNITY_MACHINE, "closed_won")).toBe(true);
        expect(isTerminalState(OPPORTUNITY_MACHINE, "closed_lost")).toBe(true);
    });
    it("happy path: discovery→qualification→proposal_sent→negotiation→verbal_commit→contract_out→closed_won", () => {
        const path = [
            "discovery",
            "qualification",
            "proposal_sent",
            "negotiation",
            "verbal_commit",
            "contract_out",
            "closed_won",
        ] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(
                validateTransition(OPPORTUNITY_MACHINE, path[i]!, path[i + 1]!, PM).allowed
            ).toBe(true);
        }
    });
    it("can lose from any pipeline stage", () => {
        for (const s of ["discovery", "qualification", "proposal_sent", "negotiation"] as const) {
            expect(validateTransition(OPPORTUNITY_MACHINE, s, "closed_lost", PM).allowed).toBe(
                true
            );
        }
    });
    it("can put on hold from pipeline stages", () => {
        for (const s of ["discovery", "qualification", "proposal_sent", "negotiation"] as const) {
            expect(validateTransition(OPPORTUNITY_MACHINE, s, "on_hold", PM).allowed).toBe(true);
        }
    });
    it("on_hold resumes to discovery", () => {
        expect(validateTransition(OPPORTUNITY_MACHINE, "on_hold", "discovery", PM).allowed).toBe(
            true
        );
    });
    it("closed_won triggers createProject", () => {
        const r = validateTransition(OPPORTUNITY_MACHINE, "contract_out", "closed_won", PM);
        expect(r.sideEffects).toContain("createProject");
    });
});

// ═══════════════════════════════════════════════════════════════
// PROPOSAL STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Proposal State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("proposal")).toBe(PROPOSAL_MACHINE);
    });
    it("initial state is draft", () => {
        expect(PROPOSAL_MACHINE.initialState).toBe("draft");
    });
    it("accepted, rejected, expired are terminal", () => {
        expect(isTerminalState(PROPOSAL_MACHINE, "accepted")).toBe(true);
        expect(isTerminalState(PROPOSAL_MACHINE, "rejected")).toBe(true);
        expect(isTerminalState(PROPOSAL_MACHINE, "expired")).toBe(true);
    });
    it("happy path: draft→internal_review→sent→negotiation→accepted", () => {
        const path = ["draft", "internal_review", "sent", "negotiation", "accepted"] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(validateTransition(PROPOSAL_MACHINE, path[i]!, path[i + 1]!, EXEC).allowed).toBe(
                true
            );
        }
    });
    it("internal_review→draft for revision", () => {
        expect(validateTransition(PROPOSAL_MACHINE, "internal_review", "draft", EXEC).allowed).toBe(
            true
        );
    });
    it("PM cannot send to client (only exec/director)", () => {
        expect(validateTransition(PROPOSAL_MACHINE, "internal_review", "sent", PM).allowed).toBe(
            false
        );
    });
    it("accepted triggers createContract", () => {
        const r = validateTransition(PROPOSAL_MACHINE, "negotiation", "accepted", EXEC);
        expect(r.sideEffects).toContain("createContract");
    });
});

// ═══════════════════════════════════════════════════════════════
// ESTIMATE STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Estimate State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("estimate")).toBe(ESTIMATE_MACHINE);
    });
    it("initial state is draft", () => {
        expect(ESTIMATE_MACHINE.initialState).toBe("draft");
    });
    it("happy path: draft→pending_review→sent→accepted→converted", () => {
        const path = ["draft", "pending_review"] as const;
        expect(validateTransition(ESTIMATE_MACHINE, path[0], path[1], PM).allowed).toBe(true);
        expect(validateTransition(ESTIMATE_MACHINE, "pending_review", "sent", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(ESTIMATE_MACHINE, "sent", "accepted", CLIENT).allowed).toBe(true);
        expect(validateTransition(ESTIMATE_MACHINE, "accepted", "converted", PM).allowed).toBe(
            true
        );
    });
    it("rejected→draft allows revision", () => {
        expect(validateTransition(ESTIMATE_MACHINE, "rejected", "draft", PM).allowed).toBe(true);
    });
    it("client can accept or reject", () => {
        expect(validateTransition(ESTIMATE_MACHINE, "sent", "accepted", CLIENT).allowed).toBe(true);
        expect(validateTransition(ESTIMATE_MACHINE, "sent", "rejected", CLIENT).allowed).toBe(true);
    });
    it("converted triggers createProject", () => {
        const r = validateTransition(ESTIMATE_MACHINE, "accepted", "converted", PM);
        expect(r.sideEffects).toContain("createProject");
    });
});

// ═══════════════════════════════════════════════════════════════
// CHANGE ORDER STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Change Order State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("change_order")).toBe(CHANGE_ORDER_MACHINE);
    });
    it("initial state is draft", () => {
        expect(CHANGE_ORDER_MACHINE.initialState).toBe("draft");
    });
    it("implemented, rejected, cancelled are terminal", () => {
        expect(isTerminalState(CHANGE_ORDER_MACHINE, "implemented")).toBe(true);
        expect(isTerminalState(CHANGE_ORDER_MACHINE, "rejected")).toBe(true);
        expect(isTerminalState(CHANGE_ORDER_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: draft→submitted→under_review→approved→implemented", () => {
        const path = ["draft", "submitted", "under_review", "approved", "implemented"] as const;
        expect(validateTransition(CHANGE_ORDER_MACHINE, path[0], path[1], PM).allowed).toBe(true);
        expect(validateTransition(CHANGE_ORDER_MACHINE, path[1], path[2], EXEC).allowed).toBe(true);
        expect(validateTransition(CHANGE_ORDER_MACHINE, path[2], path[3], EXEC).allowed).toBe(true);
        expect(validateTransition(CHANGE_ORDER_MACHINE, path[3], path[4], PM).allowed).toBe(true);
    });
    it("under_review→draft for revision", () => {
        expect(
            validateTransition(CHANGE_ORDER_MACHINE, "under_review", "draft", EXEC).allowed
        ).toBe(true);
    });
    it("approval triggers updateBudget", () => {
        const r = validateTransition(CHANGE_ORDER_MACHINE, "under_review", "approved", EXEC);
        expect(r.sideEffects).toContain("updateBudget");
    });
    it("PM cannot approve (only exec/director)", () => {
        expect(
            validateTransition(CHANGE_ORDER_MACHINE, "under_review", "approved", PM).allowed
        ).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// E2E: FULL CRM LIFECYCLE
// ═══════════════════════════════════════════════════════════════

describe("E2E: Lead → Deal → Proposal → Contract", () => {
    it("Scenario A: Full win path", () => {
        // Lead lifecycle
        expect(validateTransition(LEAD_MACHINE, "new", "contacted", PM).allowed).toBe(true);
        expect(validateTransition(LEAD_MACHINE, "contacted", "qualified", PM).allowed).toBe(true);
        expect(validateTransition(LEAD_MACHINE, "qualified", "converted", PM).allowed).toBe(true);
        // Deal lifecycle
        expect(validateTransition(DEAL_MACHINE, "lead", "qualified", PM).allowed).toBe(true);
        expect(validateTransition(DEAL_MACHINE, "qualified", "proposal", PM).allowed).toBe(true);
        expect(validateTransition(DEAL_MACHINE, "proposal", "negotiation", PM).allowed).toBe(true);
        expect(validateTransition(DEAL_MACHINE, "negotiation", "won", PM).allowed).toBe(true);
        // Proposal lifecycle
        expect(validateTransition(PROPOSAL_MACHINE, "draft", "internal_review", PM).allowed).toBe(
            true
        );
        expect(validateTransition(PROPOSAL_MACHINE, "internal_review", "sent", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(PROPOSAL_MACHINE, "sent", "negotiation", PM).allowed).toBe(true);
        expect(validateTransition(PROPOSAL_MACHINE, "negotiation", "accepted", EXEC).allowed).toBe(
            true
        );
    });

    it("Scenario B: Loss at negotiation stage", () => {
        expect(validateTransition(DEAL_MACHINE, "negotiation", "lost", PM).allowed).toBe(true);
        expect(isTerminalState(DEAL_MACHINE, "lost")).toBe(true);
    });

    it("Scenario C: Proposal revision cycle", () => {
        expect(validateTransition(PROPOSAL_MACHINE, "internal_review", "draft", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(PROPOSAL_MACHINE, "draft", "internal_review", PM).allowed).toBe(
            true
        );
        expect(validateTransition(PROPOSAL_MACHINE, "negotiation", "sent", PM).allowed).toBe(true);
    });

    it("Scenario D: Estimate conversion to project", () => {
        expect(validateTransition(ESTIMATE_MACHINE, "draft", "pending_review", PM).allowed).toBe(
            true
        );
        expect(validateTransition(ESTIMATE_MACHINE, "pending_review", "sent", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(ESTIMATE_MACHINE, "sent", "accepted", CLIENT).allowed).toBe(true);
        const r = validateTransition(ESTIMATE_MACHINE, "accepted", "converted", PM);
        expect(r.allowed).toBe(true);
        expect(r.sideEffects).toContain("createProject");
    });
});
