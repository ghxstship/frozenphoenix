import { defineStateMachine } from "@/lib/state-machine";

export const MILESTONE_STATES = [
    "pending",
    "in_progress",
    "completed",
    "overdue",
    "cancelled",
] as const;
export type MilestoneState = (typeof MILESTONE_STATES)[number];

export const MILESTONE_MACHINE = defineStateMachine<MilestoneState>({
    name: "milestone",
    initialState: "pending",
    states: MILESTONE_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        { from: "pending", to: "in_progress", roles: ["exec", "director", "pm"], label: "Start" },
        {
            from: "in_progress",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Complete",
            sideEffects: ["triggerApproval"],
        },
        {
            from: "in_progress",
            to: "overdue",
            roles: ["exec", "director", "pm"],
            label: "Mark Overdue",
        },
        { from: "overdue", to: "in_progress", roles: ["exec", "director", "pm"], label: "Resume" },
        {
            from: "overdue",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Complete Late",
        },
        { from: "pending", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "in_progress", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "overdue", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
