import { describe, expect, it } from "vitest";
import { contractCreateSchema } from "@/lib/validation/schemas";
import {
    CONTRACT_MACHINE,
    getMachineForEntity,
    INCIDENT_MACHINE,
    PERMIT_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const MEMBER: TransitionContext = { userRole: "member" };

describe("Contract Validation", () => {
    it("accepts valid contract", () => {
        const r = contractCreateSchema.safeParse({ title: "MSA — Acme Events" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.type).toBe("msa");
            expect(r.data.status).toBe("draft");
        }
    });
    it("rejects empty title", () => {
        expect(contractCreateSchema.safeParse({ title: "" }).success).toBe(false);
    });
    it("accepts all valid types", () => {
        for (const t of [
            "msa",
            "sow",
            "nda",
            "vendor",
            "client",
            "amendment",
            "addendum",
            "other",
        ]) {
            expect(contractCreateSchema.safeParse({ title: "X", type: t }).success).toBe(true);
        }
    });
    it("accepts all valid statuses", () => {
        for (const s of [
            "draft",
            "pending_review",
            "pending_signature",
            "active",
            "expired",
            "terminated",
            "renewed",
        ]) {
            expect(contractCreateSchema.safeParse({ title: "X", status: s }).success).toBe(true);
        }
    });
    it("rejects negative value", () => {
        expect(contractCreateSchema.safeParse({ title: "X", value: -1 }).success).toBe(false);
    });
});

describe("Contract State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("contract")).toBe(CONTRACT_MACHINE);
    });
    it("expired and terminated are terminal", () => {
        expect(isTerminalState(CONTRACT_MACHINE, "expired")).toBe(true);
        expect(isTerminalState(CONTRACT_MACHINE, "terminated")).toBe(true);
    });
    it("happy path: draft→pending_review→pending_signature→active", () => {
        const entity = {
            title: "MSA",
            contract_type: "msa",
            start_date: "2026-01-01",
            end_date: "2027-01-01",
        };
        const ctx: TransitionContext = { userRole: "exec", entity };
        expect(validateTransition(CONTRACT_MACHINE, "draft", "pending_review", ctx).allowed).toBe(
            true
        );
        expect(
            validateTransition(CONTRACT_MACHINE, "pending_review", "pending_signature", ctx).allowed
        ).toBe(true);
        expect(
            validateTransition(CONTRACT_MACHINE, "pending_signature", "active", ctx).allowed
        ).toBe(true);
    });
    it("requires title+contract_type+start_date for review", () => {
        const ctx: TransitionContext = { userRole: "pm", entity: {} };
        const r = validateTransition(CONTRACT_MACHINE, "draft", "pending_review", ctx);
        expect(r.allowed).toBe(false);
        expect(r.requiredFields).toContain("title");
    });
    it("PM cannot send for signature (only exec/director)", () => {
        expect(
            validateTransition(CONTRACT_MACHINE, "pending_review", "pending_signature", PM).allowed
        ).toBe(false);
    });
    it("active→expired", () => {
        expect(validateTransition(CONTRACT_MACHINE, "active", "expired", EXEC).allowed).toBe(true);
    });
    it("active→terminated triggers notifications", () => {
        const r = validateTransition(CONTRACT_MACHINE, "active", "terminated", EXEC);
        expect(r.allowed).toBe(true);
        expect(r.sideEffects).toContain("notifyStakeholders");
    });
    it("pending_review→draft for revision", () => {
        expect(validateTransition(CONTRACT_MACHINE, "pending_review", "draft", PM).allowed).toBe(
            true
        );
    });
});

describe("Permit State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("permit")).toBe(PERMIT_MACHINE);
    });
    it("rejected, expired, revoked are terminal", () => {
        expect(isTerminalState(PERMIT_MACHINE, "rejected")).toBe(true);
        expect(isTerminalState(PERMIT_MACHINE, "expired")).toBe(true);
        expect(isTerminalState(PERMIT_MACHINE, "revoked")).toBe(true);
    });
    it("happy path: draft→submitted→under_review→approved", () => {
        expect(validateTransition(PERMIT_MACHINE, "draft", "submitted", MEMBER).allowed).toBe(true);
        expect(validateTransition(PERMIT_MACHINE, "submitted", "under_review", PM).allowed).toBe(
            true
        );
        expect(validateTransition(PERMIT_MACHINE, "under_review", "approved", EXEC).allowed).toBe(
            true
        );
    });
    it("approved→expired", () => {
        expect(validateTransition(PERMIT_MACHINE, "approved", "expired", PM).allowed).toBe(true);
    });
    it("approved→revoked (exec only)", () => {
        expect(validateTransition(PERMIT_MACHINE, "approved", "revoked", EXEC).allowed).toBe(true);
        expect(validateTransition(PERMIT_MACHINE, "approved", "revoked", PM).allowed).toBe(false);
    });
    it("revision cycle: under_review→draft→submitted", () => {
        expect(validateTransition(PERMIT_MACHINE, "under_review", "draft", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(PERMIT_MACHINE, "draft", "submitted", PM).allowed).toBe(true);
    });
});

