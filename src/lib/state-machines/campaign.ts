import { defineStateMachine } from "@/lib/state-machine";

export const CAMPAIGN_STATES = [
    "draft",
    "planned",
    "active",
    "paused",
    "completed",
    "cancelled",
] as const;

export type CampaignState = (typeof CAMPAIGN_STATES)[number];

export const CAMPAIGN_MACHINE = defineStateMachine<CampaignState>({
    name: "campaign",
    initialState: "draft",
    states: CAMPAIGN_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        { from: "draft", to: "planned", roles: ["exec", "director", "pm"], label: "Plan Campaign" },
        { from: "planned", to: "active", roles: ["exec", "director", "pm"], label: "Launch" },
        { from: "active", to: "paused", roles: ["exec", "director", "pm"], label: "Pause" },
        { from: "paused", to: "active", roles: ["exec", "director", "pm"], label: "Resume" },
        {
            from: "active",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Complete",
            sideEffects: ["generateReport"],
        },
        { from: "draft", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "planned", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "active", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "paused", to: "cancelled", roles: ["exec", "director"], label: "Cancel" },
        { from: "planned", to: "draft", roles: ["exec", "director", "pm"], label: "Back to Draft" },
    ],
});
