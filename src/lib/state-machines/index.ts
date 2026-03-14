/**
 * State Machine Registry
 *
 * Central export of all entity state machines.
 * Each machine is defined declaratively and validated at import time.
 */

export { PROJECT_MACHINE } from "./project";
export { TASK_MACHINE } from "./task";
export { DEAL_MACHINE } from "./deal";
export { CONTRACT_MACHINE } from "./contract";
export { INVOICE_MACHINE } from "./invoice";
export { SOW_MACHINE } from "./sow";
export { EXPENSE_MACHINE } from "./expense";
export { VENDOR_MACHINE } from "./vendor";
export { WORK_ORDER_MACHINE } from "./work-order";
export { ASSET_MACHINE } from "./asset";
export { SHIPMENT_MACHINE } from "./shipment";
export { OPPORTUNITY_MACHINE } from "./opportunity";
export { CHANGE_ORDER_MACHINE } from "./change-order";
export { SERVICE_REQUEST_MACHINE } from "./service-request";
export { PURCHASE_ORDER_MACHINE } from "./purchase-order";
export { MILESTONE_MACHINE } from "./milestone";
export { CREW_SHIFT_MACHINE } from "./crew-shift";
export { TIME_ENTRY_MACHINE } from "./time-entry";
export { LIVE_EVENT_MACHINE } from "./live-event";
export { ROS_CUE_MACHINE } from "./ros-cue";
export { READINESS_GATE_MACHINE } from "./readiness-gate";
export { DOCUMENT_MACHINE } from "./document";
export { INCIDENT_MACHINE } from "./incident";
export { APPROVAL_INSTANCE_MACHINE } from "./approval-instance";
export { ESTIMATE_MACHINE } from "./estimate";
export { RENTAL_AGREEMENT_MACHINE } from "./rental-agreement";
export { RIGHTS_MACHINE } from "./rights";
export { LEAD_MACHINE } from "./lead";
export { CAMPAIGN_MACHINE } from "./campaign";
export { PROPOSAL_MACHINE } from "./proposal";
export { CLIENT_INVOICE_MACHINE } from "./client-invoice";
export { PAYMENT_MACHINE } from "./payment";
export { ACTIVATION_MACHINE } from "./activation";
export { PERMIT_MACHINE } from "./permit";

/** Lookup machine by entity name */
export { getMachineForEntity } from "./registry";
