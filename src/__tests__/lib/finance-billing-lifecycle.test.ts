import { describe, expect, it } from "vitest";
import { budgetCreateSchema, invoiceCreateSchema } from "@/lib/validation/schemas";
import { expenseCreateSchema } from "@/lib/validation/entity-schemas";
import {
    CLIENT_INVOICE_MACHINE,
    EXPENSE_MACHINE,
    getMachineForEntity,
    INVOICE_MACHINE,
    PAYMENT_MACHINE,
    PURCHASE_ORDER_MACHINE,
} from "@/lib/state-machines";
import { isTerminalState, validateTransition } from "@/lib/state-machine";
import type { TransitionContext } from "@/lib/state-machine";

const PM: TransitionContext = { userRole: "pm" };
const EXEC: TransitionContext = { userRole: "exec" };
const MEMBER: TransitionContext = { userRole: "member" };
const CLIENT: TransitionContext = { userRole: "client" };
const UUID = "550e8400-e29b-41d4-a716-446655440000";

// ═══════════════════════════════════════════════════════════════
// INVOICE VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Invoice Validation", () => {
    it("accepts valid invoice", () => {
        const r = invoiceCreateSchema.safeParse({
            invoice_number: "INV-001",
            amount: 5000,
            due_date: "2026-07-15",
        });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.status).toBe("draft");
            expect(r.data.currency).toBe("USD");
        }
    });
    it("rejects empty invoice_number", () => {
        expect(
            invoiceCreateSchema.safeParse({
                invoice_number: "",
                amount: 100,
                due_date: "2026-07-15",
            }).success
        ).toBe(false);
    });
    it("rejects zero amount", () => {
        expect(
            invoiceCreateSchema.safeParse({
                invoice_number: "X",
                amount: 0,
                due_date: "2026-07-15",
            }).success
        ).toBe(false);
    });
    it("rejects negative amount", () => {
        expect(
            invoiceCreateSchema.safeParse({
                invoice_number: "X",
                amount: -1,
                due_date: "2026-07-15",
            }).success
        ).toBe(false);
    });
    it("rejects invalid status", () => {
        expect(
            invoiceCreateSchema.safeParse({
                invoice_number: "X",
                amount: 1,
                due_date: "2026-07-15",
                status: "fake",
            }).success
        ).toBe(false);
    });
    it("accepts all valid statuses", () => {
        for (const s of ["draft", "sent", "paid", "overdue", "cancelled", "void"]) {
            expect(
                invoiceCreateSchema.safeParse({
                    invoice_number: "X",
                    amount: 1,
                    due_date: "2026-07-15",
                    status: s,
                }).success
            ).toBe(true);
        }
    });
    it("accepts optional vendor_id and project_id", () => {
        const r = invoiceCreateSchema.safeParse({
            invoice_number: "X",
            amount: 1,
            due_date: "2026-07-15",
            vendor_id: UUID,
            project_id: UUID,
        });
        expect(r.success).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// EXPENSE VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Expense Validation", () => {
    it("accepts valid expense", () => {
        const r = expenseCreateSchema.safeParse({
            description: "Hotel",
            amount: 250,
            category: "travel",
            expense_date: "2026-07-01",
        });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.status).toBe("draft");
        }
    });
    it("rejects zero amount", () => {
        expect(
            expenseCreateSchema.safeParse({
                description: "X",
                amount: 0,
                category: "X",
                expense_date: "2026-07-01",
            }).success
        ).toBe(false);
    });
    it("rejects missing date", () => {
        expect(
            expenseCreateSchema.safeParse({ description: "X", amount: 1, category: "X" }).success
        ).toBe(false);
    });
    it("accepts all valid statuses", () => {
        for (const s of ["draft", "submitted", "approved", "rejected", "reimbursed"]) {
            expect(
                expenseCreateSchema.safeParse({
                    description: "X",
                    amount: 1,
                    category: "X",
                    expense_date: "2026-07-01",
                    status: s,
                }).success
            ).toBe(true);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// BUDGET VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Budget Validation", () => {
    it("accepts valid budget", () => {
        const r = budgetCreateSchema.safeParse({ name: "Main Stage Budget", total_amount: 100000 });
        expect(r.success).toBe(true);
        if (r.success) {
            expect(r.data.status).toBe("draft");
            expect(r.data.currency).toBe("USD");
        }
    });
    it("rejects empty name", () => {
        expect(budgetCreateSchema.safeParse({ name: "", total_amount: 1 }).success).toBe(false);
    });
    it("rejects zero amount", () => {
        expect(budgetCreateSchema.safeParse({ name: "X", total_amount: 0 }).success).toBe(false);
    });
    it("rejects negative amount", () => {
        expect(budgetCreateSchema.safeParse({ name: "X", total_amount: -1 }).success).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════
// INVOICE STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Invoice State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("invoice")).toBe(INVOICE_MACHINE);
    });
    it("has 10 states", () => {
        expect(INVOICE_MACHINE.states).toHaveLength(10);
    });
    it("paid, void, written_off are terminal", () => {
        expect(isTerminalState(INVOICE_MACHINE, "paid")).toBe(true);
        expect(isTerminalState(INVOICE_MACHINE, "void")).toBe(true);
        expect(isTerminalState(INVOICE_MACHINE, "written_off")).toBe(true);
    });
    it("happy path: draft→pending→approved→sent→paid", () => {
        const path = ["draft", "pending", "approved", "sent", "paid"] as const;
        for (let i = 0; i < path.length - 1; i++) {
            expect(validateTransition(INVOICE_MACHINE, path[i]!, path[i + 1]!, EXEC).allowed).toBe(
                true
            );
        }
    });
    it("partial payment path: sent→partially_paid→paid", () => {
        expect(validateTransition(INVOICE_MACHINE, "sent", "partially_paid", PM).allowed).toBe(
            true
        );
        expect(validateTransition(INVOICE_MACHINE, "partially_paid", "paid", PM).allowed).toBe(
            true
        );
    });
    it("overdue path: sent→overdue→paid", () => {
        expect(validateTransition(INVOICE_MACHINE, "sent", "overdue", PM).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "overdue", "paid", PM).allowed).toBe(true);
    });
    it("dispute path: sent→disputed→sent (resolved)", () => {
        expect(validateTransition(INVOICE_MACHINE, "sent", "disputed", CLIENT).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "disputed", "sent", EXEC).allowed).toBe(true);
    });
    it("disputed→void", () => {
        expect(validateTransition(INVOICE_MACHINE, "disputed", "void", EXEC).allowed).toBe(true);
    });
    it("only exec can write off", () => {
        expect(validateTransition(INVOICE_MACHINE, "overdue", "written_off", EXEC).allowed).toBe(
            true
        );
        expect(validateTransition(INVOICE_MACHINE, "overdue", "written_off", PM).allowed).toBe(
            false
        );
    });
    it("paid triggers updateRevenue", () => {
        const r = validateTransition(INVOICE_MACHINE, "sent", "paid", PM);
        expect(r.sideEffects).toContain("updateRevenue");
    });
});

