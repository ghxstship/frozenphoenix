import type { StateMachineDefinition } from "@/lib/state-machine";
import { PROJECT_MACHINE } from "./project";
import { TASK_MACHINE } from "./task";
import { DEAL_MACHINE } from "./deal";
import { CONTRACT_MACHINE } from "./contract";
import { INVOICE_MACHINE } from "./invoice";
import { SOW_MACHINE } from "./sow";
import { EXPENSE_MACHINE } from "./expense";
import { VENDOR_MACHINE } from "./vendor";
import { WORK_ORDER_MACHINE } from "./work-order";
import { ASSET_MACHINE } from "./asset";
import { SHIPMENT_MACHINE } from "./shipment";
import { OPPORTUNITY_MACHINE } from "./opportunity";
import { CHANGE_ORDER_MACHINE } from "./change-order";
import { SERVICE_REQUEST_MACHINE } from "./service-request";
import { PURCHASE_ORDER_MACHINE } from "./purchase-order";
import { MILESTONE_MACHINE } from "./milestone";
import { CREW_SHIFT_MACHINE } from "./crew-shift";
import { TIME_ENTRY_MACHINE } from "./time-entry";
import { LIVE_EVENT_MACHINE } from "./live-event";
import { ROS_CUE_MACHINE } from "./ros-cue";
import { READINESS_GATE_MACHINE } from "./readiness-gate";
import { DOCUMENT_MACHINE } from "./document";
import { INCIDENT_MACHINE } from "./incident";
import { APPROVAL_INSTANCE_MACHINE } from "./approval-instance";
import { ESTIMATE_MACHINE } from "./estimate";
import { RENTAL_AGREEMENT_MACHINE } from "./rental-agreement";
import { RIGHTS_MACHINE } from "./rights";
import { LEAD_MACHINE } from "./lead";
import { CAMPAIGN_MACHINE } from "./campaign";
import { PROPOSAL_MACHINE } from "./proposal";
import { CLIENT_INVOICE_MACHINE } from "./client-invoice";
import { PAYMENT_MACHINE } from "./payment";
import { ACTIVATION_MACHINE } from "./activation";
import { PERMIT_MACHINE } from "./permit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, StateMachineDefinition<any>> = {
    project: PROJECT_MACHINE,
    task: TASK_MACHINE,
    deal: DEAL_MACHINE,
    contract: CONTRACT_MACHINE,
    invoice: INVOICE_MACHINE,
    sow: SOW_MACHINE,
    scope_of_work: SOW_MACHINE,
    expense: EXPENSE_MACHINE,
    vendor: VENDOR_MACHINE,
    work_order: WORK_ORDER_MACHINE,
    asset: ASSET_MACHINE,
    shipment: SHIPMENT_MACHINE,
    opportunity: OPPORTUNITY_MACHINE,
    change_order: CHANGE_ORDER_MACHINE,
    service_request: SERVICE_REQUEST_MACHINE,
    purchase_order: PURCHASE_ORDER_MACHINE,
    milestone: MILESTONE_MACHINE,
    crew_shift: CREW_SHIFT_MACHINE,
    time_entry: TIME_ENTRY_MACHINE,
    live_event: LIVE_EVENT_MACHINE,
    ros_cue: ROS_CUE_MACHINE,
    readiness_gate: READINESS_GATE_MACHINE,
    document: DOCUMENT_MACHINE,
    incident: INCIDENT_MACHINE,
    approval_instance: APPROVAL_INSTANCE_MACHINE,
    workflow_instance: APPROVAL_INSTANCE_MACHINE,
    estimate: ESTIMATE_MACHINE,
    rental_agreement: RENTAL_AGREEMENT_MACHINE,
    rights: RIGHTS_MACHINE,
    rights_license: RIGHTS_MACHINE,
    lead: LEAD_MACHINE,
    campaign: CAMPAIGN_MACHINE,
    proposal: PROPOSAL_MACHINE,
    client_invoice: CLIENT_INVOICE_MACHINE,
    payment: PAYMENT_MACHINE,
    activation: ACTIVATION_MACHINE,
    permit: PERMIT_MACHINE,
};

/**
 * Look up the state machine definition for a given entity name.
 * Supports both snake_case DB names and kebab-case URL slugs.
 */
export function getMachineForEntity(
    entityName: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): StateMachineDefinition<any> | undefined {
    const normalized = entityName.toLowerCase().replace(/-/g, "_");
    return REGISTRY[normalized];
}
