import { defineStateMachine } from "@/lib/state-machine";

export const READINESS_GATE_STATES = [
    "not_started",
    "in_progress",
    "passed",
    "failed",
    "waived",
] as const;
export type ReadinessGateState = (typeof READINESS_GATE_STATES)[number];

export const READINESS_GATE_MACHINE = defineStateMachine<ReadinessGateState>({
    name: "readiness_gate",
    initialState: "not_started",
    states: READINESS_GATE_STATES,
    terminalStates: ["passed", "waived"],
    transitions: [
        {
            from: "not_started",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member"],
            label: "Begin Check",
        },
        { from: "in_progress", to: "passed", roles: ["exec", "director", "pm"], label: "Pass" },
        { from: "in_progress", to: "failed", roles: ["exec", "director", "pm"], label: "Fail" },
        { from: "failed", to: "in_progress", roles: ["exec", "director", "pm"], label: "Re-check" },
        { from: "failed", to: "waived", roles: ["exec", "director"], label: "Waive" },
        { from: "not_started", to: "waived", roles: ["exec", "director"], label: "Waive" },
    ],
});
