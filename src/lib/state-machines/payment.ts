import { defineStateMachine } from "@/lib/state-machine";

export const PAYMENT_STATES = [
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded",
    "cancelled",
] as const;

export type PaymentState = (typeof PAYMENT_STATES)[number];

export const PAYMENT_MACHINE = defineStateMachine<PaymentState>({
    name: "payment",
    initialState: "pending",
    states: PAYMENT_STATES,
    terminalStates: ["completed", "refunded", "cancelled"],
    transitions: [
        {
            from: "pending",
            to: "processing",
            roles: ["exec", "director", "pm"],
            label: "Process Payment",
        },
        {
            from: "processing",
            to: "completed",
            roles: ["exec", "director"],
            label: "Confirm Payment",
            sideEffects: ["updateInvoice", "notifyVendor"],
        },
        {
            from: "processing",
            to: "failed",
            roles: ["exec", "director", "pm"],
            label: "Mark Failed",
        },
        { from: "failed", to: "processing", roles: ["exec", "director", "pm"], label: "Retry" },
        { from: "completed", to: "refunded", roles: ["exec", "director"], label: "Refund" },
        { from: "pending", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "failed", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