// ═══════════════════════════════════════════════════════════════
// EXPENSE STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Expense State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("expense")).toBe(EXPENSE_MACHINE);
    });
    it("reimbursed and void are terminal", () => {
        expect(isTerminalState(EXPENSE_MACHINE, "reimbursed")).toBe(true);
        expect(isTerminalState(EXPENSE_MACHINE, "void")).toBe(true);
    });
    it("happy path: draft→pending→approved→reimbursed", () => {
        const entity = { amount: 100, category: "travel", description: "Hotel" };
        const ctx: TransitionContext = { userRole: "pm", entity };
        expect(validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx).allowed).toBe(true);
        expect(validateTransition(EXPENSE_MACHINE, "pending", "approved", ctx).allowed).toBe(true);
        expect(validateTransition(EXPENSE_MACHINE, "approved", "reimbursed", EXEC).allowed).toBe(
            true
        );
    });
    it("rejection cycle: pending→rejected→draft→pending", () => {
        expect(validateTransition(EXPENSE_MACHINE, "pending", "rejected", PM).allowed).toBe(true);
        expect(validateTransition(EXPENSE_MACHINE, "rejected", "draft", MEMBER).allowed).toBe(true);
    });
    it("member can submit and void draft", () => {
        const entity = { amount: 50, category: "food", description: "Lunch" };
        const ctx: TransitionContext = { userRole: "member", entity };
        expect(validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx).allowed).toBe(true);
        expect(validateTransition(EXPENSE_MACHINE, "draft", "void", ctx).allowed).toBe(true);
    });
    it("requires amount/category/description for pending", () => {
        const ctx: TransitionContext = { userRole: "pm", entity: {} };
        const r = validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx);
        expect(r.allowed).toBe(false);
        expect(r.requiredFields).toContain("amount");
    });
    it("reimbursed triggers updateBudget", () => {
        const r = validateTransition(EXPENSE_MACHINE, "approved", "reimbursed", EXEC);
        expect(r.sideEffects).toContain("updateBudget");
    });
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Payment State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("payment")).toBe(PAYMENT_MACHINE);
    });
    it("completed, refunded, cancelled are terminal", () => {
        expect(isTerminalState(PAYMENT_MACHINE, "completed")).toBe(true);
        expect(isTerminalState(PAYMENT_MACHINE, "refunded")).toBe(true);
        expect(isTerminalState(PAYMENT_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: pending→processing→completed", () => {
        expect(validateTransition(PAYMENT_MACHINE, "pending", "processing", PM).allowed).toBe(true);
        expect(validateTransition(PAYMENT_MACHINE, "processing", "completed", EXEC).allowed).toBe(
            true
        );
    });
    it("failure+retry: processing→failed→processing→completed", () => {
        expect(validateTransition(PAYMENT_MACHINE, "processing", "failed", PM).allowed).toBe(true);
        expect(validateTransition(PAYMENT_MACHINE, "failed", "processing", PM).allowed).toBe(true);
    });
    it("refund from completed", () => {
        expect(validateTransition(PAYMENT_MACHINE, "completed", "refunded", EXEC).allowed).toBe(
            true
        );
    });
    it("PM cannot confirm payment (only exec/director)", () => {
        expect(validateTransition(PAYMENT_MACHINE, "processing", "completed", PM).allowed).toBe(
            false
        );
    });
    it("completed triggers updateInvoice", () => {
        const r = validateTransition(PAYMENT_MACHINE, "processing", "completed", EXEC);
        expect(r.sideEffects).toContain("updateInvoice");
    });
});

