import { defineStateMachine } from "@/lib/state-machine";

export const WORK_ORDER_STATES = [
    "draft",
    "pending_approval",
    "approved",
    "assigned",
    "scheduled",
    "in_progress",
    "on_hold",
    "pending_review",
    "revision_required",
    "completed",
    "invoiced",
    "disputed",
    "cancelled",
] as const;
export type WorkOrderState = (typeof WORK_ORDER_STATES)[number];

export const WORK_ORDER_MACHINE = defineStateMachine<WorkOrderState>({
    name: "work_order",
    initialState: "draft",
    states: WORK_ORDER_STATES,
    terminalStates: ["invoiced", "cancelled"],
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
            to: "assigned",
            roles: ["exec", "director", "pm"],
            label: "Assign Vendor",
        },
        { from: "assigned", to: "scheduled", roles: ["exec", "director", "pm"], label: "Schedule" },
        {
            from: "scheduled",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member", "collaborator"],
            label: "Start Work",
        },
        { from: "in_progress", to: "on_hold", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "on_hold", to: "in_progress", roles: ["exec", "director", "pm"], label: "Resume" },
        {
            from: "in_progress",
            to: "pending_review",
            roles: ["exec", "director", "pm", "member", "collaborator"],
            label: "Submit for Review",
        },
        {
            from: "pending_review",
            to: "revision_required",
            roles: ["exec", "director", "pm"],
            label: "Request Revision",
        },
        {
            from: "revision_required",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member", "collaborator"],
            label: "Resume Work",
        },
        {
            from: "pending_review",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Accept",
            sideEffects: ["notifyVendor"],
        },
        { from: "completed", to: "invoiced", roles: ["exec", "director"], label: "Mark Invoiced" },
        { from: "completed", to: "disputed", roles: ["exec", "director", "pm"], label: "Dispute" },
        { from: "disputed", to: "completed", roles: ["exec", "director"], label: "Resolve" },
        { from: "draft", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "pending_approval", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "on_hold", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
