import { defineStateMachine } from "@/lib/state-machine";

export const INCIDENT_STATES = [
    "reported",
    "triaged",
    "investigating",
    "mitigating",
    "resolved",
    "post_mortem",
    "closed",
] as const;
export type IncidentState = (typeof INCIDENT_STATES)[number];

export const INCIDENT_MACHINE = defineStateMachine<IncidentState>({
    name: "incident",
    initialState: "reported",
    states: INCIDENT_STATES,
    terminalStates: ["closed"],
    transitions: [
        {
            from: "reported",
            to: "triaged",
            roles: ["exec", "director", "pm", "member"],
            label: "Triage",
            sideEffects: ["notifySafetyTeam"],
        },
        {
            from: "triaged",
            to: "investigating",
            roles: ["exec", "director", "pm", "member"],
            label: "Investigate",
        },
        {
            from: "investigating",
            to: "mitigating",
            roles: ["exec", "director", "pm", "member"],
            label: "Mitigate",
        },
        { from: "mitigating", to: "resolved", roles: ["exec", "director", "pm"], label: "Resolve" },
        {
            from: "investigating",
            to: "resolved",
            roles: ["exec", "director", "pm"],
            label: "Resolve",
        },
        {
            from: "resolved",
            to: "post_mortem",
            roles: ["exec", "director", "pm"],
            label: "Begin Post-Mortem",
        },
        { from: "post_mortem", to: "closed", roles: ["exec", "director"], label: "Close" },
        {
            from: "resolved",
            to: "closed",
            roles: ["exec", "director"],
            label: "Close (No Post-Mortem)",
        },
        {
            from: "resolved",
            to: "investigating",
            roles: ["exec", "director", "pm"],
            label: "Reopen",
        },
    ],
});
