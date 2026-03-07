import { defineStateMachine } from "@/lib/state-machine";

export const CONTRACT_STATES = [
    "draft",
    "pending_review",
    "pending_signature",
    "active",
    "expired",
    "terminated",
] as const;

export type ContractState = (typeof CONTRACT_STATES)[number];

export const CONTRACT_MACHINE = defineStateMachine<ContractState>({
    name: "contract",
    initialState: "draft",
    states: CONTRACT_STATES,
    terminalStates: ["expired", "terminated"],
    transitions: [
        {
            from: "draft",
            to: "pending_review",
            roles: ["exec", "director", "pm"],
            label: "Submit for Review",
            guard: "hasRequiredFields",
        },
        {
            from: "pending_review",
            to: "pending_signature",
            roles: ["exec", "director"],
            label: "Approve & Send for Signature",
            sideEffects: ["triggerApproval"],
        },
        {
            from: "pending_review",
            to: "draft",
            roles: ["exec", "director", "pm"],
            label: "Return to Draft",
        },
        {
            from: "pending_signature",
            to: "active",
            roles: ["exec", "director"],
            label: "Mark as Signed",
            sideEffects: ["notifyStakeholders"],
        },
        {
            from: "pending_signature",
            to: "draft",
            roles: ["exec", "director"],
            label: "Decline Signature",
        },
        { from: "active", to: "expired", roles: ["exec", "director"], label: "Mark Expired" },
        {
            from: "active",
            to: "terminated",
            roles: ["exec", "director"],
            label: "Terminate",
            sideEffects: ["notifyStakeholders", "createTerminationRecord"],
        },
        { from: "draft", to: "terminated", roles: ["exec", "director"], label: "Cancel" },
        { from: "pending_review", to: "terminated", roles: ["exec", "director"], label: "Cancel" },
    ],
    requiredFields: {
        pending_review: ["title", "contract_type", "start_date"],
        active: ["title", "contract_type", "start_date", "end_date"],
    },
});
