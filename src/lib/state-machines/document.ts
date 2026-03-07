import { defineStateMachine } from "@/lib/state-machine";

export const DOCUMENT_STATES = [
    "draft",
    "pending_review",
    "approved",
    "published",
    "archived",
    "superseded",
] as const;
export type DocumentState = (typeof DOCUMENT_STATES)[number];

export const DOCUMENT_MACHINE = defineStateMachine<DocumentState>({
    name: "document",
    initialState: "draft",
    states: DOCUMENT_STATES,
    terminalStates: ["archived", "superseded"],
    transitions: [
        {
            from: "draft",
            to: "pending_review",
            roles: ["exec", "director", "pm", "member"],
            label: "Submit",
        },
        {
            from: "pending_review",
            to: "approved",
            roles: ["exec", "director", "pm"],
            label: "Approve",
        },
        { from: "pending_review", to: "draft", roles: ["exec", "director", "pm"], label: "Return" },
        { from: "approved", to: "published", roles: ["exec", "director", "pm"], label: "Publish" },
        { from: "published", to: "archived", roles: ["exec", "director"], label: "Archive" },
        {
            from: "published",
            to: "superseded",
            roles: ["exec", "director", "pm"],
            label: "Supersede",
        },
        { from: "approved", to: "archived", roles: ["exec", "director"], label: "Archive" },
        { from: "draft", to: "archived", roles: ["exec", "director"], label: "Archive" },
    ],
});
