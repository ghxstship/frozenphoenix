import { defineStateMachine } from "@/lib/state-machine";

export const LEAD_STATES = [
    "new",
    "contacted",
    "qualified",
    "nurturing",
    "converted",
    "disqualified",
] as const;

export type LeadState = (typeof LEAD_STATES)[number];

export const LEAD_MACHINE = defineStateMachine<LeadState>({
    name: "lead",
    initialState: "new",
    states: LEAD_STATES,
    terminalStates: ["converted", "disqualified"],
    transitions: [
        {
            from: "new",
            to: "contacted",
            roles: ["exec", "director", "pm", "member"],
            label: "Contact Lead",
        },
        { from: "contacted", to: "qualified", roles: ["exec", "director", "pm"], label: "Qualify" },
        {
            from: "contacted",
            to: "nurturing",
            roles: ["exec", "director", "pm", "member"],
            label: "Nurture",
        },
        { from: "nurturing", to: "qualified", roles: ["exec", "director", "pm"], label: "Qualify" },
        {
            from: "qualified",
            to: "converted",
            roles: ["exec", "director", "pm"],
            label: "Convert to Deal",
            sideEffects: ["createDeal"],
        },
        { from: "new", to: "disqualified", roles: ["exec", "director", "pm"], label: "Disqualify" },
        {
            from: "contacted",
            to: "disqualified",
            roles: ["exec", "director", "pm"],
            label: "Disqualify",
        },
        {
            from: "nurturing",
            to: "disqualified",
            roles: ["exec", "director", "pm"],
            label: "Disqualify",
        },
        {
            from: "qualified",
            to: "disqualified",
            roles: ["exec", "director", "pm"],
            label: "Disqualify",
        },
        {
            from: "qualified",
            to: "nurturing",
            roles: ["exec", "director", "pm"],
            label: "Back to Nurturing",
        },
    ],
});
