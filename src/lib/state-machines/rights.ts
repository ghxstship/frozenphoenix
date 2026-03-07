import { defineStateMachine } from "@/lib/state-machine";

export const RIGHTS_STATES = [
    "draft",
    "pending_clearance",
    "cleared",
    "active",
    "expired",
    "revoked",
    "disputed",
] as const;
export type RightsState = (typeof RIGHTS_STATES)[number];

export const RIGHTS_MACHINE = defineStateMachine<RightsState>({
    name: "rights",
    initialState: "draft",
    states: RIGHTS_STATES,
    terminalStates: ["expired", "revoked"],
    transitions: [
        {
            from: "draft",
            to: "pending_clearance",
            roles: ["exec", "director", "pm"],
            label: "Submit for Clearance",
        },
        { from: "pending_clearance", to: "cleared", roles: ["exec", "director"], label: "Clear" },
        {
            from: "pending_clearance",
            to: "draft",
            roles: ["exec", "director", "pm"],
            label: "Return",
        },
        { from: "cleared", to: "active", roles: ["exec", "director", "pm"], label: "Activate" },
        { from: "active", to: "expired", roles: ["exec", "director"], label: "Mark Expired" },
        { from: "active", to: "revoked", roles: ["exec", "director"], label: "Revoke" },
        { from: "active", to: "disputed", roles: ["exec", "director", "pm"], label: "Dispute" },
        { from: "disputed", to: "active", roles: ["exec", "director"], label: "Resolve" },
        { from: "disputed", to: "revoked", roles: ["exec", "director"], label: "Revoke" },
    ],
});
