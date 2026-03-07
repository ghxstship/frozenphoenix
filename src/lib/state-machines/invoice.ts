import { defineStateMachine } from "@/lib/state-machine";

export const INVOICE_STATES = [
    "draft",
    "pending",
    "approved",
    "sent",
    "partially_paid",
    "paid",
    "overdue",
    "disputed",
    "void",
    "written_off",
] as const;

export type InvoiceState = (typeof INVOICE_STATES)[number];

export const INVOICE_MACHINE = defineStateMachine<InvoiceState>({
    name: "invoice",
    initialState: "draft",
    states: INVOICE_STATES,
    terminalStates: ["paid", "void", "written_off"],
    transitions: [
        {
            from: "draft",
            to: "pending",
            roles: ["exec", "director", "pm"],
            label: "Submit for Approval",
        },
        {
            from: "pending",
            to: "approved",
            roles: ["exec", "director"],
            label: "Approve",
            sideEffects: ["triggerApproval"],
        },
        {
            from: "pending",
            to: "draft",
            roles: ["exec", "director", "pm"],
            label: "Return to Draft",
        },
        {
            from: "approved",
            to: "sent",
            roles: ["exec", "director", "pm"],
            label: "Send to Client",
            sideEffects: ["sendInvoiceEmail"],
        },
        {
            from: "sent",
            to: "partially_paid",
            roles: ["exec", "director", "pm"],
            label: "Record Partial Payment",
        },
        {
            from: "sent",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Record Full Payment",
            sideEffects: ["updateRevenue"],
        },
        {
            from: "partially_paid",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Record Final Payment",
            sideEffects: ["updateRevenue"],
        },
        {
            from: "sent",
            to: "overdue",
            roles: ["exec", "director", "pm"],
            label: "Mark Overdue",
            sideEffects: ["sendOverdueReminder"],
        },
        {
            from: "overdue",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Record Payment",
            sideEffects: ["updateRevenue"],
        },
        {
            from: "overdue",
            to: "partially_paid",
            roles: ["exec", "director", "pm"],
            label: "Record Partial Payment",
        },
        {
            from: "sent",
            to: "disputed",
            roles: ["exec", "director", "pm", "client"],
            label: "Dispute",
        },
        {
            from: "overdue",
            to: "disputed",
            roles: ["exec", "director", "pm", "client"],
            label: "Dispute",
        },
        { from: "disputed", to: "sent", roles: ["exec", "director"], label: "Resolve Dispute" },
        { from: "disputed", to: "void", roles: ["exec", "director"], label: "Void Invoice" },
        { from: "overdue", to: "written_off", roles: ["exec"], label: "Write Off" },
        { from: "draft", to: "void", roles: ["exec", "director"], label: "Void" },
        { from: "pending", to: "void", roles: ["exec", "director"], label: "Void" },
    ],
});
