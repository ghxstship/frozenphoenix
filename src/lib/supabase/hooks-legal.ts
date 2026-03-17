"use client";

/**
 * Legal & Compliance entity hooks: contracts, change_orders, permits,
 * insurance_policies, insurance_requirements, ip_rights, rights_licenses,
 * contract_amendments, contract_obligations, clause_library, legal_holds,
 * compliance_checklists, compliance_requirements, e_signatures, rfqs.
 */

import type { Tables } from "./database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// CONTRACTS
// ═══════════════════════════════════════════════════════════════

export const useContracts = makeListHook<Tables<"contracts">>("contract", "/api/contracts", {
    sort_by: "effective_date",
    sort_order: "asc",
});
export const useContract = makeDetailHook<Tables<"contracts">>("contract", "/api/contracts");
export const useCreateContract = makeCreateHook<Tables<"contracts">>("contract", "/api/contracts");
export const useUpdateContract = makeUpdateHook<Tables<"contracts">>("contract", "/api/contracts");
export const useDeleteContract = makeDeleteHook("contract", "/api/contracts");

// ═══════════════════════════════════════════════════════════════
// CHANGE ORDERS
// ═══════════════════════════════════════════════════════════════

export const useChangeOrders = makeListHook<Tables<"change_orders">>(
    "change_order",
    "/api/change-orders",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useChangeOrder = makeDetailHook<Tables<"change_orders">>(
    "change_order",
    "/api/change-orders"
);
export const useCreateChangeOrder = makeCreateHook<Tables<"change_orders">>(
    "change_order",
    "/api/change-orders"
);
export const useUpdateChangeOrder = makeUpdateHook<Tables<"change_orders">>(
    "change_order",
    "/api/change-orders"
);
export const useDeleteChangeOrder = makeDeleteHook("change_order", "/api/change-orders");

// ═══════════════════════════════════════════════════════════════
// PERMITS
// ═══════════════════════════════════════════════════════════════

export const usePermits = makeListHook<Tables<"permits">>("permit", "/api/permits", {
    sort_by: "expiry_date",
    sort_order: "asc",
});
export const usePermit = makeDetailHook<Tables<"permits">>("permit", "/api/permits");
export const useCreatePermit = makeCreateHook<Tables<"permits">>("permit", "/api/permits");
export const useUpdatePermit = makeUpdateHook<Tables<"permits">>("permit", "/api/permits");
export const useDeletePermit = makeDeleteHook("permit", "/api/permits");

// ═══════════════════════════════════════════════════════════════
// INSURANCE POLICIES
// ═══════════════════════════════════════════════════════════════

export const useInsurancePolicies = makeListHook<Tables<"insurance_policies">>(
    "insurance_policy",
    "/api/insurance-policies",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useInsurancePolicy = makeDetailHook<Tables<"insurance_policies">>(
    "insurance_policy",
    "/api/insurance-policies"
);
export const useCreateInsurancePolicy = makeCreateHook<Tables<"insurance_policies">>(
    "insurance_policy",
    "/api/insurance-policies"
);
export const useUpdateInsurancePolicy = makeUpdateHook<Tables<"insurance_policies">>(
    "insurance_policy",
    "/api/insurance-policies"
);
export const useDeleteInsurancePolicy = makeDeleteHook(
    "insurance_policy",
    "/api/insurance-policies"
);

// ─── Insurance Requirements ───
export const useInsuranceRequirements = makeListHook<Tables<"insurance_requirements">>(
    "insurance_requirement",
    "/api/insurance-requirements",
    { sort_by: "requirement_name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// IP RIGHTS
// ═══════════════════════════════════════════════════════════════

export const useIpRights = makeListHook<Tables<"ip_rights">>("ip_right", "/api/ip-rights", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useIpRight = makeDetailHook<Tables<"ip_rights">>("ip_right", "/api/ip-rights");
export const useCreateIpRight = makeCreateHook<Tables<"ip_rights">>("ip_right", "/api/ip-rights");
export const useUpdateIpRight = makeUpdateHook<Tables<"ip_rights">>("ip_right", "/api/ip-rights");
export const useDeleteIpRight = makeDeleteHook("ip_right", "/api/ip-rights");

// ═══════════════════════════════════════════════════════════════
// RIGHTS LICENSES
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
    ["contract"]
);
export const useUpdateContractAmendment = makeUpdateHook<Tables<"contract_amendments">>(
    "contract_amendment",
    "/api/contract-amendments"
);

// ═══════════════════════════════════════════════════════════════
// CONTRACT OBLIGATIONS
// ═══════════════════════════════════════════════════════════════

export const useContractObligations = makeListHook<Tables<"contract_obligations">>(
    "contract_obligation",
    "/api/contract-obligations",
    { sort_by: "due_date", sort_order: "asc" }
);
export const useContractObligation = makeDetailHook<Tables<"contract_obligations">>(
    "contract_obligation",
    "/api/contract-obligations"
);
export const useCreateContractObligation = makeCreateHook<Tables<"contract_obligations">>(
    "contract_obligation",
    "/api/contract-obligations",
    ["contract"]
);
export const useUpdateContractObligation = makeUpdateHook<Tables<"contract_obligations">>(
    "contract_obligation",
    "/api/contract-obligations"
);

// ═══════════════════════════════════════════════════════════════
// CLAUSE LIBRARY
// ═══════════════════════════════════════════════════════════════

export const useClauseLibrary = makeListHook<Tables<"contract_clauses">>(
    "clause_library",
    "/api/clause-library",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateClauseLibraryItem = makeCreateHook<Tables<"contract_clauses">>(
    "clause_library",
    "/api/clause-library"
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
// COMPLIANCE CHECKLISTS
// ═══════════════════════════════════════════════════════════════

export const useComplianceChecklists = makeListHook<Tables<"compliance_checklists">>(
    "compliance_checklist",
    "/api/compliance-checklists",
    { sort_by: "name", sort_order: "asc" }
);
export const useComplianceChecklist = makeDetailHook<Tables<"compliance_checklists">>(
    "compliance_checklist",
    "/api/compliance-checklists"
);
export const useCreateComplianceChecklist = makeCreateHook<Tables<"compliance_checklists">>(
    "compliance_checklist",
    "/api/compliance-checklists"
);
export const useUpdateComplianceChecklist = makeUpdateHook<Tables<"compliance_checklists">>(
    "compliance_checklist",
    "/api/compliance-checklists"
);
export const useDeleteComplianceChecklist = makeDeleteHook(
    "compliance_checklist",
    "/api/compliance-checklists"
);

// ─── Compliance Requirements alias ───
export const useComplianceRequirements = makeListHook<Tables<"compliance_checklists">>(
    "compliance_requirement",
    "/api/compliance-requirements",
    { sort_by: "name", sort_order: "asc" }
);

// E-SIGNATURES → canonical in hooks-workflows.ts (join-aware)

// ═══════════════════════════════════════════════════════════════
// RFQS
// ═══════════════════════════════════════════════════════════════

export const useRFQs = makeListHook<Tables<"rfqs">>("rfq", "/api/rfqs", {
    sort_by: "issue_date",
    sort_order: "desc",
});
export const useRFQ = makeDetailHook<Tables<"rfqs">>("rfq", "/api/rfqs");
export const useCreateRFQ = makeCreateHook<Tables<"rfqs">>("rfq", "/api/rfqs");
export const useUpdateRFQ = makeUpdateHook<Tables<"rfqs">>("rfq", "/api/rfqs");
export const useDeleteRFQ = makeDeleteHook("rfq", "/api/rfqs");

// ═══════════════════════════════════════════════════════════════
// PURCHASE REQUISITIONS
// ═══════════════════════════════════════════════════════════════

export const usePurchaseRequisitions = makeListHook<Tables<"purchase_requisitions">>(
    "purchase_requisition",
    "/api/purchase-requisitions",
    { sort_by: "created_at", sort_order: "desc" }
);
export const usePurchaseRequisition = makeDetailHook<Tables<"purchase_requisitions">>(
    "purchase_requisition",
    "/api/purchase-requisitions"
);
export const useCreatePurchaseRequisition = makeCreateHook<Tables<"purchase_requisitions">>(
    "purchase_requisition",
    "/api/purchase-requisitions"
);
export const useUpdatePurchaseRequisition = makeUpdateHook<Tables<"purchase_requisitions">>(
    "purchase_requisition",
    "/api/purchase-requisitions"
);
export const useDeletePurchaseRequisition = makeDeleteHook(
    "purchase_requisition",
    "/api/purchase-requisitions"
);

// ═══════════════════════════════════════════════════════════════
// GOODS RECEIPTS
// ═══════════════════════════════════════════════════════════════

export const useGoodsReceipts = makeListHook<Tables<"goods_receipts">>(
    "goods_receipt",
    "/api/goods-receipts",
    { sort_by: "received_at", sort_order: "desc" }
);
export const useGoodsReceipt = makeDetailHook<Tables<"goods_receipts">>(
    "goods_receipt",
    "/api/goods-receipts"
);
export const useCreateGoodsReceipt = makeCreateHook<Tables<"goods_receipts">>(
    "goods_receipt",
    "/api/goods-receipts"
);
