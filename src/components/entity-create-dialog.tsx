"use client";

/* ═══════════════════════════════════════════════════════════════
   ENTITY CREATE DIALOG — P0.6 Foundation Infrastructure
   
   A higher-level wrapper around CreateEntityDialog that:
   - Resolves entity config + form config + Zod schema by name
   - Wires mutation hooks automatically (POST to API)
   - Validates via Zod before submission
   - Shows toast on success/error
   - Invalidates React Query cache on success
   
   Usage:
     <EntityCreateDialog entityName="project" open={open} onClose={close} />
   
   Or with the URL-synced hook:
     const [open, doOpen, doClose] = useCreateAction();
     <EntityCreateDialog entityName="project" open={open} onClose={doClose} />
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
    CreateEntityDialog,
    type CreateEntityConfig as FormConfig,
} from "@/components/create-entity-dialog";
import { getEntityConfig } from "@/lib/api/entity-config";
import { getSchemasForEntity } from "@/lib/validation/schema-registry";
import { useToast } from "@/components/ui/toast";

// ─── Form Config Lookup ──────────────────────────────────────
// Maps entity names to their existing CREATE_*_CONFIG objects.
// We import them lazily so this file doesn't pull the entire config bundle.

import {
    CREATE_ACCOUNT_CONFIG,
    CREATE_ACTIVATION_CONFIG,
    CREATE_ASSET_CONFIG,
    CREATE_BRAND_GUIDELINE_CONFIG,
    CREATE_BRAND_KIT_CONFIG,
    CREATE_BRIEF_CONFIG,
    CREATE_BUDGET_CONFIG,
    CREATE_CAMPAIGN_CONFIG,
    CREATE_CERTIFICATION_CONFIG,
    CREATE_CLIENT_INVOICE_CONFIG,
    CREATE_COMPLIANCE_CHECKLIST_CONFIG,
    CREATE_CONTACT_CONFIG,
    CREATE_CONTRACT_CONFIG,
    CREATE_DEAL_CONFIG,
    CREATE_DECK_CONFIG,
    CREATE_DISPATCH_CONFIG,
    CREATE_ESTIMATE_CONFIG,
    CREATE_EVENT_CONFIG,
    CREATE_EXPENSE_CONFIG,
    CREATE_INCIDENT_CONFIG,
    CREATE_INSURANCE_POLICY_CONFIG,
    CREATE_INVOICE_CONFIG,
    CREATE_LEAD_CONFIG,
    CREATE_OPPORTUNITY_CONFIG,
    CREATE_PERMIT_CONFIG,
    CREATE_PERSON_CONFIG,
    CREATE_PROJECT_CONFIG,
    CREATE_PROPOSAL_CONFIG,
    CREATE_PURCHASE_ORDER_CONFIG,
    CREATE_PURCHASE_REQUISITION_CONFIG,
    CREATE_RECURRING_INVOICE_CONFIG,
    CREATE_SERVICE_REQUEST_CONFIG,
    CREATE_SHIPMENT_CONFIG,
    CREATE_SOW_CONFIG,
    CREATE_TASK_CONFIG,
    CREATE_TECH_SHEET_CONFIG,
    CREATE_VENDOR_CONFIG,
    CREATE_VENDOR_REVIEW_CONFIG,
    CREATE_WORK_ORDER_CONFIG,
    CREATE_WORKFORCE_CONFIG,
} from "@/config/create-entity-configs";

const FORM_CONFIGS: Record<string, FormConfig> = {
    project: CREATE_PROJECT_CONFIG,
    task: CREATE_TASK_CONFIG,
    live_event: CREATE_EVENT_CONFIG,
    event: CREATE_EVENT_CONFIG,
    activation: CREATE_ACTIVATION_CONFIG,
    sow: CREATE_SOW_CONFIG,
    scope_of_work: CREATE_SOW_CONFIG,
    deal: CREATE_DEAL_CONFIG,
    lead: CREATE_LEAD_CONFIG,
    opportunity: CREATE_OPPORTUNITY_CONFIG,
    contact: CREATE_CONTACT_CONFIG,
    service_request: CREATE_SERVICE_REQUEST_CONFIG,
    invoice: CREATE_INVOICE_CONFIG,
    expense: CREATE_EXPENSE_CONFIG,
    estimate: CREATE_ESTIMATE_CONFIG,
    budget: CREATE_BUDGET_CONFIG,
    purchase_order: CREATE_PURCHASE_ORDER_CONFIG,
    vendor: CREATE_VENDOR_CONFIG,
    work_order: CREATE_WORK_ORDER_CONFIG,
    contract: CREATE_CONTRACT_CONFIG,
    incident: CREATE_INCIDENT_CONFIG,
    asset: CREATE_ASSET_CONFIG,
    shipment: CREATE_SHIPMENT_CONFIG,
    account: CREATE_ACCOUNT_CONFIG,
    person: CREATE_PERSON_CONFIG,
    crew_member: CREATE_WORKFORCE_CONFIG,
    brief: CREATE_BRIEF_CONFIG,
    campaign: CREATE_CAMPAIGN_CONFIG,
    proposal: CREATE_PROPOSAL_CONFIG,
    brand_guideline: CREATE_BRAND_GUIDELINE_CONFIG,
    brand_kit: CREATE_BRAND_KIT_CONFIG,
    deck: CREATE_DECK_CONFIG,
    tech_sheet: CREATE_TECH_SHEET_CONFIG,
    certification: CREATE_CERTIFICATION_CONFIG,
    compliance_checklist: CREATE_COMPLIANCE_CHECKLIST_CONFIG,
    insurance_policy: CREATE_INSURANCE_POLICY_CONFIG,
    permit: CREATE_PERMIT_CONFIG,
    client_invoice: CREATE_CLIENT_INVOICE_CONFIG,
    recurring_invoice: CREATE_RECURRING_INVOICE_CONFIG,
    dispatch: CREATE_DISPATCH_CONFIG,
    vendor_review: CREATE_VENDOR_REVIEW_CONFIG,
    purchase_requisition: CREATE_PURCHASE_REQUISITION_CONFIG,
};

function getFormConfig(entityName: string): FormConfig | undefined {
    const normalized = entityName.toLowerCase().replace(/-/g, "_");
    return FORM_CONFIGS[normalized];
}

// ─── Props ───────────────────────────────────────────────────

interface EntityCreateDialogProps {
    /** Entity name (snake_case or kebab-case) */
    entityName: string;
    /** Dialog open state */
    open: boolean;
    /** Close callback */
    onClose: () => void;
    /** Override the form config */
    formConfig?: FormConfig;
    /** Override the API base path */
    basePath?: string;
    /** Extra data to merge into the payload (e.g. project_id for scoped creates) */
    defaults?: Record<string, unknown>;
    /** Callback after successful creation */
    onSuccess?: (data: unknown) => void;
}

