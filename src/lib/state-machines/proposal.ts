import { defineStateMachine } from "@/lib/state-machine";

export const PROPOSAL_STATES = [
    "draft",
    "internal_review",
    "sent",
    "negotiation",
    "accepted",
    "rejected",
    "expired",
] as const;

export type ProposalState = (typeof PROPOSAL_STATES)[number];

export const PROPOSAL_MACHINE = defineStateMachine<ProposalState>({
    name: "proposal",
    initialState: "draft",
    states: PROPOSAL_STATES,
    terminalStates: ["accepted", "rejected", "expired"],
    transitions: [
        {
            from: "draft",
            to: "internal_review",
            roles: ["exec", "director", "pm"],
            label: "Submit for Review",
        },
        {
            from: "internal_review",
            to: "draft",
            roles: ["exec", "director"],
            label: "Request Revision",
        },
        {
            from: "internal_review",
            to: "sent",
            roles: ["exec", "director"],
            label: "Send to Client",
        },
        {
            from: "sent",
            to: "negotiation",
            roles: ["exec", "director", "pm"],
            label: "Enter Negotiation",
        },
        {
            from: "negotiation",
            to: "accepted",
            roles: ["exec", "director"],
            label: "Accept",
            sideEffects: ["createContract", "notifyTeam"],
        },
        { from: "negotiation", to: "rejected", roles: ["exec", "director", "pm"], label: "Reject" },
        { from: "sent", to: "rejected", roles: ["exec", "director", "pm"], label: "Reject" },
        { from: "sent", to: "expired", roles: ["exec", "director"], label: "Mark Expired" },
        {
            from: "negotiation",
            to: "sent",
            roles: ["exec", "director", "pm"],
            label: "Revise & Resend",
        },
    ],
});