// ═══════════════════════════════════════════════════════════════
// CLIENT INVOICE STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Client Invoice State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("client_invoice")).toBe(CLIENT_INVOICE_MACHINE);
    });
    it("paid and void are terminal", () => {
        expect(isTerminalState(CLIENT_INVOICE_MACHINE, "paid")).toBe(true);
        expect(isTerminalState(CLIENT_INVOICE_MACHINE, "void")).toBe(true);
    });
    it("happy path: draft→sent→viewed→paid", () => {
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "draft", "sent", PM).allowed).toBe(true);
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "sent", "viewed", PM).allowed).toBe(true);
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "viewed", "paid", PM).allowed).toBe(true);
    });
    it("direct payment: sent→paid", () => {
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "sent", "paid", PM).allowed).toBe(true);
    });
    it("partial payment: viewed→partial→paid", () => {
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "viewed", "partial", PM).allowed).toBe(
            true
        );
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "partial", "paid", PM).allowed).toBe(
            true
        );
    });
    it("overdue path: sent→overdue→paid", () => {
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "sent", "overdue", PM).allowed).toBe(
            true
        );
        expect(validateTransition(CLIENT_INVOICE_MACHINE, "overdue", "paid", PM).allowed).toBe(
            true
        );
    });
    it("paid triggers recordPayment", () => {
        const r = validateTransition(CLIENT_INVOICE_MACHINE, "sent", "paid", PM);
        expect(r.sideEffects).toContain("recordPayment");
    });
});

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDER STATE MACHINE
// ═══════════════════════════════════════════════════════════════

