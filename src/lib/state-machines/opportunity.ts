import { defineStateMachine } from "@/lib/state-machine";

export const OPPORTUNITY_STATES = [
    "discovery",
    "qualification",
    "proposal_sent",
    "negotiation",
    "verbal_commit",
    "contract_out",
    "closed_won",
    "closed_lost",
    "on_hold",
] as const;
export type OpportunityState = (typeof OPPORTUNITY_STATES)[number];

export const OPPORTUNITY_MACHINE = defineStateMachine<OpportunityState>({
    name: "opportunity",
    initialState: "discovery",
    states: OPPORTUNITY_STATES,
    terminalStates: ["closed_won", "closed_lost"],
    transitions: [
        {
            from: "discovery",
            to: "qualification",
            roles: ["exec", "director", "pm"],
            label: "Qualify",
        },
        {
            from: "qualification",
            to: "proposal_sent",
            roles: ["exec", "director", "pm"],
            label: "Send Proposal",
        },
        {
            from: "proposal_sent",
            to: "negotiation",
            roles: ["exec", "director", "pm"],
            label: "Negotiate",
        },
        {
            from: "negotiation",
            to: "verbal_commit",
            roles: ["exec", "director", "pm"],
            label: "Verbal Commit",
        },
        {
            from: "verbal_commit",
            to: "contract_out",
            roles: ["exec", "director", "pm"],
            label: "Send Contract",
        },
        {
            from: "contract_out",
            to: "closed_won",
            roles: ["exec", "director", "pm"],
            label: "Close Won",
            sideEffects: ["createProject", "notifyTeam"],
        },
        {
            from: "contract_out",
            to: "closed_lost",
            roles: ["exec", "director", "pm"],
            label: "Close Lost",
        },
        {
            from: "discovery",
            to: "closed_lost",
            roles: ["exec", "director", "pm"],
            label: "Disqualify",
        },
        {
            from: "qualification",
            to: "closed_lost",
            roles: ["exec", "director", "pm"],
            label: "Close Lost",
        },
        {
            from: "proposal_sent",
            to: "closed_lost",
            roles: ["exec", "director", "pm"],
            label: "Close Lost",
        },
        {
            from: "negotiation",
            to: "closed_lost",
            roles: ["exec", "director", "pm"],
            label: "Close Lost",
        },
        { from: "discovery", to: "on_hold", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "qualification", to: "on_hold", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "proposal_sent", to: "on_hold", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "negotiation", to: "on_hold", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "on_hold", to: "discovery", roles: ["exec", "director", "pm"], label: "Resume" },
    ],
});
