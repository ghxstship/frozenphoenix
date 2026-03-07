import { defineStateMachine } from "@/lib/state-machine";

export const TASK_STATES = [
    "backlog",
    "todo",
    "in_progress",
    "review",
    "completed",
    "blocked",
    "cancelled",
] as const;

export type TaskState = (typeof TASK_STATES)[number];

export const TASK_MACHINE = defineStateMachine<TaskState>({
    name: "task",
    initialState: "backlog",
    states: TASK_STATES,
    terminalStates: ["completed", "cancelled"],
    transitions: [
        {
            from: "backlog",
            to: "todo",
            roles: ["exec", "director", "pm", "member"],
            label: "Move to Todo",
        },
        {
            from: "todo",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member"],
            label: "Start Work",
            guard: "hasAssignee",
        },
        {
            from: "in_progress",
            to: "review",
            roles: ["exec", "director", "pm", "member"],
            label: "Submit for Review",
        },
        {
            from: "review",
            to: "completed",
            roles: ["exec", "director", "pm"],
            label: "Approve & Complete",
            sideEffects: ["notifyAssignee"],
        },
        {
            from: "review",
            to: "in_progress",
            roles: ["exec", "director", "pm"],
            label: "Request Changes",
            sideEffects: ["notifyAssignee"],
        },
        {
            from: "in_progress",
            to: "blocked",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Blocked",
        },
        {
            from: "blocked",
            to: "in_progress",
            roles: ["exec", "director", "pm", "member"],
            label: "Unblock",
        },
        { from: "blocked", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "backlog", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "todo", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        {
            from: "in_progress",
            to: "cancelled",
            roles: ["exec", "director", "pm"],
            label: "Cancel",
        },
        {
            from: "todo",
            to: "backlog",
            roles: ["exec", "director", "pm"],
            label: "Move to Backlog",
        },
    ],
    requiredFields: {
        in_progress: ["assignee_id"],
    },
});
