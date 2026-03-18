import { describe, expect, it } from "vitest";
import { approvalCreateSchema } from "@/lib/validation/schemas";
import {
    APPROVAL_INSTANCE_MACHINE,
    DOCUMENT_MACHINE,
    getMachineForEntity,
    SERVICE_REQUEST_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const MEMBER: TransitionContext = { userRole: "member" };
const CLIENT: TransitionContext = { userRole: "client" };

describe("Approval Validation", () => {
    it("accepts valid approval", () => {
        const r = approvalCreateSchema.safeParse({ title: "Budget Approval Q3" });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.type).toBe("production");
            expect(r.data.priority).toBe("medium");
        }
    });
    it("rejects empty title", () => {
        expect(approvalCreateSchema.safeParse({ title: "" }).success).toBe(false);
    });
    it("accepts all types", () => {
        for (const t of [
            "budget",
            "creative",
            "production",
            "vendor",
            "change_order",
            "milestone",
            "financial",
        ]) {
            expect(approvalCreateSchema.safeParse({ title: "X", type: t }).success).toBe(true);
        }
    });
    it("accepts all priorities", () => {
        for (const p of ["low", "medium", "high", "urgent"]) {
            expect(approvalCreateSchema.safeParse({ title: "X", priority: p }).success).toBe(true);
        }
    });
});

describe("Approval Instance State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("approval_instance")).toBe(APPROVAL_INSTANCE_MACHINE);
        expect(getMachineForEntity("workflow_instance")).toBe(APPROVAL_INSTANCE_MACHINE);
    });
    it("completed and cancelled are terminal", () => {
        expect(isTerminalState(APPROVAL_INSTANCE_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(APPROVAL_INSTANCE_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: pending→in_progress→completed", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "pending", "in_progress", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "completed", PM).allowed
        ).toBe(true);
    });
    it("escalation: in_progress→escalated→completed", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "escalated", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "escalated", "completed", EXEC).allowed
        ).toBe(true);
    });
    it("de-escalation: escalated→in_progress", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "escalated", "in_progress", EXEC).allowed
        ).toBe(true);
    });
    it("cancellation from any active state", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "pending", "cancelled", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "cancelled", EXEC).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "escalated", "cancelled", EXEC).allowed
        ).toBe(true);
    });
    it("member cannot cancel in_progress", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "cancelled", MEMBER)
                .allowed
        ).toBe(false);
    });
});

describe("Document State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("document")).toBe(DOCUMENT_MACHINE);
    });
    it("archived and superseded are terminal", () => {
        expect(isTerminalState(DOCUMENT_MACHINE, "archived")).toBe(true);
        expect(isTerminalState(DOCUMENT_MACHINE, "superseded")).toBe(true);
    });
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
    it("revision: pending_review→draft", () => {
        expect(validateTransition(DOCUMENT_MACHINE, "pending_review", "draft", PM).allowed).toBe(
            true
        );
    });
    it("archive: published→archived", () => {
        expect(validateTransition(DOCUMENT_MACHINE, "published", "archived", EXEC).allowed).toBe(
            true
        );
    });
    it("supersede: published→superseded", () => {
        expect(validateTransition(DOCUMENT_MACHINE, "published", "superseded", PM).allowed).toBe(
            true
        );
    });
});

describe("Service Request State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("service_request")).toBe(SERVICE_REQUEST_MACHINE);
    });
    it("closed and cancelled are terminal", () => {
        expect(isTerminalState(SERVICE_REQUEST_MACHINE, "closed")).toBe(true);
        expect(isTerminalState(SERVICE_REQUEST_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: new→triaged→assigned→in_progress→resolved→closed", () => {
        expect(validateTransition(SERVICE_REQUEST_MACHINE, "new", "triaged", PM).allowed).toBe(
            true
        );
        expect(validateTransition(SERVICE_REQUEST_MACHINE, "triaged", "assigned", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "assigned", "in_progress", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "in_progress", "resolved", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "resolved", "closed", CLIENT).allowed
        ).toBe(true);
    });
    it("info request: in_progress→pending_info→in_progress", () => {
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "in_progress", "pending_info", MEMBER)
                .allowed
        ).toBe(true);
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "pending_info", "in_progress", CLIENT)
                .allowed
        ).toBe(true);
    });
    it("reopen: resolved→in_progress", () => {
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "resolved", "in_progress", CLIENT).allowed
        ).toBe(true);
    });
});

describe("E2E: Approval Workflow", () => {
    it("Scenario: Multi-step approval with escalation", () => {
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "pending", "in_progress", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "in_progress", "escalated", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(APPROVAL_INSTANCE_MACHINE, "escalated", "completed", EXEC).allowed
        ).toBe(true);
    });
    it("Scenario: Service request with info loop", () => {
        expect(validateTransition(SERVICE_REQUEST_MACHINE, "new", "triaged", PM).allowed).toBe(
            true
        );
        expect(validateTransition(SERVICE_REQUEST_MACHINE, "triaged", "assigned", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "assigned", "in_progress", MEMBER).allowed
        ).toBe(true);
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "in_progress", "pending_info", MEMBER)
                .allowed
        ).toBe(true);
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "pending_info", "in_progress", CLIENT)
                .allowed
        ).toBe(true);
        expect(
            validateTransition(SERVICE_REQUEST_MACHINE, "in_progress", "resolved", MEMBER).allowed
        ).toBe(true);
        expect(validateTransition(SERVICE_REQUEST_MACHINE, "resolved", "closed", PM).allowed).toBe(
            true
        );
    });
});
