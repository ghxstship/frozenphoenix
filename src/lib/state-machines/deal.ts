import { defineStateMachine } from "@/lib/state-machine";

export const DEAL_STATES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"] as const;

export type DealState = (typeof DEAL_STATES)[number];

export const DEAL_MACHINE = defineStateMachine<DealState>({
    name: "deal",
    initialState: "lead",
    states: DEAL_STATES,
    terminalStates: ["won", "lost"],
    transitions: [
        { from: "lead", to: "qualified", roles: ["exec", "director", "pm"], label: "Qualify Lead" },
        {
            from: "qualified",
            to: "proposal",
            roles: ["exec", "director", "pm"],
            label: "Send Proposal",
        },
        {
            from: "proposal",
            to: "negotiation",
            roles: ["exec", "director", "pm"],
            label: "Enter Negotiation",
        },
        {
            from: "negotiation",
            to: "won",
            roles: ["exec", "director", "pm"],
            label: "Close Won",
            sideEffects: ["notifyTeam", "createProject"],
        },
        {
            from: "negotiation",
            to: "lost",
            roles: ["exec", "director", "pm"],
            label: "Close Lost",
            sideEffects: ["logLossReason"],
        },
        { from: "lead", to: "lost", roles: ["exec", "director", "pm"], label: "Disqualify" },
        { from: "qualified", to: "lost", roles: ["exec", "director", "pm"], label: "Close Lost" },
        { from: "proposal", to: "lost", roles: ["exec", "director", "pm"], label: "Close Lost" },
        {
            from: "proposal",
            to: "qualified",
            roles: ["exec", "director", "pm"],
            label: "Back to Qualified",
        },
        {
            from: "negotiation",
            to: "proposal",
            roles: ["exec", "director", "pm"],
            label: "Revise Proposal",
        },
    ],
});
