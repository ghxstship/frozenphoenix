import { defineStateMachine } from "@/lib/state-machine";

export const PROJECT_STATES = [
    "draft",
    "planning",
    "pre_production",
    "in_production",
    "active",
    "on_hold",
    "wrap",
    "completed",
    "cancelled",
] as const;

export type ProjectState = (typeof PROJECT_STATES)[number];

export const PROJECT_MACHINE = defineStateMachine<ProjectState>({
    name: "project",
    initialState: "draft",
    states: PROJECT_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        // Draft → planning
        {
            from: "draft",
            to: "planning",
            roles: ["exec", "director", "pm"],
            label: "Start Planning",
            guard: "hasName",
            sideEffects: ["notifyTeam"],
        },
        // Planning → pre-production
        {
            from: "planning",
            to: "pre_production",
            roles: ["exec", "director", "pm"],
            label: "Begin Pre-Production",
            guard: "hasApprovedBudget",
        },
        // Pre-production → in-production
        {
            from: "pre_production",
            to: "in_production",
            roles: ["exec", "director", "pm"],
            label: "Start Production",
            guard: "hasAssignedPM",
        },
        // In-production → active (show/live)
        {
            from: "in_production",
            to: "active",
            roles: ["exec", "director", "pm"],
            label: "Go Active",
        },
        // Active → wrap
        { from: "active", to: "wrap", roles: ["exec", "director", "pm"], label: "Begin Wrap" },
        // Wrap → completed
        {
            from: "wrap",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Mark Complete",
            sideEffects: ["notifyStakeholders", "archiveProject"],
        },
        // Hold from any active state
        {
            from: "planning",
            to: "on_hold",
            roles: ["exec", "director", "pm"],
            label: "Put on Hold",
        },
        {
            from: "pre_production",
            to: "on_hold",
            roles: ["exec", "director", "pm"],
            label: "Put on Hold",
        },
        {
            from: "in_production",
            to: "on_hold",
            roles: ["exec", "director", "pm"],
            label: "Put on Hold",
        },
        { from: "active", to: "on_hold", roles: ["exec", "director", "pm"], label: "Put on Hold" },
        // Resume from hold
        {
            from: "on_hold",
            to: "planning",
            roles: ["exec", "director", "pm"],
            label: "Resume to Planning",
        },
        {
            from: "on_hold",
            to: "pre_production",
            roles: ["exec", "director", "pm"],
            label: "Resume to Pre-Production",
        },
        {
            from: "on_hold",
            to: "in_production",
            roles: ["exec", "director", "pm"],
            label: "Resume to Production",
        },
        {
            from: "on_hold",
            to: "active",
            roles: ["exec", "director", "pm"],
            label: "Resume to Active",
        },
        // Cancel from any non-terminal state
        {
            from: "draft",
            to: "cancelled",
            roles: ["exec", "director"],
            label: "Cancel Project",
            sideEffects: ["notifyStakeholders"],
        },
        {
            from: "planning",
            to: "cancelled",
            roles: ["exec", "director"],
            label: "Cancel Project",
            sideEffects: ["notifyStakeholders"],
        },
        {
            from: "pre_production",
            to: "cancelled",
            roles: ["exec", "director"],
            label: "Cancel Project",
            sideEffects: ["notifyStakeholders"],
        },
        {
            from: "in_production",
            to: "cancelled",
            roles: ["exec", "director"],
            label: "Cancel Project",
            sideEffects: ["notifyStakeholders"],
        },
        {
            from: "on_hold",
            to: "cancelled",
            roles: ["exec", "director"],
            label: "Cancel Project",
            sideEffects: ["notifyStakeholders"],
        },
    ],
    onEnter: {
        completed: ["generateWrapReport", "triggerInvoicing"],
        cancelled: ["releaseResources"],
    },
    requiredFields: {
        planning: ["name"],
        pre_production: ["name", "start_date", "end_date"],
        in_production: ["name", "start_date", "end_date", "manager_id"],
    },
});
