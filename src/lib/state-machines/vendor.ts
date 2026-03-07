import { defineStateMachine } from "@/lib/state-machine";

export const VENDOR_STATES = [
    "prospect",
    "application",
    "review",
    "onboarding",
    "active",
    "probation",
    "suspended",
    "inactive",
    "blacklisted",
] as const;
export type VendorState = (typeof VENDOR_STATES)[number];

export const VENDOR_MACHINE = defineStateMachine<VendorState>({
    name: "vendor",
    initialState: "prospect",
    states: VENDOR_STATES,
    terminalStates: ["blacklisted"],
    transitions: [
        {
            from: "prospect",
            to: "application",
            roles: ["exec", "director", "pm"],
            label: "Invite to Apply",
        },
        {
            from: "application",
            to: "review",
            roles: ["exec", "director", "pm"],
            label: "Submit for Review",
        },
        {
            from: "review",
            to: "onboarding",
            roles: ["exec", "director"],
            label: "Approve",
            sideEffects: ["sendOnboardingEmail"],
        },
        { from: "review", to: "prospect", roles: ["exec", "director"], label: "Reject" },
        {
            from: "onboarding",
            to: "active",
            roles: ["exec", "director", "pm"],
            label: "Complete Onboarding",
            guard: "hasComplianceDocs",
        },
        {
            from: "active",
            to: "probation",
            roles: ["exec", "director"],
            label: "Place on Probation",
        },
        { from: "probation", to: "active", roles: ["exec", "director"], label: "Restore Active" },
        { from: "probation", to: "suspended", roles: ["exec", "director"], label: "Suspend" },
        { from: "active", to: "suspended", roles: ["exec", "director"], label: "Suspend" },
        { from: "suspended", to: "active", roles: ["exec", "director"], label: "Reinstate" },
        { from: "suspended", to: "blacklisted", roles: ["exec"], label: "Blacklist" },
        { from: "active", to: "inactive", roles: ["exec", "director"], label: "Deactivate" },
        { from: "inactive", to: "active", roles: ["exec", "director"], label: "Reactivate" },
        { from: "inactive", to: "blacklisted", roles: ["exec"], label: "Blacklist" },
    ],
});
