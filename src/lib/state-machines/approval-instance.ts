import { defineStateMachine } from "@/lib/state-machine";

export const APPROVAL_INSTANCE_STATES = [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
    "escalated",
] as const;
export type ApprovalInstanceState = (typeof APPROVAL_INSTANCE_STATES)[number];

export const APPROVAL_INSTANCE_MACHINE = defineStateMachine<ApprovalInstanceState>({
    name: "approval_instance",
    initialState: "pending",
    states: APPROVAL_INSTANCE_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        {
            from: "pending",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member"],
            label: "Begin Review",
        },
        {
            from: "in_progress",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Complete",
        },
        {
            from: "in_progress",
            to: "escalated",
            roles: ["exec", "director", "pm"],
            label: "Escalate",
        },
        { from: "escalated", to: "in_progress", roles: ["exec", "director"], label: "De-escalate" },
        {
            from: "escalated",
            to: "completed",
            roles: ["exec", "director"],
            label: "Complete (Escalated)",
        },
        { from: "pending", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "in_progress", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "escalated", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
