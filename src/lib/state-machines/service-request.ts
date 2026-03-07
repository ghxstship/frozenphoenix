import { defineStateMachine } from "@/lib/state-machine";

export const SERVICE_REQUEST_STATES = [
    "new",
    "triaged",
    "assigned",
    "in_progress",
    "pending_info",
    "resolved",
    "closed",
    "cancelled",
] as const;
export type ServiceRequestState = (typeof SERVICE_REQUEST_STATES)[number];

export const SERVICE_REQUEST_MACHINE = defineStateMachine<ServiceRequestState>({
    name: "service_request",
    initialState: "new",
    states: SERVICE_REQUEST_STATES,
    terminalStates: ["closed", "cancelled"],
    transitions: [
        { from: "new", to: "triaged", roles: ["exec", "director", "pm"], label: "Triage" },
        { from: "triaged", to: "assigned", roles: ["exec", "director", "pm"], label: "Assign" },
        {
            from: "assigned",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member"],
            label: "Start Work",
        },
        {
            from: "in_progress",
            to: "pending_info",
            roles: ["exec", "director", "pm", "member"],
            label: "Request Info",
        },
        {
            from: "pending_info",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member", "client"],
            label: "Info Provided",
        },
        {
            from: "in_progress",
            to: "resolved",
            roles: ["exec", "director", "pm", "member"],
            label: "Resolve",
        },
        {
            from: "resolved",
            to: "closed",
            roles: ["exec", "director", "pm", "client"],
            label: "Close",
        },
        {
            from: "resolved",
            to: "in_progress",
            roles: ["exec", "director", "pm", "client"],
            label: "Reopen",
        },
        { from: "new", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "triaged", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
    ],
});
