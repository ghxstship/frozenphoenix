import { defineStateMachine } from "@/lib/state-machine";

export const LIVE_EVENT_STATES = [
    "planning",
    "pre_production",
    "advancing",
    "load_in",
    "rehearsal",
    "show_ready",
    "live",
    "intermission",
    "strike",
    "load_out",
    "reconciliation",
    "wrapped",
] as const;
export type LiveEventState = (typeof LIVE_EVENT_STATES)[number];

export const LIVE_EVENT_MACHINE = defineStateMachine<LiveEventState>({
    name: "live_event",
    initialState: "planning",
    states: LIVE_EVENT_STATES,
    terminalStates: ["wrapped"],
    transitions: [
        {
            from: "planning",
            to: "pre_production",
            roles: ["exec", "director", "pm"],
            label: "Begin Pre-Production",
        },
        {
            from: "pre_production",
            to: "advancing",
            roles: ["exec", "director", "pm"],
            label: "Start Advancing",
        },
        {
            from: "advancing",
            to: "load_in",
            roles: ["exec", "director", "pm"],
            label: "Begin Load-In",
        },
        {
            from: "load_in",
            to: "rehearsal",
            roles: ["exec", "director", "pm"],
            label: "Start Rehearsal",
        },
        {
            from: "rehearsal",
            to: "show_ready",
            roles: ["exec", "director", "pm"],
            label: "Mark Show Ready",
            guard: "allGatesPassed",
        },
        {
            from: "show_ready",
            to: "live",
            roles: ["exec", "director", "pm"],
            label: "Go Live",
            sideEffects: ["activateCommandDashboard"],
        },
        {
            from: "live",
            to: "intermission",
            roles: ["exec", "director", "pm"],
            label: "Intermission",
        },
        { from: "intermission", to: "live", roles: ["exec", "director", "pm"], label: "Resume" },
        { from: "live", to: "strike", roles: ["exec", "director", "pm"], label: "Begin Strike" },
        {
            from: "strike",
            to: "load_out",
            roles: ["exec", "director", "pm"],
            label: "Begin Load-Out",
        },
        {
            from: "load_out",
            to: "reconciliation",
            roles: ["exec", "director", "pm"],
            label: "Begin Reconciliation",
        },
        {
            from: "reconciliation",
            to: "wrapped",
            roles: ["exec", "director", "pm"],
            label: "Wrap",
            sideEffects: ["generateReconciliationReport"],
        },
    ],
});
