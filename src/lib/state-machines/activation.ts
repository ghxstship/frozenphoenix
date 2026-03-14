import { defineStateMachine } from "@/lib/state-machine";

export const ACTIVATION_STATES = [
    "planning",
    "setup",
    "rehearsal",
    "live",
    "strike",
    "completed",
    "cancelled",
] as const;

export type ActivationState = (typeof ACTIVATION_STATES)[number];

export const ACTIVATION_MACHINE = defineStateMachine<ActivationState>({
    name: "activation",
    initialState: "planning",
    states: ACTIVATION_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        { from: "planning", to: "setup", roles: ["exec", "director", "pm"], label: "Begin Setup" },
        {
            from: "setup",
            to: "rehearsal",
            roles: ["exec", "director", "pm"],
            label: "Start Rehearsal",
        },
        { from: "rehearsal", to: "live", roles: ["exec", "director", "pm"], label: "Go Live" },
        { from: "live", to: "strike", roles: ["exec", "director", "pm"], label: "Begin Strike" },
        {
            from: "strike",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Complete",
            sideEffects: ["generateWrapReport"],
        },
        {
            from: "rehearsal",
            to: "setup",
            roles: ["exec", "director", "pm"],
            label: "Back to Setup",
        },
        { from: "planning", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "setup", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "rehearsal", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
    ],
});
