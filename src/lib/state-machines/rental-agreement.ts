import { defineStateMachine } from "@/lib/state-machine";

export const RENTAL_AGREEMENT_STATES = [
    "draft",
    "pending_approval",
    "approved",
    "active",
    "extended",
    "returned",
    "overdue",
    "cancelled",
] as const;
export type RentalAgreementState = (typeof RENTAL_AGREEMENT_STATES)[number];

export const RENTAL_AGREEMENT_MACHINE = defineStateMachine<RentalAgreementState>({
    name: "rental_agreement",
    initialState: "draft",
    states: RENTAL_AGREEMENT_STATES,
    terminalStates: ["returned", "cancelled"],
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
        { from: "approved", to: "active", roles: ["exec", "director", "pm"], label: "Activate" },
        { from: "active", to: "extended", roles: ["exec", "director", "pm"], label: "Extend" },
        {
            from: "extended",
            to: "active",
            roles: ["exec", "director", "pm"],
            label: "Confirm Extension",
        },
        {
            from: "active",
            to: "returned",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Returned",
        },
        { from: "active", to: "overdue", roles: ["exec", "director", "pm"], label: "Mark Overdue" },
        {
            from: "overdue",
            to: "returned",
            roles: ["exec", "director", "pm", "member"],
            label: "Return (Late)",
        },
        {
            from: "extended",
            to: "returned",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Returned",
        },
        { from: "draft", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "pending_approval", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
