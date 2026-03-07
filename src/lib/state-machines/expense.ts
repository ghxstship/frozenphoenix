import { defineStateMachine } from "@/lib/state-machine";

export const EXPENSE_STATES = [
    "draft",
    "pending",
    "approved",
    "rejected",
    "reimbursed",
    "void",
] as const;
export type ExpenseState = (typeof EXPENSE_STATES)[number];

export const EXPENSE_MACHINE = defineStateMachine<ExpenseState>({
    name: "expense",
    initialState: "draft",
    states: EXPENSE_STATES,
    terminalStates: ["reimbursed", "void"],
    transitions: [
        {
            from: "draft",
            to: "pending",
            roles: ["exec", "director", "pm", "member"],
            label: "Submit for Approval",
        },
        {
            from: "pending",
            to: "approved",
            roles: ["exec", "director", "pm"],
            label: "Approve",
            sideEffects: ["triggerApproval"],
        },
        {
            from: "pending",
            to: "rejected",
            roles: ["exec", "director", "pm"],
            label: "Reject",
            sideEffects: ["notifySubmitter"],
        },
        {
            from: "rejected",
            to: "draft",
            roles: ["exec", "director", "pm", "member"],
            label: "Revise & Resubmit",
        },
        {
            from: "approved",
            to: "reimbursed",
            roles: ["exec", "director"],
            label: "Mark Reimbursed",
            sideEffects: ["updateBudget"],
        },
        { from: "draft", to: "void", roles: ["exec", "director", "pm", "member"], label: "Void" },
        { from: "pending", to: "void", roles: ["exec", "director"], label: "Void" },
    ],
    requiredFields: {
        pending: ["amount", "category", "description"],
    },
});