// ─── Component ───────────────────────────────────────────────

export function EntityCreateDialog({
    entityName,
    open,
    onClose,
    formConfig: formConfigOverride,
    basePath: basePathOverride,
    defaults,
    onSuccess,
}: EntityCreateDialogProps) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // Resolve config
    const entityConfig = useMemo(() => getEntityConfig(entityName), [entityName]);
    const formConfig = formConfigOverride ?? getFormConfig(entityName);
    const schemas = useMemo(() => getSchemasForEntity(entityName), [entityName]);
    const apiPath =
        basePathOverride ?? entityConfig?.basePath ?? `/api/${entityName.replace(/_/g, "-")}`;

    const handleSubmit = useCallback(
        async (values: Record<string, unknown>) => {
            const payload = defaults ? { ...defaults, ...values } : values;

            // Zod validation (if schema exists)
            if (schemas?.create) {
                const result = schemas.create.safeParse(payload);
                if (!result.success) {
                    const firstError = result.error.issues[0];
                    if (firstError) {
                        const fieldPath = firstError.path.join(".");
                        addToast({
                            title: "Validation error",
                            description: `${fieldPath}: ${firstError.message}`,
                            variant: "destructive",
                        });
                    }
                    throw new Error("Validation failed");
                }
            }

            // API call
            const response = await fetch(apiPath, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Idempotency-Key": `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
                },
                body: JSON.stringify(payload),
            });

            const body = await response.json();

            if (!response.ok) {
                const message =
                    body?.error?.message ??
                    body?.message ??
                    `Failed to create ${entityConfig?.displayName ?? entityName}`;
                addToast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });
                throw new Error(message);
            }

            // Success
            if (entityConfig?.queryKey) {
                queryClient.invalidateQueries({ queryKey: entityConfig.queryKey });
            }
            if (entityConfig?.relatedKeys) {
                for (const key of entityConfig.relatedKeys) {
                    queryClient.invalidateQueries({ queryKey: key });
                }
            }

            addToast({
                title: `${entityConfig?.displayName ?? entityName} created`,
                variant: "success",
            });

            onSuccess?.(body.data ?? body);
        },
        [apiPath, defaults, entityConfig, entityName, onSuccess, queryClient, schemas, addToast]
    );

    if (!formConfig) {
        return null;
    }

    return (
        <CreateEntityDialog
            config={formConfig}
            open={open}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}
