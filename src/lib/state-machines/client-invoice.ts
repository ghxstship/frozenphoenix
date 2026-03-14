import { defineStateMachine } from "@/lib/state-machine";

export const CLIENT_INVOICE_STATES = [
    "draft",
    "sent",
    "viewed",
    "partial",
    "paid",
    "overdue",
    "void",
] as const;

export type ClientInvoiceState = (typeof CLIENT_INVOICE_STATES)[number];

export const CLIENT_INVOICE_MACHINE = defineStateMachine<ClientInvoiceState>({
    name: "client_invoice",
    initialState: "draft",
    states: CLIENT_INVOICE_STATES,
    terminalStates: ["paid", "void"],
    transitions: [
        { from: "draft", to: "sent", roles: ["exec", "director", "pm"], label: "Send Invoice" },
        {
            from: "sent",
            to: "viewed",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Viewed",
        },
        {
            from: "sent",
            to: "partial",
            roles: ["exec", "director", "pm"],
            label: "Record Partial Payment",
        },
        {
            from: "viewed",
            to: "partial",
            roles: ["exec", "director", "pm"],
            label: "Record Partial Payment",
        },
        {
            from: "partial",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Mark Paid",
            sideEffects: ["recordPayment"],
        },
        {
            from: "sent",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Mark Paid",
            sideEffects: ["recordPayment"],
        },
        {
            from: "viewed",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Mark Paid",
            sideEffects: ["recordPayment"],
        },
        { from: "sent", to: "overdue", roles: ["exec", "director", "pm"], label: "Mark Overdue" },
        { from: "viewed", to: "overdue", roles: ["exec", "director", "pm"], label: "Mark Overdue" },
        {
            from: "overdue",
            to: "partial",
            roles: ["exec", "director", "pm"],
            label: "Record Partial Payment",
        },
        {
            from: "overdue",
            to: "paid",
            roles: ["exec", "director", "pm"],
            label: "Mark Paid",
            sideEffects: ["recordPayment"],
        },
        { from: "draft", to: "void", roles: ["exec", "director"], label: "Void" },
        { from: "sent", to: "void", roles: ["exec", "director"], label: "Void" },
        { from: "overdue", to: "void", roles: ["exec", "director"], label: "Void" },
    ],
});
