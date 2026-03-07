import { defineStateMachine } from "@/lib/state-machine";

export const PURCHASE_ORDER_STATES = [
    "draft",
    "pending_approval",
    "approved",
    "issued",
    "partially_received",
    "received",
    "matched",
    "disputed",
    "cancelled",
] as const;
export type PurchaseOrderState = (typeof PURCHASE_ORDER_STATES)[number];

export const PURCHASE_ORDER_MACHINE = defineStateMachine<PurchaseOrderState>({
    name: "purchase_order",
    initialState: "draft",
    states: PURCHASE_ORDER_STATES,
    terminalStates: ["matched", "cancelled"],
    transitions: [
        {
            from: "draft",
            to: "pending_approval",
            roles: ["exec", "director", "pm"],
            label: "Submit",
        },
        { from: "pending_approval", to: "approved", roles: ["exec", "director"], label: "Approve" },
        {
            from: "pending_approval",
            to: "draft",
            roles: ["exec", "director", "pm"],
            label: "Return",
        },
        {
            from: "approved",
            to: "issued",
            roles: ["exec", "director", "pm"],
            label: "Issue to Vendor",
            sideEffects: ["notifyVendor"],
        },
        {
            from: "issued",
            to: "partially_received",
            roles: ["exec", "director", "pm", "member"],
            label: "Partial Receipt",
        },
        {
            from: "issued",
            to: "received",
            roles: ["exec", "director", "pm", "member"],
            label: "Full Receipt",
        },
        {
            from: "partially_received",
            to: "received",
            roles: ["exec", "director", "pm", "member"],
            label: "Complete Receipt",
        },
        {
            from: "received",
            to: "matched",
            roles: ["exec", "director", "pm"],
            label: "Match to Invoice",
        },
        { from: "received", to: "disputed", roles: ["exec", "director", "pm"], label: "Dispute" },
        { from: "issued", to: "disputed", roles: ["exec", "director", "pm"], label: "Dispute" },
        { from: "disputed", to: "received", roles: ["exec", "director"], label: "Resolve" },
        { from: "draft", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "pending_approval", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
