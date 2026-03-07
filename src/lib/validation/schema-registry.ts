/* ═══════════════════════════════════════════════════════════════
   SCHEMA REGISTRY — P0.5 Foundation Infrastructure
   
   Maps entity names to their Zod create/update validation schemas.
   Used by the CRUD API factory and CreateEntityDialog.
   ═══════════════════════════════════════════════════════════════ */

import type { ZodSchema } from "zod";

import {
    approvalCreateSchema,
    approvalUpdateSchema,
    assetCreateSchema,
    assetUpdateSchema,
    budgetCreateSchema,
    contractCreateSchema,
    contractUpdateSchema,
    crewCreateSchema,
    crewUpdateSchema,
    dealCreateSchema,
    dealUpdateSchema,
    invoiceCreateSchema,
    invoiceUpdateSchema,
    projectCreateSchema,
    projectUpdateSchema,
    taskCreateSchema,
    taskUpdateSchema,
    vendorCreateSchema,
    vendorUpdateSchema,
} from "./schemas";

import {
    changeOrderCreateSchema,
    changeOrderUpdateSchema,
    crewShiftCreateSchema,
    crewShiftUpdateSchema,
    documentCreateSchema,
    documentUpdateSchema,
    estimateCreateSchema,
    estimateUpdateSchema,
    expenseCreateSchema,
    expenseUpdateSchema,
    incidentCreateSchema,
    incidentUpdateSchema,
    liveEventCreateSchema,
    liveEventUpdateSchema,
    milestoneCreateSchema,
    milestoneUpdateSchema,
    opportunityCreateSchema,
    opportunityUpdateSchema,
    purchaseOrderCreateSchema,
    purchaseOrderUpdateSchema,
    readinessGateCreateSchema,
    readinessGateUpdateSchema,
    rentalAgreementCreateSchema,
    rentalAgreementUpdateSchema,
    rightsCreateSchema,
    rightsUpdateSchema,
    rosCueCreateSchema,
    rosCueUpdateSchema,
    serviceRequestCreateSchema,
    serviceRequestUpdateSchema,
    shipmentCreateSchema,
    shipmentUpdateSchema,
    sowCreateSchema,
    sowUpdateSchema,
    timeEntryCreateSchema,
    timeEntryUpdateSchema,
    workOrderCreateSchema,
    workOrderUpdateSchema,
} from "./entity-schemas";

// ─── Registry Entry ──────────────────────────────────────────

export interface SchemaEntry {
    create: ZodSchema;
    update: ZodSchema;
}

// ─── Registry ────────────────────────────────────────────────

const SCHEMA_REGISTRY: Record<string, SchemaEntry> = {
    project: { create: projectCreateSchema, update: projectUpdateSchema },
    task: { create: taskCreateSchema, update: taskUpdateSchema },
    deal: { create: dealCreateSchema, update: dealUpdateSchema },
    contract: { create: contractCreateSchema, update: contractUpdateSchema },
    invoice: { create: invoiceCreateSchema, update: invoiceUpdateSchema },
    vendor: { create: vendorCreateSchema, update: vendorUpdateSchema },
    asset: { create: assetCreateSchema, update: assetUpdateSchema },
    crew_member: { create: crewCreateSchema, update: crewUpdateSchema },
    approval: { create: approvalCreateSchema, update: approvalUpdateSchema },
    budget: { create: budgetCreateSchema, update: budgetCreateSchema.partial() },
    opportunity: { create: opportunityCreateSchema, update: opportunityUpdateSchema },
    sow: { create: sowCreateSchema, update: sowUpdateSchema },
    scope_of_work: { create: sowCreateSchema, update: sowUpdateSchema },
    expense: { create: expenseCreateSchema, update: expenseUpdateSchema },
    work_order: { create: workOrderCreateSchema, update: workOrderUpdateSchema },
    shipment: { create: shipmentCreateSchema, update: shipmentUpdateSchema },
    change_order: { create: changeOrderCreateSchema, update: changeOrderUpdateSchema },
    service_request: { create: serviceRequestCreateSchema, update: serviceRequestUpdateSchema },
    purchase_order: { create: purchaseOrderCreateSchema, update: purchaseOrderUpdateSchema },
    milestone: { create: milestoneCreateSchema, update: milestoneUpdateSchema },
    crew_shift: { create: crewShiftCreateSchema, update: crewShiftUpdateSchema },
    time_entry: { create: timeEntryCreateSchema, update: timeEntryUpdateSchema },
    live_event: { create: liveEventCreateSchema, update: liveEventUpdateSchema },
    ros_cue: { create: rosCueCreateSchema, update: rosCueUpdateSchema },
    readiness_gate: { create: readinessGateCreateSchema, update: readinessGateUpdateSchema },
    document: { create: documentCreateSchema, update: documentUpdateSchema },
    incident: { create: incidentCreateSchema, update: incidentUpdateSchema },
    estimate: { create: estimateCreateSchema, update: estimateUpdateSchema },
    rental_agreement: { create: rentalAgreementCreateSchema, update: rentalAgreementUpdateSchema },
    rights: { create: rightsCreateSchema, update: rightsUpdateSchema },
};

/**
 * Look up the validation schemas for a given entity name.
 * Supports both snake_case DB names and kebab-case URL slugs.
 */
export function getSchemasForEntity(entityName: string): SchemaEntry | undefined {
    const normalized = entityName.toLowerCase().replace(/-/g, "_");
    return SCHEMA_REGISTRY[normalized];
}

/**
 * Get all registered entity names.
 */
export function getRegisteredEntities(): string[] {
    return Object.keys(SCHEMA_REGISTRY);
}
