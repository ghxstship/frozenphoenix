import { defineStateMachine } from "@/lib/state-machine";

export const ESTIMATE_STATES = [
    "draft",
    "pending_review",
    "sent",
    "accepted",
    "rejected",
    "expired",
    "converted",
] as const;
export type EstimateState = (typeof ESTIMATE_STATES)[number];

export const ESTIMATE_MACHINE = defineStateMachine<EstimateState>({
    name: "estimate",
    initialState: "draft",
    states: ESTIMATE_STATES,
    terminalStates: ["accepted", "rejected", "expired", "converted"],
    transitions: [
        { from: "draft", to: "pending_review", roles: ["exec", "director", "pm"], label: "Submit" },
        {
            from: "pending_review",
            to: "sent",
            roles: ["exec", "director"],
            label: "Approve & Send",
            sideEffects: ["sendToClient"],
        },
        { from: "pending_review", to: "draft", roles: ["exec", "director", "pm"], label: "Return" },
        {
            from: "sent",
            to: "accepted",
            roles: ["exec", "director", "pm", "client"],
            label: "Accept",
        },
        {
            from: "sent",
            to: "rejected",
            roles: ["exec", "director", "pm", "client"],
            label: "Reject",
        },
        { from: "sent", to: "expired", roles: ["exec", "director", "pm"], label: "Mark Expired" },
        {
            from: "accepted",
            to: "converted",
            roles: ["exec", "director", "pm"],
            label: "Convert to Project",
            sideEffects: ["createProject"],
        },
        { from: "rejected", to: "draft", roles: ["exec", "director", "pm"], label: "Revise" },
    ],
});