describe("Incident State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("incident")).toBe(INCIDENT_MACHINE);
    });
    it("closed is terminal", () => {
        expect(isTerminalState(INCIDENT_MACHINE, "closed")).toBe(true);
    });
    it("has 7 states", () => {
        expect(INCIDENT_MACHINE.states).toHaveLength(7);
    });
    it("happy path: reported→triaged→investigating→mitigating→resolved→post_mortem→closed", () => {
        const path = [
            "reported",
            "triaged",
            "investigating",
            "mitigating",
            "resolved",
            "post_mortem",
            "closed",
        ] as const;
        for (let i = 0; i < path.length - 1; i++) {
            const role = i >= 5 ? "exec" : "pm";
            expect(
                validateTransition(INCIDENT_MACHINE, path[i]!, path[i + 1]!, {
                    userRole: role,
                } as TransitionContext).allowed
            ).toBe(true);
        }
    });
    it("resolved→closed without post-mortem (exec only)", () => {
        expect(validateTransition(INCIDENT_MACHINE, "resolved", "closed", EXEC).allowed).toBe(true);
    });
    it("resolved→investigating (reopen)", () => {
        expect(validateTransition(INCIDENT_MACHINE, "resolved", "investigating", PM).allowed).toBe(
            true
        );
    });
    it("triage triggers notifySafetyTeam", () => {
        const r = validateTransition(INCIDENT_MACHINE, "reported", "triaged", PM);
        expect(r.sideEffects).toContain("notifySafetyTeam");
    });
    it("member can report and triage but cannot close", () => {
        expect(validateTransition(INCIDENT_MACHINE, "reported", "triaged", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(INCIDENT_MACHINE, "post_mortem", "closed", MEMBER).allowed).toBe(
            false
        );
    });
});

describe("E2E: Legal Lifecycle", () => {
    it("Scenario A: Contract→active→terminated on incident", () => {
        const entity = {
            title: "Vendor MSA",
            contract_type: "vendor",
            start_date: "2026-01-01",
            end_date: "2027-01-01",
        };
        const ctx: TransitionContext = { userRole: "exec", entity };
        expect(validateTransition(CONTRACT_MACHINE, "draft", "pending_review", ctx).allowed).toBe(
            true
        );
        expect(
            validateTransition(CONTRACT_MACHINE, "pending_review", "pending_signature", ctx).allowed
        ).toBe(true);
        expect(
            validateTransition(CONTRACT_MACHINE, "pending_signature", "active", ctx).allowed
        ).toBe(true);
        expect(validateTransition(CONTRACT_MACHINE, "active", "terminated", ctx).allowed).toBe(
            true
        );
    });

    it("Scenario B: Permit lifecycle with rejection and resubmission", () => {
        expect(validateTransition(PERMIT_MACHINE, "draft", "submitted", PM).allowed).toBe(true);
        expect(validateTransition(PERMIT_MACHINE, "submitted", "under_review", PM).allowed).toBe(
            true
        );
        expect(validateTransition(PERMIT_MACHINE, "under_review", "draft", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(PERMIT_MACHINE, "draft", "submitted", PM).allowed).toBe(true);
        expect(validateTransition(PERMIT_MACHINE, "submitted", "under_review", PM).allowed).toBe(
            true
        );
        expect(validateTransition(PERMIT_MACHINE, "under_review", "approved", EXEC).allowed).toBe(
            true
        );
    });

    it("Scenario C: Incident full lifecycle with post-mortem", () => {
        expect(validateTransition(INCIDENT_MACHINE, "reported", "triaged", MEMBER).allowed).toBe(
            true
        );
        expect(validateTransition(INCIDENT_MACHINE, "triaged", "investigating", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(INCIDENT_MACHINE, "investigating", "mitigating", PM).allowed
        ).toBe(true);
        expect(validateTransition(INCIDENT_MACHINE, "mitigating", "resolved", PM).allowed).toBe(
            true
        );
        expect(validateTransition(INCIDENT_MACHINE, "resolved", "post_mortem", PM).allowed).toBe(
            true
        );
        expect(validateTransition(INCIDENT_MACHINE, "post_mortem", "closed", EXEC).allowed).toBe(
            true
        );
    });
});
