import { defineStateMachine } from "@/lib/state-machine";

export const SHIPMENT_STATES = [
    "draft",
    "booked",
    "picked_up",
    "in_transit",
    "at_customs",
    "out_for_delivery",
    "delivered",
    "returned",
    "cancelled",
] as const;
export type ShipmentState = (typeof SHIPMENT_STATES)[number];

export const SHIPMENT_MACHINE = defineStateMachine<ShipmentState>({
    name: "shipment",
    initialState: "draft",
    states: SHIPMENT_STATES,
    terminalStates: ["delivered", "returned", "cancelled"],
    transitions: [
        {
            from: "draft",
            to: "booked",
            roles: ["exec", "director", "pm", "member"],
            label: "Book Shipment",
        },
        {
            from: "booked",
            to: "picked_up",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Picked Up",
        },
        {
            from: "picked_up",
            to: "in_transit",
            roles: ["exec", "director", "pm", "member"],
            label: "In Transit",
        },
        {
            from: "in_transit",
            to: "at_customs",
            roles: ["exec", "director", "pm"],
            label: "At Customs",
        },
        {
            from: "at_customs",
            to: "in_transit",
            roles: ["exec", "director", "pm"],
            label: "Cleared Customs",
        },
        {
            from: "in_transit",
            to: "out_for_delivery",
            roles: ["exec", "director", "pm", "member"],
            label: "Out for Delivery",
        },
        {
            from: "out_for_delivery",
            to: "delivered",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Delivered",
            sideEffects: ["notifyRecipient", "updateInventory"],
        },
        {
            from: "in_transit",
            to: "delivered",
            roles: ["exec", "director", "pm", "member"],
            label: "Mark Delivered",
            sideEffects: ["notifyRecipient", "updateInventory"],
        },
        {
            from: "delivered",
            to: "returned",
            roles: ["exec", "director", "pm"],
            label: "Process Return",
        },
        { from: "draft", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
        { from: "booked", to: "cancelled", roles: ["exec", "director", "pm"], label: "Cancel" },
    ],
});
