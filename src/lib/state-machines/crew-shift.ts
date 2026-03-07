import { defineStateMachine } from "@/lib/state-machine";

export const CREW_SHIFT_STATES = [
    "scheduled",
    "confirmed",
    "checked_in",
    "on_break",
    "checked_out",
    "no_show",
    "cancelled",
] as const;
export type CrewShiftState = (typeof CREW_SHIFT_STATES)[number];

export const CREW_SHIFT_MACHINE = defineStateMachine<CrewShiftState>({
    name: "crew_shift",
    initialState: "scheduled",
    states: CREW_SHIFT_STATES,
    terminalStates: ["checked_out", "no_show", "cancelled"],
    transitions: [
        {
            from: "scheduled",
            to: "confirmed",
            roles: ["exec", "director", "pm", "member"],
            label: "Confirm",
        },
        {
            from: "confirmed",
            to: "checked_in",
            roles: ["exec", "director", "pm", "member"],
            label: "Check In",
        },
        {
            from: "scheduled",
            to: "checked_in",
            roles: ["exec", "director", "pm", "member"],
            label: "Check In",
        },
        {
            from: "checked_in",
            to: "on_break",
            roles: ["exec", "director", "pm", "member"],
            label: "Start Break",
        },
        {
            from: "on_break",
            to: "checked_in",
            roles: ["exec", "director", "pm", "member"],
            label: "End Break",
        },
        {
            from: "checked_in",
            to: "checked_out",
            roles: ["exec", "director", "pm", "member"],
            label: "Check Out",
        },
        {
            from: "scheduled",
            to: "no_show",
            roles: ["exec", "director", "pm"],
            label: "Mark No-Show",
        },
        {
            from: "confirmed",
            to: "no_show",
            roles: ["exec", "director", "pm"],
            label: "Mark No-Show",
        },
        { from: "scheduled", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "confirmed", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
    ],
});