describe("Purchase Order State Machine", () => {
    it("is registered", () => {
        expect(getMachineForEntity("purchase_order")).toBe(PURCHASE_ORDER_MACHINE);
    });
    it("matched and cancelled are terminal", () => {
        expect(isTerminalState(PURCHASE_ORDER_MACHINE, "matched")).toBe(true);
        expect(isTerminalState(PURCHASE_ORDER_MACHINE, "cancelled")).toBe(true);
    });
    it("happy path: draft→pending_approval→approved→issued→received→matched", () => {
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "draft", "pending_approval", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "pending_approval", "approved", EXEC).allowed
        ).toBe(true);
        expect(validateTransition(PURCHASE_ORDER_MACHINE, "approved", "issued", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "issued", "received", MEMBER).allowed
        ).toBe(true);
        expect(validateTransition(PURCHASE_ORDER_MACHINE, "received", "matched", PM).allowed).toBe(
            true
        );
    });
    it("partial receipt: issued→partially_received→received", () => {
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "issued", "partially_received", MEMBER)
                .allowed
        ).toBe(true);
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "partially_received", "received", MEMBER)
                .allowed
        ).toBe(true);
    });
    it("dispute path: received→disputed→received (resolved)", () => {
        expect(validateTransition(PURCHASE_ORDER_MACHINE, "received", "disputed", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "disputed", "received", EXEC).allowed
        ).toBe(true);
    });
    it("issued notifies vendor", () => {
        const r = validateTransition(PURCHASE_ORDER_MACHINE, "approved", "issued", PM);
        expect(r.sideEffects).toContain("notifyVendor");
    });
});

// ═══════════════════════════════════════════════════════════════
// E2E: FULL FINANCIAL LIFECYCLE
// ═══════════════════════════════════════════════════════════════

describe("E2E: Budget → Expense → Invoice → Payment", () => {
    it("Scenario A: Full procurement-to-payment cycle", () => {
        // PO lifecycle
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "draft", "pending_approval", PM).allowed
        ).toBe(true);
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "pending_approval", "approved", EXEC).allowed
        ).toBe(true);
        expect(validateTransition(PURCHASE_ORDER_MACHINE, "approved", "issued", PM).allowed).toBe(
            true
        );
        expect(
            validateTransition(PURCHASE_ORDER_MACHINE, "issued", "received", MEMBER).allowed
        ).toBe(true);
        expect(validateTransition(PURCHASE_ORDER_MACHINE, "received", "matched", PM).allowed).toBe(
            true
        );
        // Invoice lifecycle
        expect(validateTransition(INVOICE_MACHINE, "draft", "pending", PM).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "pending", "approved", EXEC).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "approved", "sent", PM).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "sent", "paid", PM).allowed).toBe(true);
        // Payment lifecycle
        expect(validateTransition(PAYMENT_MACHINE, "pending", "processing", PM).allowed).toBe(true);
        expect(validateTransition(PAYMENT_MACHINE, "processing", "completed", EXEC).allowed).toBe(
            true
        );
    });

    it("Scenario B: Expense reimbursement cycle", () => {
        const entity = { amount: 500, category: "equipment", description: "Cable purchase" };
        const ctx: TransitionContext = { userRole: "member", entity };
        expect(validateTransition(EXPENSE_MACHINE, "draft", "pending", ctx).allowed).toBe(true);
        expect(validateTransition(EXPENSE_MACHINE, "pending", "approved", PM).allowed).toBe(true);
        expect(validateTransition(EXPENSE_MACHINE, "approved", "reimbursed", EXEC).allowed).toBe(
            true
        );
    });

    it("Scenario C: Invoice dispute resolution", () => {
        expect(validateTransition(INVOICE_MACHINE, "sent", "disputed", CLIENT).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "disputed", "sent", EXEC).allowed).toBe(true);
        expect(validateTransition(INVOICE_MACHINE, "sent", "paid", PM).allowed).toBe(true);
    });

    it("Scenario D: Payment failure and retry", () => {
        expect(validateTransition(PAYMENT_MACHINE, "pending", "processing", PM).allowed).toBe(true);
        expect(validateTransition(PAYMENT_MACHINE, "processing", "failed", PM).allowed).toBe(true);
        expect(validateTransition(PAYMENT_MACHINE, "failed", "processing", PM).allowed).toBe(true);
        expect(validateTransition(PAYMENT_MACHINE, "processing", "completed", EXEC).allowed).toBe(
            true
        );
    });
});
