import { defineStateMachine } from "@/lib/state-machine";

export const ROS_CUE_STATES = [
    "standby",
    "warned",
    "go",
    "executing",
    "completed",
    "skipped",
    "held",
] as const;
export type RosCueState = (typeof ROS_CUE_STATES)[number];

export const ROS_CUE_MACHINE = defineStateMachine<RosCueState>({
    name: "ros_cue",
    initialState: "standby",
    states: ROS_CUE_STATES,
    terminalStates: ["completed", "skipped"],
    transitions: [
        {
            from: "standby",
            to: "warned",
            roles: ["exec", "director", "pm", "member"],
            label: "Warn",
        },
        {
            from: "warned",
            to: "go",
            roles: ["exec", "director", "pm", "member"],
            label: "Go",
            sideEffects: ["postToChannel"],
        },
        {
            from: "go",
            to: "executing",
            roles: ["exec", "director", "pm", "member"],
            label: "Executing",
        },
        {
            from: "executing",
            to: "completed",
            roles: ["exec", "director", "pm", "member"],
            label: "Complete",
        },
        { from: "standby", to: "skipped", roles: ["exec", "director", "pm"], label: "Skip" },
        { from: "warned", to: "skipped", roles: ["exec", "director", "pm"], label: "Skip" },
        { from: "standby", to: "held", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "warned", to: "held", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "go", to: "held", roles: ["exec", "director", "pm"], label: "Hold" },
        { from: "held", to: "standby", roles: ["exec", "director", "pm"], label: "Release Hold" },
    ],
});
