import { defineStateMachine } from "@/lib/state-machine";

export const CHANGE_ORDER_STATES = [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "implemented",
    "cancelled",
] as const;
export type ChangeOrderState = (typeof CHANGE_ORDER_STATES)[number];

export const CHANGE_ORDER_MACHINE = defineStateMachine<ChangeOrderState>({
    name: "change_order",
    initialState: "draft",
    states: CHANGE_ORDER_STATES,
    terminalStates: ["implemented", "rejected", "cancelled"],
    transitions: [
        { from: "draft", to: "submitted", roles: ["exec", "director", "pm"], label: "Submit" },
        {
            from: "submitted",
            to: "under_review",
            roles: ["exec", "director"],
            label: "Begin Review",
        },
        {
            from: "under_review",
            to: "approved",
            roles: ["exec", "director"],
            label: "Approve",
            sideEffects: ["updateBudget", "notifyPM"],
        },
        {
            from: "under_review",
            to: "rejected",
            roles: ["exec", "director"],
            label: "Reject",
            sideEffects: ["notifyPM"],
        },
        {
            from: "under_review",
            to: "draft",
            roles: ["exec", "director"],
            label: "Return for Revision",
        },
        {
            from: "approved",
            to: "implemented",
            roles: ["exec", "director", "pm"],
            label: "Mark Implemented",
        },
        { from: "draft", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "submitted", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
