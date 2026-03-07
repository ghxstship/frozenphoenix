import { defineStateMachine } from "@/lib/state-machine";

export const SOW_STATES = [
    "draft",
    "pending_review",
    "pending_approval",
    "approved",
    "active",
    "on_hold",
    "amendment",
    "completed",
    "cancelled",
] as const;

export type SowState = (typeof SOW_STATES)[number];

export const SOW_MACHINE = defineStateMachine<SowState>({
    name: "sow",
    initialState: "draft",
    states: SOW_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        {
            from: "draft",
            to: "pending_review",
            roles: ["exec", "director", "pm"],
            label: "Submit for Review",
        },
        {
            from: "pending_review",
            to: "pending_approval",
            roles: ["exec", "director"],
            label: "Send for Approval",
            sideEffects: ["triggerApproval"],
        },
        {
            from: "pending_review",
            to: "draft",
            roles: ["exec", "director", "pm"],
            label: "Return to Draft",
        },
        { from: "pending_approval", to: "approved", roles: ["exec", "director"], label: "Approve" },
        { from: "pending_approval", to: "draft", roles: ["exec", "director"], label: "Reject" },
        {
            from: "approved",
            to: "active",
            roles: ["exec", "director", "pm"],
            label: "Activate",
            sideEffects: ["notifyStakeholders"],
        },
        { from: "active", to: "on_hold", roles: ["exec", "director", "pm"], label: "Put on Hold" },
        { from: "on_hold", to: "active", roles: ["exec", "director", "pm"], label: "Resume" },
        {
            from: "active",
            to: "amendment",
            roles: ["exec", "director", "pm"],
            label: "Create Amendment",
        },
        {
            from: "amendment",
            to: "pending_review",
            roles: ["exec", "director", "pm"],
            label: "Submit Amendment",
        },
        {
            from: "active",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Mark Complete",
            sideEffects: ["triggerInvoicing"],
        },
        { from: "draft", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "pending_review", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "on_hold", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
    requiredFields: {
        pending_review: ["title", "project_id"],
        active: ["title", "project_id", "start_date"],
    },
});
