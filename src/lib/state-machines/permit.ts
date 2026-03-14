import { defineStateMachine } from "@/lib/state-machine";

export const PERMIT_STATES = [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "expired",
    "revoked",
] as const;

export type PermitState = (typeof PERMIT_STATES)[number];

export const PERMIT_MACHINE = defineStateMachine<PermitState>({
    name: "permit",
    initialState: "draft",
    states: PERMIT_STATES,
    terminalStates: ["rejected", "expired", "revoked"],
    transitions: [
        {
            from: "draft",
            to: "submitted",
            roles: ["exec", "director", "pm", "member"],
            label: "Submit Application",
        },
        {
            from: "submitted",
            to: "under_review",
            roles: ["exec", "director", "pm"],
            label: "Begin Review",
        },
        {
            from: "under_review",
            to: "approved",
            roles: ["exec", "director"],
            label: "Approve",
            sideEffects: ["notifyTeam"],
        },
        { from: "under_review", to: "rejected", roles: ["exec", "director"], label: "Reject" },
        {
            from: "submitted",
            to: "draft",
            roles: ["exec", "director", "pm"],
            label: "Return to Draft",
        },
        {
            from: "under_review",
            to: "draft",
            roles: ["exec", "director"],
            label: "Request Revision",
        },
        {
            from: "approved",
            to: "expired",
            roles: ["exec", "director", "pm"],
            label: "Mark Expired",
        },
        { from: "approved", to: "revoked", roles: ["exec", "director"], label: "Revoke" },
    ],
});
