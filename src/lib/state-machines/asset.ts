import { defineStateMachine } from "@/lib/state-machine";

export const ASSET_STATES = [
    "available",
    "reserved",
    "checked_out",
    "in_transit",
    "deployed",
    "needs_repair",
    "in_maintenance",
    "decommissioned",
    "lost",
] as const;
export type AssetState = (typeof ASSET_STATES)[number];

export const ASSET_MACHINE = defineStateMachine<AssetState>({
    name: "asset",
    initialState: "available",
    states: ASSET_STATES,
    terminalStates: ["decommissioned", "lost"],
    transitions: [
        {
            from: "available",
            to: "reserved",
            roles: ["exec", "director", "pm", "member"],
            label: "Reserve",
        },
        {
            from: "reserved",
            to: "available",
            roles: ["exec", "director", "pm", "member"],
            label: "Release Reservation",
        },
        {
            from: "reserved",
            to: "checked_out",
            roles: ["exec", "director", "pm", "member"],
            label: "Check Out",
        },
        {
            from: "available",
            to: "checked_out",
            roles: ["exec", "director", "pm", "member"],
            label: "Check Out",
        },
        {
            from: "checked_out",
            to: "in_transit",
            roles: ["exec", "director", "pm", "member"],
            label: "Ship",
        },
        {
            from: "in_transit",
            to: "deployed",
            roles: ["exec", "director", "pm", "member"],
            label: "Deploy on Site",
        },
        {
            from: "deployed",
            to: "in_transit",
            roles: ["exec", "director", "pm", "member"],
            label: "Ship Back",
        },
        {
            from: "in_transit",
            to: "available",
            roles: ["exec", "director", "pm", "member"],
            label: "Receive & Shelve",
        },
        {
            from: "checked_out",
            to: "available",
            roles: ["exec", "director", "pm", "member"],
            label: "Return",
        },
        {
            from: "deployed",
            to: "available",
            roles: ["exec", "director", "pm", "member"],
            label: "Return",
        },
        {
            from: "available",
            to: "needs_repair",
            roles: ["exec", "director", "pm", "member"],
            label: "Flag for Repair",
        },
        {
            from: "checked_out",
            to: "needs_repair",
            roles: ["exec", "director", "pm", "member"],
            label: "Flag for Repair",
        },
        {
            from: "deployed",
            to: "needs_repair",
            roles: ["exec", "director", "pm", "member"],
            label: "Flag for Repair",
        },
        {
            from: "needs_repair",
            to: "in_maintenance",
            roles: ["exec", "director", "pm"],
            label: "Send to Maintenance",
        },
        {
            from: "in_maintenance",
            to: "available",
            roles: ["exec", "director", "pm"],
            label: "Repair Complete",
        },
        {
            from: "in_maintenance",
            to: "decommissioned",
            roles: ["exec", "director"],
            label: "Decommission",
        },
        {
            from: "needs_repair",
            to: "decommissioned",
            roles: ["exec", "director"],
            label: "Decommission",
        },
        {
            from: "available",
            to: "decommissioned",
            roles: ["exec", "director"],
            label: "Decommission",
        },
        { from: "checked_out", to: "lost", roles: ["exec", "director", "pm"], label: "Mark Lost" },
        { from: "in_transit", to: "lost", roles: ["exec", "director", "pm"], label: "Mark Lost" },
        { from: "deployed", to: "lost", roles: ["exec", "director", "pm"], label: "Mark Lost" },
    ],
});
