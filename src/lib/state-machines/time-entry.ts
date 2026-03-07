import { defineStateMachine } from "@/lib/state-machine";

export const TIME_ENTRY_STATES = [
    "draft",
    "submitted",
    "approved",
    "rejected",
    "invoiced",
] as const;
export type TimeEntryState = (typeof TIME_ENTRY_STATES)[number];

export const TIME_ENTRY_MACHINE = defineStateMachine<TimeEntryState>({
    name: "time_entry",
    initialState: "draft",
    states: TIME_ENTRY_STATES,
    terminalStates: ["invoiced"],
    transitions: [
        {
            from: "draft",
            to: "submitted",
            roles: ["exec", "director", "pm", "member"],
            label: "Submit",
        },
        { from: "submitted", to: "approved", roles: ["exec", "director", "pm"], label: "Approve" },
        { from: "submitted", to: "rejected", roles: ["exec", "director", "pm"], label: "Reject" },
        {
            from: "rejected",
            to: "draft",
            roles: ["exec", "director", "pm", "member"],
            label: "Revise",
        },
        {
            from: "approved",
            to: "invoiced",
            roles: ["exec", "director"],
            label: "Include in Invoice",
        },
        { from: "approved", to: "rejected", roles: ["exec", "director"], label: "Revoke Approval" },
    ],
});
