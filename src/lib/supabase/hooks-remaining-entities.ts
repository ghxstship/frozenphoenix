"use client";

/**
 * Supabase hooks for the remaining entity configs that lacked dedicated hooks.
 * Uses the same API-route-backed factory pattern as hooks-pages.ts / hooks-extended.ts.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import type { Tables } from "./database.types";

// ─── Generic factories (same signatures as hooks-pages / hooks-extended) ───

type FilterParams = Record<string, string | number | boolean | undefined>;

function makeListHook<T>(key: string, basePath: string, defaultParams?: FilterParams) {
    return function useEntityList(filters?: FilterParams) {
        const merged = { ...defaultParams, ...filters };
        return useQuery({
            queryKey: [key, merged],
            queryFn: () => apiList<T>(basePath, merged).then((r) => r.data),
        });
    };
}

function makeDetailHook<T>(key: string, basePath: string) {
    return function useEntityDetail(id?: string) {
        return useQuery({
            queryKey: [key, "detail", id],
            queryFn: () => apiGet<T>(basePath, id!),
            enabled: !!id,
        });
    };
}

function makeCreateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityCreate() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (payload: Record<string, unknown>) => apiCreate<T>(basePath, payload),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: [key] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}

function makeUpdateHook<T>(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityUpdate() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
                apiUpdate<T>(basePath, id, payload),
            onSuccess: (_data, variables) => {
                qc.invalidateQueries({ queryKey: [key] });
                qc.invalidateQueries({ queryKey: [key, "detail", variables.id] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}

function makeDeleteHook(key: string, basePath: string, extraKeys?: string[]) {
    return function useEntityDelete() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (id: string) => apiDelete(basePath, id),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: [key] });
                extraKeys?.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
            },
        });
    };
}

// ═══════════════════════════════════════════════════════════════
// RENTAL AGREEMENTS
// ═══════════════════════════════════════════════════════════════

export const useRentalAgreements = makeListHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useRentalAgreement = makeDetailHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements"
);
export const useCreateRentalAgreement = makeCreateHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements"
);
export const useUpdateRentalAgreement = makeUpdateHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements"
);
export const useDeleteRentalAgreement = makeDeleteHook(
    "rental_agreement",
    "/api/rental-agreements"
);

// ═══════════════════════════════════════════════════════════════
// RIGHTS / LICENSES
// ═══════════════════════════════════════════════════════════════

export const useRightsLicenses = makeListHook<Tables<"rights_licenses">>("rights", "/api/rights", {
    sort_by: "expiry_date",
    sort_order: "asc",
});
export const useRightsLicense = makeDetailHook<Tables<"rights_licenses">>("rights", "/api/rights");
export const useCreateRightsLicense = makeCreateHook<Tables<"rights_licenses">>(
    "rights",
    "/api/rights"
);
export const useUpdateRightsLicense = makeUpdateHook<Tables<"rights_licenses">>(
    "rights",
    "/api/rights"
);
export const useDeleteRightsLicense = makeDeleteHook("rights", "/api/rights");

// ═══════════════════════════════════════════════════════════════
// PAYMENT APPROVALS
// ═══════════════════════════════════════════════════════════════

export const usePaymentApprovals = makeListHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals",
    { sort_by: "created_at", sort_order: "desc" }
);
export const usePaymentApproval = makeDetailHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals"
);
export const useCreatePaymentApproval = makeCreateHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals"
);
export const useUpdatePaymentApproval = makeUpdateHook<Tables<"payment_approvals">>(
    "payment_approval",
    "/api/payment-approvals"
);

// ═══════════════════════════════════════════════════════════════
// WORK PACKAGES
// ═══════════════════════════════════════════════════════════════

export const useWorkPackages = makeListHook<Tables<"work_packages">>(
    "work_package",
    "/api/work-packages",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useWorkPackage = makeDetailHook<Tables<"work_packages">>(
    "work_package",
    "/api/work-packages"
);
export const useCreateWorkPackage = makeCreateHook<Tables<"work_packages">>(
    "work_package",
    "/api/work-packages"
);
export const useUpdateWorkPackage = makeUpdateHook<Tables<"work_packages">>(
    "work_package",
    "/api/work-packages"
);
export const useDeleteWorkPackage = makeDeleteHook("work_package", "/api/work-packages");

// ═══════════════════════════════════════════════════════════════
// BOMS (Bill of Materials)
// ═══════════════════════════════════════════════════════════════

export const useBoms = makeListHook<Tables<"boms">>("bom", "/api/boms", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useBom = makeDetailHook<Tables<"boms">>("bom", "/api/boms");
export const useCreateBom = makeCreateHook<Tables<"boms">>("bom", "/api/boms");
export const useUpdateBom = makeUpdateHook<Tables<"boms">>("bom", "/api/boms");
export const useDeleteBom = makeDeleteHook("bom", "/api/boms");

// ═══════════════════════════════════════════════════════════════
// PRODUCTION RUNS
// ═══════════════════════════════════════════════════════════════

export const useProductionRuns = makeListHook<Tables<"production_runs">>(
    "production_run",
    "/api/production-runs",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useProductionRun = makeDetailHook<Tables<"production_runs">>(
    "production_run",
    "/api/production-runs"
);
export const useCreateProductionRun = makeCreateHook<Tables<"production_runs">>(
    "production_run",
    "/api/production-runs"
);
export const useUpdateProductionRun = makeUpdateHook<Tables<"production_runs">>(
    "production_run",
    "/api/production-runs"
);
export const useDeleteProductionRun = makeDeleteHook("production_run", "/api/production-runs");

// ═══════════════════════════════════════════════════════════════
// PRODUCTION VERTICALS
// ═══════════════════════════════════════════════════════════════

export const useProductionVerticals = makeListHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/production-verticals",
    { sort_by: "name", sort_order: "asc" }
);
export const useProductionVertical = makeDetailHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/production-verticals"
);
export const useCreateProductionVertical = makeCreateHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/production-verticals"
);
export const useUpdateProductionVertical = makeUpdateHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/production-verticals"
);

// ═══════════════════════════════════════════════════════════════
// TECHNICAL SPECS
// ═══════════════════════════════════════════════════════════════

export const useTechnicalSpecs = makeListHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/technical-specs",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useTechnicalSpec = makeDetailHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/technical-specs"
);
export const useCreateTechnicalSpec = makeCreateHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/technical-specs"
);
export const useUpdateTechnicalSpec = makeUpdateHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/technical-specs"
);

// ═══════════════════════════════════════════════════════════════
// QC GATES
// ═══════════════════════════════════════════════════════════════

export const useQcGates = makeListHook<Tables<"qc_gates">>("qc_gate", "/api/qc-gates", {
    sort_by: "gate_order",
    sort_order: "asc",
});
export const useQcGate = makeDetailHook<Tables<"qc_gates">>("qc_gate", "/api/qc-gates");
export const useCreateQcGate = makeCreateHook<Tables<"qc_gates">>("qc_gate", "/api/qc-gates");
export const useUpdateQcGate = makeUpdateHook<Tables<"qc_gates">>("qc_gate", "/api/qc-gates");

// ═══════════════════════════════════════════════════════════════
// KITS
// ═══════════════════════════════════════════════════════════════

export const useKits = makeListHook<Tables<"kits">>("kit", "/api/kits", {
    sort_by: "name",
    sort_order: "asc",
});
export const useKit = makeDetailHook<Tables<"kits">>("kit", "/api/kits");
export const useCreateKit = makeCreateHook<Tables<"kits">>("kit", "/api/kits");
export const useUpdateKit = makeUpdateHook<Tables<"kits">>("kit", "/api/kits");
export const useDeleteKit = makeDeleteHook("kit", "/api/kits");

// ═══════════════════════════════════════════════════════════════
// LOAD PLANS
// ═══════════════════════════════════════════════════════════════

export const useLoadPlans = makeListHook<Tables<"load_plans">>("load_plan", "/api/load-plans", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useLoadPlan = makeDetailHook<Tables<"load_plans">>("load_plan", "/api/load-plans");
export const useCreateLoadPlan = makeCreateHook<Tables<"load_plans">>(
    "load_plan",
    "/api/load-plans"
);
export const useUpdateLoadPlan = makeUpdateHook<Tables<"load_plans">>(
    "load_plan",
    "/api/load-plans"
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY AUDITS
// ═══════════════════════════════════════════════════════════════

export const useInventoryAudits = makeListHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits",
    { sort_by: "audit_date", sort_order: "desc" }
);
export const useInventoryAudit = makeDetailHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits"
);
export const useCreateInventoryAudit = makeCreateHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits"
);
export const useUpdateInventoryAudit = makeUpdateHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits"
);

// ═══════════════════════════════════════════════════════════════
// ASSET VERSIONS
// ═══════════════════════════════════════════════════════════════

export const useAssetVersions = makeListHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/asset-versions",
    { sort_by: "version_number", sort_order: "desc" }
);
export const useAssetVersion = makeDetailHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/asset-versions"
);
export const useCreateAssetVersion = makeCreateHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/asset-versions",
    ["assets"]
);

// ═══════════════════════════════════════════════════════════════
// ASSET TAGS
// ═══════════════════════════════════════════════════════════════

export const useAssetTags = makeListHook<Tables<"asset_tags">>("asset_tag", "/api/asset-tags", {
    sort_by: "tag_key",
    sort_order: "asc",
});
export const useCreateAssetTag = makeCreateHook<Tables<"asset_tags">>(
    "asset_tag",
    "/api/asset-tags",
    ["assets"]
);
export const useDeleteAssetTag = makeDeleteHook("asset_tag", "/api/asset-tags");

// ═══════════════════════════════════════════════════════════════
// SPACE BOOKINGS
// ═══════════════════════════════════════════════════════════════

export const useSpaceBookings = makeListHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings",
    { sort_by: "start_time", sort_order: "desc" }
);
export const useSpaceBooking = makeDetailHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings"
);
export const useCreateSpaceBooking = makeCreateHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings"
);
export const useUpdateSpaceBooking = makeUpdateHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings"
);
export const useDeleteSpaceBooking = makeDeleteHook("space_booking", "/api/space-bookings");

// ═══════════════════════════════════════════════════════════════
// SCAN EVENTS
// ═══════════════════════════════════════════════════════════════

export const useScanEvents = makeListHook<Tables<"scan_events">>("scan_event", "/api/scan-events", {
    sort_by: "scanned_at",
    sort_order: "desc",
});
export const useCreateScanEvent = makeCreateHook<Tables<"scan_events">>(
    "scan_event",
    "/api/scan-events"
);

// ═══════════════════════════════════════════════════════════════
// VIP SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useVipServiceRequests = makeListHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useVipServiceRequest = makeDetailHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests"
);
export const useCreateVipServiceRequest = makeCreateHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests"
);
export const useUpdateVipServiceRequest = makeUpdateHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests"
);

// ═══════════════════════════════════════════════════════════════
// WORKER CLASSIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const useWorkerClassifications = makeListHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/worker-classifications",
    { sort_by: "name", sort_order: "asc" }
);
export const useWorkerClassification = makeDetailHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/worker-classifications"
);
export const useCreateWorkerClassification = makeCreateHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/worker-classifications"
);
export const useUpdateWorkerClassification = makeUpdateHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/worker-classifications"
);

// ═══════════════════════════════════════════════════════════════
// WORKER COMPLIANCE DOCS
// ═══════════════════════════════════════════════════════════════

export const useWorkerComplianceDocs = makeListHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/worker-compliance-docs",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useWorkerComplianceDoc = makeDetailHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/worker-compliance-docs"
);
export const useCreateWorkerComplianceDoc = makeCreateHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/worker-compliance-docs"
);
export const useUpdateWorkerComplianceDoc = makeUpdateHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/worker-compliance-docs"
);

// ═══════════════════════════════════════════════════════════════
// BRANDS
// ═══════════════════════════════════════════════════════════════

export const useBrands = makeListHook<Tables<"brands">>("brand", "/api/brands", {
    sort_by: "name",
    sort_order: "asc",
});
export const useBrand = makeDetailHook<Tables<"brands">>("brand", "/api/brands");
export const useCreateBrand = makeCreateHook<Tables<"brands">>("brand", "/api/brands");
export const useUpdateBrand = makeUpdateHook<Tables<"brands">>("brand", "/api/brands");

// ═══════════════════════════════════════════════════════════════
// DEPRECIATION SCHEDULES
// ═══════════════════════════════════════════════════════════════

export const useDepreciationSchedules = makeListHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useDepreciationSchedule = makeDetailHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules"
);
export const useCreateDepreciationSchedule = makeCreateHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules",
    ["assets"]
);
export const useUpdateDepreciationSchedule = makeUpdateHook<Tables<"depreciation_schedules">>(
    "depreciation_schedule",
    "/api/depreciation-schedules"
);

// ═══════════════════════════════════════════════════════════════
// CONTRACT AMENDMENTS
// ═══════════════════════════════════════════════════════════════

export const useContractAmendments = makeListHook<Tables<"contract_amendments">>(
    "contract_amendment",
    "/api/contract-amendments",
    { sort_by: "effective_date", sort_order: "desc" }
);
export const useContractAmendment = makeDetailHook<Tables<"contract_amendments">>(
    "contract_amendment",
    "/api/contract-amendments"
);
export const useCreateContractAmendment = makeCreateHook<Tables<"contract_amendments">>(
    "contract_amendment",
    "/api/contract-amendments",
    ["contracts"]
);
export const useUpdateContractAmendment = makeUpdateHook<Tables<"contract_amendments">>(
    "contract_amendment",
    "/api/contract-amendments"
);

// ═══════════════════════════════════════════════════════════════
// LEGAL HOLDS
// ═══════════════════════════════════════════════════════════════

export const useLegalHolds = makeListHook<Tables<"legal_holds">>("legal_hold", "/api/legal-holds", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useLegalHold = makeDetailHook<Tables<"legal_holds">>("legal_hold", "/api/legal-holds");
export const useCreateLegalHold = makeCreateHook<Tables<"legal_holds">>(
    "legal_hold",
    "/api/legal-holds"
);
export const useUpdateLegalHold = makeUpdateHook<Tables<"legal_holds">>(
    "legal_hold",
    "/api/legal-holds"
);

// ═══════════════════════════════════════════════════════════════
// STORAGE OBJECTS
// ═══════════════════════════════════════════════════════════════

export const useStorageObjects = makeListHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/storage-objects",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useStorageObject = makeDetailHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/storage-objects"
);
export const useCreateStorageObject = makeCreateHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/storage-objects"
);
export const useDeleteStorageObject = makeDeleteHook("storage_object", "/api/storage-objects");

// ═══════════════════════════════════════════════════════════════
// VENDOR COMMUNICATIONS
// ═══════════════════════════════════════════════════════════════

export const useVendorCommunications = makeListHook<Tables<"vendor_communications">>(
    "vendor_communication",
    "/api/vendor-communications",
    { sort_by: "sent_at", sort_order: "desc" }
);
export const useVendorCommunication = makeDetailHook<Tables<"vendor_communications">>(
    "vendor_communication",
    "/api/vendor-communications"
);
export const useCreateVendorCommunication = makeCreateHook<Tables<"vendor_communications">>(
    "vendor_communication",
    "/api/vendor-communications",
    ["vendors"]
);

// ═══════════════════════════════════════════════════════════════
// HR CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const useHrCertifications = makeListHook<Tables<"certifications">>(
    "hr_certification",
    "/api/hr-certifications",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useHrCertification = makeDetailHook<Tables<"certifications">>(
    "hr_certification",
    "/api/hr-certifications"
);
export const useCreateHrCertification = makeCreateHook<Tables<"certifications">>(
    "hr_certification",
    "/api/hr-certifications"
);
export const useUpdateHrCertification = makeUpdateHook<Tables<"certifications">>(
    "hr_certification",
    "/api/hr-certifications"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION BUDGET LINES
// ═══════════════════════════════════════════════════════════════

export const useProductionBudgetLines = makeListHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines",
    { sort_by: "sort_order", sort_order: "asc" }
);
export const useProductionBudgetLine = makeDetailHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines"
);
export const useCreateProductionBudgetLine = makeCreateHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines",
    ["budgets"]
);
export const useUpdateProductionBudgetLine = makeUpdateHook<Tables<"production_budget_lines">>(
    "production_budget_line",
    "/api/production-budget-lines"
);
export const useDeleteProductionBudgetLine = makeDeleteHook(
    "production_budget_line",
    "/api/production-budget-lines"
);
