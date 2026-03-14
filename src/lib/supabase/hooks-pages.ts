"use client";

/**
 * Supabase hooks for tables required by dashboard pages.
 * All hooks use API routes for RBAC, validation & audit logging.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import type { Tables } from "./database.types";
import { apiFetch } from "@/lib/api/client";

// ═══════════════════════════════════════════════════════════════
// GENERIC FACTORIES
// ═══════════════════════════════════════════════════════════════

type FilterParams = Record<string, string | number | boolean | undefined>;

function makeListHook<T>(
    queryKey: string,
    apiPath: string,
    defaultSort?: { sort_by: string; sort_order: "asc" | "desc" }
) {
    return function useEntityList(filterParams?: FilterParams) {
        return useQuery({
            queryKey: [queryKey, filterParams],
            queryFn: async () => {
                const res = await apiList<T>(apiPath, { ...defaultSort, ...filterParams });
                return res.data;
            },
        });
    };
}

function makeDetailHook<T>(queryKey: string, apiPath: string) {
    return function useEntityDetail(id: string) {
        return useQuery({
            queryKey: [queryKey, id],
            queryFn: () => apiGet<T>(apiPath, id),
            enabled: !!id,
        });
    };
}

function makeCreateHook<T>(queryKey: string, apiPath: string) {
    return function useCreateEntity() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (payload: Record<string, unknown>) => apiCreate<T>(apiPath, payload),
            onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
        });
    };
}

function makeUpdateHook<T>(queryKey: string, apiPath: string) {
    return function useUpdateEntity() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
                apiUpdate<T>(apiPath, id, updates),
            onSuccess: (_d, vars) => {
                qc.invalidateQueries({ queryKey: [queryKey] });
                qc.invalidateQueries({ queryKey: [queryKey, vars.id] });
            },
        });
    };
}

function makeDeleteHook(queryKey: string, apiPath: string) {
    return function useDeleteEntity() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (id: string) => apiDelete(apiPath, id),
            onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
        });
    };
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════

export function useCampaigns(projectId?: string) {
    return useQuery({
        queryKey: ["campaign", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"campaigns">>("/api/campaigns", {
                project_id: projectId,
                sort_by: "start_date",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useCampaign = makeDetailHook<Tables<"campaigns">>("campaign", "/api/campaigns");
export const useCreateCampaign = makeCreateHook<Tables<"campaigns">>("campaign", "/api/campaigns");

// ═══════════════════════════════════════════════════════════════
// PROPOSALS
// ═══════════════════════════════════════════════════════════════

export function useProposals(status?: string) {
    return useQuery({
        queryKey: ["proposal", status],
        queryFn: async () => {
            const res = await apiList<Tables<"proposals">>("/api/proposals", {
                ...(status && status !== "all" ? { status } : {}),
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useProposal = makeDetailHook<Tables<"proposals">>("proposal", "/api/proposals");
export const useCreateProposal = makeCreateHook<Tables<"proposals">>("proposal", "/api/proposals");
export const useUpdateProposal = makeUpdateHook<Tables<"proposals">>("proposal", "/api/proposals");
export const useDeleteProposal = makeDeleteHook("proposal", "/api/proposals");

// ═══════════════════════════════════════════════════════════════
// BRIEFS (creative_briefs)
// ═══════════════════════════════════════════════════════════════

export function useBriefs(projectId?: string) {
    return useQuery({
        queryKey: ["creative_brief", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"creative_briefs">>("/api/briefs", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useBrief = makeDetailHook<Tables<"creative_briefs">>("creative_brief", "/api/briefs");
export const useCreateBrief = makeCreateHook<Tables<"creative_briefs">>(
    "creative_brief",
    "/api/briefs"
);

// ═══════════════════════════════════════════════════════════════
// CLIENT INVOICES
// ═══════════════════════════════════════════════════════════════

export function useClientInvoices(status?: string) {
    return useQuery({
        queryKey: ["client_invoice", status],
        queryFn: async () => {
            const res = await apiList<Tables<"client_invoices">>("/api/client-invoices", {
                ...(status && status !== "all" ? { status } : {}),
                sort_by: "due_date",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useClientInvoice = makeDetailHook<Tables<"client_invoices">>(
    "client_invoice",
    "/api/client-invoices"
);
export const useCreateClientInvoice = makeCreateHook<Tables<"client_invoices">>(
    "client_invoice",
    "/api/client-invoices"
);
export const useUpdateClientInvoice = makeUpdateHook<Tables<"client_invoices">>(
    "client_invoice",
    "/api/client-invoices"
);
export const useDeleteClientInvoice = makeDeleteHook("client_invoice", "/api/client-invoices");

// ═══════════════════════════════════════════════════════════════
// COMPANIES
// ═══════════════════════════════════════════════════════════════

export const useCompanies = makeListHook<Tables<"companies">>("company", "/api/companies", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCompany = makeDetailHook<Tables<"companies">>("company", "/api/companies");
export const useUpdateCompany = makeUpdateHook<Tables<"companies">>("company", "/api/companies");
export const useDeleteCompany = makeDeleteHook("company", "/api/companies");

// ═══════════════════════════════════════════════════════════════
// ESTIMATES
// ═══════════════════════════════════════════════════════════════

export const useEstimates = makeListHook<Tables<"estimates">>("estimate", "/api/estimates", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useEstimate = makeDetailHook<Tables<"estimates">>("estimate", "/api/estimates");
export const useCreateEstimate = makeCreateHook<Tables<"estimates">>("estimate", "/api/estimates");
export const useUpdateEstimate = makeUpdateHook<Tables<"estimates">>("estimate", "/api/estimates");
export const useDeleteEstimate = makeDeleteHook("estimate", "/api/estimates");

// ═══════════════════════════════════════════════════════════════
// DIGITAL ASSETS
// ═══════════════════════════════════════════════════════════════

export function useDigitalAssets(projectId?: string) {
    return useQuery({
        queryKey: ["digital_asset", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"digital_assets">>("/api/digital-assets", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useDigitalAsset = makeDetailHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/digital-assets"
);
export const useCreateDigitalAsset = makeCreateHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/digital-assets"
);
export const useUpdateDigitalAsset = makeUpdateHook<Tables<"digital_assets">>(
    "digital_asset",
    "/api/digital-assets"
);
export const useDeleteDigitalAsset = makeDeleteHook("digital_asset", "/api/digital-assets");

// ═══════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export function useCertifications(crewMemberId?: string) {
    return useQuery({
        queryKey: ["certification", crewMemberId],
        queryFn: async () => {
            const res = await apiList<Tables<"asset_certifications">>("/api/certifications", {
                asset_id: crewMemberId,
                sort_by: "expiry_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export const useCertification = makeDetailHook<Tables<"asset_certifications">>(
    "certification",
    "/api/certifications"
);
export const useCreateCertification = makeCreateHook<Tables<"asset_certifications">>(
    "certification",
    "/api/certifications"
);
export const useUpdateCertification = makeUpdateHook<Tables<"asset_certifications">>(
    "certification",
    "/api/certifications"
);
export const useDeleteCertification = makeDeleteHook("certification", "/api/certifications");

// ═══════════════════════════════════════════════════════════════
// CHANGE ORDERS
// ═══════════════════════════════════════════════════════════════

export function useChangeOrders(projectId?: string) {
    return useQuery({
        queryKey: ["change_order", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"change_orders">>("/api/change-orders", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

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

// ═══════════════════════════════════════════════════════════════
// CALL SHEETS
// ═══════════════════════════════════════════════════════════════

export function useCallSheets(projectId?: string) {
    return useQuery({
        queryKey: ["call_sheet", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"call_sheets">>("/api/call-sheets", {
                project_id: projectId,
                sort_by: "date",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useCallSheet = makeDetailHook<Tables<"call_sheets">>("call_sheet", "/api/call-sheets");
export const useCreateCallSheet = makeCreateHook<Tables<"call_sheets">>(
    "call_sheet",
    "/api/call-sheets"
);
export const useUpdateCallSheet = makeUpdateHook<Tables<"call_sheets">>(
    "call_sheet",
    "/api/call-sheets"
);
export const useDeleteCallSheet = makeDeleteHook("call_sheet", "/api/call-sheets");

// ═══════════════════════════════════════════════════════════════
// AUTOMATIONS
// ═══════════════════════════════════════════════════════════════

export const useAutomations = makeListHook<Tables<"automations">>(
    "automation",
    "/api/automations",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateAutomation = makeCreateHook<Tables<"automations">>(
    "automation",
    "/api/automations"
);

// ═══════════════════════════════════════════════════════════════
// SCOPES OF WORK
// ═══════════════════════════════════════════════════════════════

export function useScopesOfWork(projectId?: string) {
    return useQuery({
        queryKey: ["sow", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"scopes_of_work">>("/api/scopes-of-work", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useScopeOfWork = makeDetailHook<Tables<"scopes_of_work">>(
    "sow",
    "/api/scopes-of-work"
);
export const useCreateScopeOfWork = makeCreateHook<Tables<"scopes_of_work">>(
    "sow",
    "/api/scopes-of-work"
);
export const useUpdateScopeOfWork = makeUpdateHook<Tables<"scopes_of_work">>(
    "sow",
    "/api/scopes-of-work"
);
export const useDeleteScopeOfWork = makeDeleteHook("sow", "/api/scopes-of-work");

// ═══════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════

export function useLeads(status?: string) {
    return useQuery({
        queryKey: ["lead", status],
        queryFn: async () => {
            const res = await apiList<Tables<"leads">>("/api/leads", {
                ...(status && status !== "all" ? { status } : {}),
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useCreateLead = makeCreateHook<Tables<"leads">>("lead", "/api/leads");
export const useUpdateLead = makeUpdateHook<Tables<"leads">>("lead", "/api/leads");
export const useDeleteLead = makeDeleteHook("lead", "/api/leads");

// ═══════════════════════════════════════════════════════════════
// VENDOR REVIEWS
// ═══════════════════════════════════════════════════════════════

export function useVendorReviews(vendorId?: string) {
    return useQuery({
        queryKey: ["vendor_review", vendorId],
        queryFn: async () => {
            const res = await apiList<Tables<"worker_reviews">>("/api/vendor-reviews", {
                vendor_id: vendorId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useVendorReview = makeDetailHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/vendor-reviews"
);
export const useCreateVendorReview = makeCreateHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/vendor-reviews"
);
export const useUpdateVendorReview = makeUpdateHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/vendor-reviews"
);
export const useDeleteVendorReview = makeDeleteHook("vendor_review", "/api/vendor-reviews");

// ═══════════════════════════════════════════════════════════════
// E-SIGNATURES
// ═══════════════════════════════════════════════════════════════

export function useESignatures(contractId?: string) {
    return useQuery({
        queryKey: ["e_signature", contractId],
        queryFn: async () => {
            const res = await apiList<Tables<"e_signatures">>("/api/e-signatures", {
                contract_id: contractId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useCreateESignature = makeCreateHook<Tables<"e_signatures">>(
    "e_signature",
    "/api/e-signatures"
);

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS (vault_documents)
// ═══════════════════════════════════════════════════════════════

export function useDocuments(projectId?: string) {
    return useQuery({
        queryKey: ["document", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"vault_documents">>("/api/vault-documents", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useDocument = makeDetailHook<Tables<"vault_documents">>(
    "document",
    "/api/vault-documents"
);
export const useCreateDocument = makeCreateHook<Tables<"vault_documents">>(
    "document",
    "/api/vault-documents"
);
export const useUpdateDocument = makeUpdateHook<Tables<"vault_documents">>(
    "document",
    "/api/vault-documents"
);
export const useDeleteDocument = makeDeleteHook("document", "/api/vault-documents");

// ═══════════════════════════════════════════════════════════════
// FLEET VEHICLES
// ═══════════════════════════════════════════════════════════════

export const useFleetVehicles = makeListHook<Tables<"vehicles">>("vehicle", "/api/fleet", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCreateFleetVehicle = makeCreateHook<Tables<"vehicles">>("vehicle", "/api/fleet");

// ═══════════════════════════════════════════════════════════════
// ACCOUNTS (account health scores)
// ═══════════════════════════════════════════════════════════════

export const useAccounts = makeListHook<Tables<"account_health_scores">>(
    "account_health_score",
    "/api/stakeholders",
    { sort_by: "score_date", sort_order: "desc" }
);
export const useAccount = makeDetailHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/stakeholders"
);
export const useCreateAccount = makeCreateHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/stakeholders"
);
export const useUpdateAccount = makeUpdateHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/stakeholders"
);
export const useDeleteAccount = makeDeleteHook("stakeholder", "/api/stakeholders");

// ═══════════════════════════════════════════════════════════════
// PEOPLE (profiles)
// ═══════════════════════════════════════════════════════════════

export const usePeople = makeListHook<Tables<"user_profiles">>("people", "/api/user-profiles", {
    sort_by: "display_name",
    sort_order: "asc",
});
export const useCreatePerson = makeCreateHook<Tables<"user_profiles">>(
    "people",
    "/api/user-profiles"
);
export const useUpdatePerson = makeUpdateHook<Tables<"user_profiles">>(
    "people",
    "/api/user-profiles"
);
export const useDeletePerson = makeDeleteHook("people", "/api/user-profiles");

// ═══════════════════════════════════════════════════════════════
// CREATIVE ASSETS (digital_assets alias)
// ═══════════════════════════════════════════════════════════════

export const useCreativeAssets = makeListHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/digital-assets",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreativeAsset = makeDetailHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/digital-assets"
);
export const useCreateCreativeAsset = makeCreateHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/digital-assets"
);
export const useUpdateCreativeAsset = makeUpdateHook<Tables<"digital_assets">>(
    "creative_asset",
    "/api/digital-assets"
);
export const useDeleteCreativeAsset = makeDeleteHook("creative_asset", "/api/digital-assets");

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════

export const useOpportunities = makeListHook<Tables<"opportunities">>(
    "opportunity",
    "/api/opportunities",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useOpportunity = makeDetailHook<Tables<"opportunities">>(
    "opportunity",
    "/api/opportunities"
);
export const useCreateOpportunity = makeCreateHook<Tables<"opportunities">>(
    "opportunity",
    "/api/opportunities"
);
export const useUpdateOpportunity = makeUpdateHook<Tables<"opportunities">>(
    "opportunity",
    "/api/opportunities"
);
export const useDeleteOpportunity = makeDeleteHook("opportunity", "/api/opportunities");

// ═══════════════════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════════════════

export const useIncidents = makeListHook<Tables<"incidents">>("incident", "/api/incidents", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useIncident = makeDetailHook<Tables<"incidents">>("incident", "/api/incidents");
export const useUpdateIncident = makeUpdateHook<Tables<"incidents">>("incident", "/api/incidents");
export const useDeleteIncident = makeDeleteHook("incident", "/api/incidents");

// ═══════════════════════════════════════════════════════════════
// BRAND GUIDELINES
// ═══════════════════════════════════════════════════════════════

export const useBrandGuidelines = makeListHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/brand-guidelines",
    { sort_by: "title", sort_order: "asc" }
);
export const useBrandGuideline = makeDetailHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/brand-guidelines"
);
export const useCreateBrandGuideline = makeCreateHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/brand-guidelines"
);
export const useUpdateBrandGuideline = makeUpdateHook<Tables<"brand_guidelines">>(
    "brand_guideline",
    "/api/brand-guidelines"
);
export const useDeleteBrandGuideline = makeDeleteHook("brand_guideline", "/api/brand-guidelines");

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════

export const usePurchaseOrders = makeListHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders",
    { sort_by: "created_at", sort_order: "desc" }
);
export const usePurchaseOrder = makeDetailHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders"
);
export const useCreatePurchaseOrder = makeCreateHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders"
);
export const useUpdatePurchaseOrder = makeUpdateHook<Tables<"purchase_orders">>(
    "purchase_order",
    "/api/purchase-orders"
);
export const useDeletePurchaseOrder = makeDeleteHook("purchase_order", "/api/purchase-orders");

// ═══════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════

export function useExpenses(projectId?: string) {
    return useQuery({
        queryKey: ["expense", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"expenses">>("/api/expenses", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export const useExpense = makeDetailHook<Tables<"expenses">>("expense", "/api/expenses");
export const useCreateExpense = makeCreateHook<Tables<"expenses">>("expense", "/api/expenses");
export const useUpdateExpense = makeUpdateHook<Tables<"expenses">>("expense", "/api/expenses");
export const useDeleteExpense = makeDeleteHook("expense", "/api/expenses");

// ═══════════════════════════════════════════════════════════════
// EXPENSE REPORTS
// ═══════════════════════════════════════════════════════════════

export const useExpenseReports = makeListHook<Tables<"expenses">>(
    "expense_report",
    "/api/expense-reports",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateExpenseReport = makeCreateHook<Tables<"expenses">>(
    "expense_report",
    "/api/expense-reports"
);

// ═══════════════════════════════════════════════════════════════
// TIMESHEETS
// ═══════════════════════════════════════════════════════════════

export const useTimesheets = makeListHook<Tables<"time_entries">>("timesheet", "/api/timesheets", {
    sort_by: "period_start",
    sort_order: "desc",
});
export const useCreateTimesheet = makeCreateHook<Tables<"time_entries">>(
    "timesheet",
    "/api/timesheets"
);

// ═══════════════════════════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════════════════════════

export const useWorkflows = makeListHook<Tables<"workflow_instances">>(
    "workflow",
    "/api/workflows",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateWorkflow = makeCreateHook<Tables<"workflow_instances">>(
    "workflow",
    "/api/workflows"
);

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
// RISK ASSESSMENTS
// ═══════════════════════════════════════════════════════════════

export const useRiskAssessments = makeListHook<Tables<"vendor_risk_scores">>(
    "risk_assessment",
    "/api/risk-assessments",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateRiskAssessment = makeCreateHook<Tables<"vendor_risk_scores">>(
    "risk_assessment",
    "/api/risk-assessments"
);

// ═══════════════════════════════════════════════════════════════
// SHIPMENTS
// ═══════════════════════════════════════════════════════════════

export const useShipments = makeListHook<Tables<"shipments">>("shipment", "/api/shipments", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useShipment = makeDetailHook<Tables<"shipments">>("shipment", "/api/shipments");
export const useUpdateShipment = makeUpdateHook<Tables<"shipments">>("shipment", "/api/shipments");
export const useDeleteShipment = makeDeleteHook("shipment", "/api/shipments");

// ═══════════════════════════════════════════════════════════════
// WAREHOUSES
// ═══════════════════════════════════════════════════════════════

export const useWarehouses = makeListHook<Tables<"warehouses">>("warehouse", "/api/warehouses", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCreateWarehouse = makeCreateHook<Tables<"warehouses">>(
    "warehouse",
    "/api/warehouses"
);

// ═══════════════════════════════════════════════════════════════
// DISPATCH (dispatch_entries)
// ═══════════════════════════════════════════════════════════════

export const useDispatchRecords = makeListHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateDispatchRecord = makeCreateHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch"
);
export const useUpdateDispatchRecord = makeUpdateHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch"
);
export const useDeleteDispatchRecord = makeDeleteHook("dispatch", "/api/dispatch");

// ═══════════════════════════════════════════════════════════════
// PAYROLL
// ═══════════════════════════════════════════════════════════════

export const usePayrollBatches = makeListHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreatePayrollBatch = makeCreateHook<Tables<"payroll_batches">>(
    "payroll_batch",
    "/api/payroll-batches"
);

// ═══════════════════════════════════════════════════════════════
// CREDIT NOTES
// ═══════════════════════════════════════════════════════════════

export const useCreditNotes = makeListHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateCreditNote = makeCreateHook<Tables<"credit_notes">>(
    "credit_note",
    "/api/credit-notes"
);

// ═══════════════════════════════════════════════════════════════
// WORK ORDERS
// ═══════════════════════════════════════════════════════════════

export const useWorkOrders = makeListHook<Tables<"work_orders">>("work_order", "/api/work-orders", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useWorkOrder = makeDetailHook<Tables<"work_orders">>("work_order", "/api/work-orders");
export const useCreateWorkOrder = makeCreateHook<Tables<"work_orders">>(
    "work_order",
    "/api/work-orders"
);
export const useUpdateWorkOrder = makeUpdateHook<Tables<"work_orders">>(
    "work_order",
    "/api/work-orders"
);
export const useDeleteWorkOrder = makeDeleteHook("work_order", "/api/work-orders");

// ═══════════════════════════════════════════════════════════════
// WORKER PROFILES
// ═══════════════════════════════════════════════════════════════

export const useWorkerProfiles = makeListHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/worker-profiles",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateWorkerProfile = makeCreateHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/worker-profiles"
);
export const useUpdateWorkerProfile = makeUpdateHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/worker-profiles"
);
export const useDeleteWorkerProfile = makeDeleteHook("worker_profile", "/api/worker-profiles");

// ═══════════════════════════════════════════════════════════════
// BUDGET APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useBudgetApprovals = makeListHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateBudgetApproval = makeCreateHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals"
);

// ═══════════════════════════════════════════════════════════════
// CHECKLISTS
// ═══════════════════════════════════════════════════════════════

export const useChecklists = makeListHook<Tables<"job_checklists">>(
    "checklist",
    "/api/checklists",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateChecklist = makeCreateHook<Tables<"job_checklists">>(
    "checklist",
    "/api/checklists"
);

// ═══════════════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useServiceRequests = makeListHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useServiceRequest = makeDetailHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests"
);
export const useCreateServiceRequest = makeCreateHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests"
);
export const useUpdateServiceRequest = makeUpdateHook<Tables<"service_requests">>(
    "service_request",
    "/api/service-requests"
);
export const useDeleteServiceRequest = makeDeleteHook("service_request", "/api/service-requests");

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

export const useActivityLog = makeListHook<Tables<"activity_log">>(
    "activity_log",
    "/api/activity-log",
    { sort_by: "created_at", sort_order: "desc" }
);

export function useActivityLogRecent(limit = 10) {
    return useQuery({
        queryKey: ["activity_log_recent", limit],
        queryFn: async () => {
            const res = await apiList<Tables<"activity_log">>("/api/activity-log", {
                sort_by: "created_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// VENDOR COMPLIANCE DOCUMENTS
// ═══════════════════════════════════════════════════════════════

export const useVendorComplianceDocuments = makeListHook<Tables<"worker_compliance_docs">>(
    "vendor_compliance_document",
    "/api/vendor-compliance-documents",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useCreateVendorComplianceDocument = makeCreateHook<Tables<"worker_compliance_docs">>(
    "vendor_compliance_document",
    "/api/vendor-compliance-documents"
);

// ═══════════════════════════════════════════════════════════════
// TIME ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useTimeEntries = makeListHook<Tables<"time_entries">>(
    "time_entry",
    "/api/time-entries",
    { sort_by: "date", sort_order: "desc" }
);
export const useCreateTimeEntry = makeCreateHook<Tables<"time_entries">>(
    "time_entry",
    "/api/time-entries"
);

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════

export const usePayments = makeListHook<Tables<"payments">>("payment", "/api/payments", {
    sort_by: "payment_date",
    sort_order: "desc",
});
export const useCreatePayment = makeCreateHook<Tables<"payments">>("payment", "/api/payments");

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

export function usePurchaseRequisitionsList() {
    return useQuery({
        queryKey: ["purchase_requisitions_list"],
        queryFn: async () => {
            const res = await apiList<Tables<"purchase_requisitions">>(
                "/api/purchase-requisitions",
                {
                    sort_by: "created_at",
                    sort_order: "desc",
                }
            );
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// RECURRING INVOICES
// ═══════════════════════════════════════════════════════════════

export const useRecurringInvoices = makeListHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices",
    { sort_by: "next_date", sort_order: "asc" }
);
export const useRecurringInvoice = makeDetailHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices"
);
export const useUpdateRecurringInvoice = makeUpdateHook<Tables<"recurring_invoices">>(
    "recurring_invoice",
    "/api/recurring-invoices"
);
export const useDeleteRecurringInvoice = makeDeleteHook(
    "recurring_invoice",
    "/api/recurring-invoices"
);

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE ARTICLES
// ═══════════════════════════════════════════════════════════════

export const useKnowledgeBaseArticles = makeListHook<Tables<"knowledge_articles">>(
    "knowledge_base_article",
    "/api/knowledge-base-articles",
    { sort_by: "updated_at", sort_order: "desc" }
);
export const useCreateKBArticle = makeCreateHook<Tables<"knowledge_articles">>(
    "knowledge_base_article",
    "/api/knowledge-base-articles"
);
export const useUpdateKBArticle = makeUpdateHook<Tables<"knowledge_articles">>(
    "knowledge_base_article",
    "/api/knowledge-base-articles"
);
export const useDeleteKBArticle = makeDeleteHook(
    "knowledge_base_article",
    "/api/knowledge-base-articles"
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY ITEMS (catalog)
// ═══════════════════════════════════════════════════════════════

export const useInventoryItems = makeListHook<Tables<"catalog_items">>("catalog", "/api/catalog", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCreateInventoryItem = makeCreateHook<Tables<"catalog_items">>(
    "catalog",
    "/api/catalog"
);

// ═══════════════════════════════════════════════════════════════
// IP RIGHTS
// ═══════════════════════════════════════════════════════════════

export const useIpRights = makeListHook<Tables<"ip_rights">>("ip_right", "/api/ip-rights", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useCreateIpRight = makeCreateHook<Tables<"ip_rights">>("ip_right", "/api/ip-rights");

// ═══════════════════════════════════════════════════════════════
// CONTRACT OBLIGATIONS
// ═══════════════════════════════════════════════════════════════

export const useContractObligations = makeListHook<Tables<"contract_obligations">>(
    "contract_obligation",
    "/api/contract-obligations",
    { sort_by: "due_date", sort_order: "asc" }
);
export const useCreateContractObligation = makeCreateHook<Tables<"contract_obligations">>(
    "contract_obligation",
    "/api/contract-obligations"
);

// ═══════════════════════════════════════════════════════════════
// GOODS RECEIPTS
// ═══════════════════════════════════════════════════════════════

export const useGoodsReceipts = makeListHook<Tables<"goods_receipts">>(
    "goods_receipt",
    "/api/goods-receipts",
    { sort_by: "received_at", sort_order: "desc" }
);
export const useCreateGoodsReceipt = makeCreateHook<Tables<"goods_receipts">>(
    "goods_receipt",
    "/api/goods-receipts"
);

// ═══════════════════════════════════════════════════════════════
// TECH SHEETS
// ═══════════════════════════════════════════════════════════════

export const useTechSheets = makeListHook<Tables<"tech_sheets">>("tech_sheet", "/api/tech-sheets", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useTechSheet = makeDetailHook<Tables<"tech_sheets">>("tech_sheet", "/api/tech-sheets");
export const useCreateTechSheet = makeCreateHook<Tables<"tech_sheets">>(
    "tech_sheet",
    "/api/tech-sheets"
);
export const useUpdateTechSheet = makeUpdateHook<Tables<"tech_sheets">>(
    "tech_sheet",
    "/api/tech-sheets"
);
export const useDeleteTechSheet = makeDeleteHook("tech_sheet", "/api/tech-sheets");

// ═══════════════════════════════════════════════════════════════
// RATE CARDS
// ═══════════════════════════════════════════════════════════════

export const useRateCards = makeListHook<Tables<"rate_cards">>("rate_card", "/api/rate-cards", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCreateRateCard = makeCreateHook<Tables<"rate_cards">>(
    "rate_card",
    "/api/rate-cards"
);

// ═══════════════════════════════════════════════════════════════
// REVENUE SCHEDULES
// ═══════════════════════════════════════════════════════════════

export const useRevenueSchedules = makeListHook<Tables<"revenue_schedules">>(
    "revenue_schedule",
    "/api/revenue-schedules",
    { sort_by: "period_start", sort_order: "desc" }
);

export function useRevenueSchedulesList() {
    return useQuery({
        queryKey: ["revenue_schedules_list"],
        queryFn: async () => {
            const res = await apiList<Tables<"revenue_schedules">>("/api/revenue-schedules", {
                sort_by: "period_start",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// GL ACCOUNTS
// ═══════════════════════════════════════════════════════════════

export const useGlAccounts = makeListHook<Tables<"gl_accounts">>("gl_account", "/api/gl-accounts", {
    sort_by: "account_code",
    sort_order: "asc",
});
export const useCreateGlAccount = makeCreateHook<Tables<"gl_accounts">>(
    "gl_account",
    "/api/gl-accounts"
);

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES (project_templates)
// ═══════════════════════════════════════════════════════════════

export const useDocumentTemplates = makeListHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useDocumentTemplate = makeDetailHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates"
);
export const useCreateDocumentTemplate = makeCreateHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates"
);
export const useUpdateTemplate = makeUpdateHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates"
);
export const useDeleteTemplate = makeDeleteHook("template", "/api/project-templates");

// ═══════════════════════════════════════════════════════════════
// VENDOR ONBOARDING (STUB — uses vendor_compliance_documents)
// ═══════════════════════════════════════════════════════════════

export const useVendorOnboarding = makeListHook<Tables<"worker_compliance_docs">>(
    "vendor_onboarding",
    "/api/vendor-compliance-documents",
    { sort_by: "created_at", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// ENGINEERING APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useEngineeringApprovals = makeListHook<Tables<"engineering_approvals">>(
    "engineering_approval",
    "/api/engineering-approvals",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateEngineeringApproval = makeCreateHook<Tables<"engineering_approvals">>(
    "engineering_approval",
    "/api/engineering-approvals"
);

// ═══════════════════════════════════════════════════════════════
// JOB COST ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useJobCostEntries = makeListHook<Tables<"job_cost_entries">>(
    "job_cost_entry",
    "/api/job-cost-entries",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateJobCostEntry = makeCreateHook<Tables<"job_cost_entries">>(
    "job_cost_entry",
    "/api/job-cost-entries"
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
// SINGLE-RECORD DETAIL HOOKS (additional entities)
// ═══════════════════════════════════════════════════════════════

export const useActivation = makeDetailHook<Tables<"activations">>(
    "activation",
    "/api/activations"
);
export const useVendor = makeDetailHook<Tables<"vendors">>("vendor", "/api/vendors");
export const useTask = makeDetailHook<Tables<"tasks">>("task", "/api/tasks");
export const useDeleteTask = makeDeleteHook("task", "/api/tasks");
export const useEvent = makeDetailHook<Tables<"events">>("event", "/api/events");

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN SUB-ENTITIES
// ═══════════════════════════════════════════════════════════════

export function useBudgetLines(budgetId?: string) {
    return useQuery({
        queryKey: ["budget_line_item", budgetId],
        queryFn: async () => {
            const res = await apiList<Tables<"budget_line_items">>("/api/budget-line-items", {
                budget_id: budgetId,
                sort_by: "sort_order",
                sort_order: "asc",
            });
            return res.data;
        },
        enabled: !!budgetId,
    });
}

export function useCampaignChannels(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_channel", campaignId],
        queryFn: async () => {
            const res = await apiList<Tables<"campaign_channels">>("/api/campaign-channels", {
                campaign_id: campaignId,
            });
            return res.data;
        },
        enabled: !!campaignId,
    });
}

export function useCampaignAssets(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_asset", campaignId],
        queryFn: async () => {
            const res = await apiList<Tables<"campaign_assets">>("/api/campaign-assets", {
                campaign_id: campaignId,
            });
            return res.data;
        },
        enabled: !!campaignId,
    });
}

export function useCampaignKPIs(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_kpi", campaignId],
        queryFn: async () => {
            const res = await apiList<Tables<"campaign_kpis">>("/api/campaign-kpis", {
                campaign_id: campaignId,
            });
            return res.data;
        },
        enabled: !!campaignId,
    });
}

// ═══════════════════════════════════════════════════════════════
// UPDATE MUTATION HOOKS (generic via factory)
// ═══════════════════════════════════════════════════════════════

export const useUpdateBrandKit = makeUpdateHook<Tables<"brand_kits">>(
    "brand_kit",
    "/api/brand-kits"
);
export const useUpdateActivation = makeUpdateHook<Tables<"activations">>(
    "activation",
    "/api/activations"
);
export const useUpdateAsset = makeUpdateHook<Tables<"assets">>("asset", "/api/assets");
export const useUpdateBrief = makeUpdateHook<Tables<"creative_briefs">>(
    "creative_brief",
    "/api/briefs"
);
export const useUpdateBudget = makeUpdateHook<Tables<"budgets">>("budget", "/api/budgets");
export const useUpdateCampaign = makeUpdateHook<Tables<"campaigns">>("campaign", "/api/campaigns");
export const useUpdateCrewMember = makeUpdateHook<Tables<"crew_members">>(
    "crew_member",
    "/api/crew"
);
export const useUpdateContract = makeUpdateHook<Tables<"contracts">>("contract", "/api/contracts");
export const useUpdateDeal = makeUpdateHook<Tables<"deals">>("deal", "/api/deals");
export const useUpdateDeck = makeUpdateHook<Tables<"decks">>("deck", "/api/decks");
export const useUpdateEvent = makeUpdateHook<Tables<"events">>("event", "/api/events");
export const useUpdateInvoice = makeUpdateHook<Tables<"invoices">>("invoice", "/api/invoices");
export const useUpdateLocation = makeUpdateHook<Tables<"locations">>("location", "/api/locations");
export const useUpdateVendor = makeUpdateHook<Tables<"vendors">>("vendor", "/api/vendors");

// ═══════════════════════════════════════════════════════════════
// DELETE MUTATION HOOKS (generic via factory)
// ═══════════════════════════════════════════════════════════════

export const useDeleteBrandKit = makeDeleteHook("brand_kit", "/api/brand-kits");
export const useDeleteActivation = makeDeleteHook("activation", "/api/activations");
export const useDeleteAsset = makeDeleteHook("asset", "/api/assets");
export const useDeleteBrief = makeDeleteHook("creative_brief", "/api/briefs");
export const useDeleteBudget = makeDeleteHook("budget", "/api/budgets");
export const useDeleteCampaign = makeDeleteHook("campaign", "/api/campaigns");
export const useDeleteCrewMember = makeDeleteHook("crew_member", "/api/crew");
export const useDeleteContract = makeDeleteHook("contract", "/api/contracts");
export const useDeleteDeal = makeDeleteHook("deal", "/api/deals");
export const useDeleteDeck = makeDeleteHook("deck", "/api/decks");
export const useDeleteEvent = makeDeleteHook("event", "/api/events");
export const useDeleteInvoice = makeDeleteHook("invoice", "/api/invoices");
export const useDeleteLocation = makeDeleteHook("location", "/api/locations");
export const useDeleteVendor = makeDeleteHook("vendor", "/api/vendors");

// ═══════════════════════════════════════════════════════════════
// ADDITIONAL CREATE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useCreateDeck = makeCreateHook<Tables<"decks">>("deck", "/api/decks");
export const useCreateBrandKit = makeCreateHook<Tables<"brand_kits">>(
    "brand_kit",
    "/api/brand-kits"
);

// ═══════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useApproval = makeDetailHook<Tables<"approvals">>("approval", "/api/approvals");
export const useCreateApproval = makeCreateHook<Tables<"approvals">>("approval", "/api/approvals");
export const useDeleteApproval = makeDeleteHook("approval", "/api/approvals");

// ═══════════════════════════════════════════════════════════════
// BUDGETS
// ═══════════════════════════════════════════════════════════════

export const useBudget = makeDetailHook<Tables<"budgets">>("budget", "/api/budgets");

// ═══════════════════════════════════════════════════════════════
// CONTRACTS
// ═══════════════════════════════════════════════════════════════

export const useContractDetail = makeDetailHook<Tables<"contracts">>("contract", "/api/contracts");

// ═══════════════════════════════════════════════════════════════
// DECKS
// ═══════════════════════════════════════════════════════════════

export const useDeck = makeDetailHook<Tables<"decks">>("deck", "/api/decks");

// ═══════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════

export const useInvoiceDetail = makeDetailHook<Tables<"invoices">>("invoice", "/api/invoices");

// ═══════════════════════════════════════════════════════════════
// TEAMS (page-level CRUD)
// ═══════════════════════════════════════════════════════════════

export function useTeams(orgId?: string | null) {
    return useQuery({
        queryKey: ["team", orgId],
        queryFn: async () => {
            const res = await apiList<Record<string, unknown>>("/api/teams", {
                organization_id: orgId ?? undefined,
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
        enabled: !!orgId,
    });
}

export function useTeamDetail(teamId?: string | null) {
    return useQuery({
        queryKey: ["team", "detail", teamId],
        queryFn: () => apiGet<Record<string, unknown>>("/api/teams", teamId!),
        enabled: !!teamId,
    });
}

export function useCreateTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<Record<string, unknown>>("/api/teams", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
    });
}

export function useUpdateTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
            apiUpdate<Record<string, unknown>>("/api/teams", id, updates),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
    });
}

export function useDeleteTeam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete("/api/teams", id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
    });
}

export function useTeamMembersPage(teamId?: string | null) {
    return useQuery({
        queryKey: ["team_member", teamId],
        queryFn: async () => {
            const res = await apiFetch<{ data: unknown[] }>(`/api/teams/${teamId}/members`);
            return res.data;
        },
        enabled: !!teamId,
    });
}

export function useAddTeamMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            teamId,
            ...payload
        }: {
            teamId: string;
            user_id: string;
            role?: string;
        }) => {
            const res = await apiFetch<{ data: unknown }>(`/api/teams/${teamId}/members`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return res.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team_member"] }),
    });
}

export function useRemoveTeamMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
            await apiFetch<void>(`/api/teams/${teamId}/members/${memberId}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team_member"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM HEALTH — SLA, RESILIENCE, DOMAIN EVENTS
// ═══════════════════════════════════════════════════════════════

export const useSlaDefinitions = makeListHook<Tables<"sla_definitions">>(
    "sla_definition",
    "/api/sla-definitions",
    { sort_by: "name", sort_order: "asc" }
);
export const useSlaTracking = makeListHook<Tables<"sla_tracking">>(
    "sla_tracking",
    "/api/sla-tracking",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useResilienceTargets = makeListHook<Tables<"resilience_targets">>(
    "resilience_target",
    "/api/resilience-targets",
    { sort_by: "service_name", sort_order: "asc" }
);
export const useServiceHealthChecks = makeListHook<Tables<"sla_tracking">>(
    "service_health_check",
    "/api/service-health-checks",
    { sort_by: "service_name", sort_order: "asc" }
);

export function useDomainEvents(limit = 20) {
    return useQuery({
        queryKey: ["domain_event", limit],
        queryFn: async () => {
            const res = await apiList<Tables<"domain_events">>("/api/domain-events", {
                sort_by: "created_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DATA EXPORT REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useDataExportRequests = makeListHook<Tables<"data_export_requests">>(
    "data_export_request",
    "/api/data-export-requests",
    { sort_by: "requested_at", sort_order: "desc" }
);

export function useCreateDataExportRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { export_format: string }) =>
            apiCreate<Tables<"data_export_requests">>(
                "/api/data-export-requests",
                payload as Record<string, unknown>
            ),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["data_export_request"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// CHECKLIST TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useChecklistTemplates = makeListHook<Tables<"checklist_templates">>(
    "checklist_template",
    "/api/checklist-templates",
    { sort_by: "name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// BRAND GUIDELINE SECTIONS
// ═══════════════════════════════════════════════════════════════

export const useBrandGuidelineSections = makeListHook<Tables<"brand_guideline_sections">>(
    "brand_guideline_section",
    "/api/brand-guideline-sections",
    { sort_by: "sort_order", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// BRIEF TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useBriefTemplates = makeListHook<Tables<"brief_templates">>(
    "brief_template",
    "/api/brief-templates",
    { sort_by: "name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// INSURANCE REQUIREMENTS
// ═══════════════════════════════════════════════════════════════

export const useInsuranceRequirements = makeListHook<Tables<"insurance_requirements">>(
    "insurance_requirement",
    "/api/insurance-requirements",
    { sort_by: "requirement_name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE REQUIREMENTS
// ═══════════════════════════════════════════════════════════════

export const useComplianceRequirements = makeListHook<Tables<"compliance_checklists">>(
    "compliance_requirement",
    "/api/compliance-requirements",
    { sort_by: "name", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// CREATIVE REVIEWS
// ═══════════════════════════════════════════════════════════════

export const useCreativeReviews = makeListHook<Tables<"creative_reviews">>(
    "creative_review",
    "/api/creative-reviews",
    { sort_by: "created_at", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// WORKER ONBOARDING / OFFBOARDING RUNS
// ═══════════════════════════════════════════════════════════════

export const useWorkerOnboardingRuns = makeListHook<Tables<"worker_onboarding_runs">>(
    "worker_onboarding_run",
    "/api/worker-onboarding-runs",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useWorkerOffboardingRuns = makeListHook<Tables<"worker_offboarding_runs">>(
    "worker_offboarding_run",
    "/api/worker-offboarding-runs",
    { sort_by: "created_at", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// WORKER REVIEWS
// ═══════════════════════════════════════════════════════════════

export const useWorkerReviewsList = makeListHook<Tables<"worker_reviews">>(
    "worker_review",
    "/api/worker-reviews",
    { sort_by: "review_date", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// LOGIN AUDIT LOG
// ═══════════════════════════════════════════════════════════════

export function useLoginAuditLog(limit = 100) {
    return useQuery({
        queryKey: ["login_audit_log", limit],
        queryFn: async () => {
            const res = await apiList<Tables<"login_audit_log">>("/api/login-audit-log", {
                sort_by: "attempted_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ROLE CHANGE LOG
// ═══════════════════════════════════════════════════════════════

export function useRoleChangeLog(limit = 100) {
    return useQuery({
        queryKey: ["role_change_log", limit],
        queryFn: async () => {
            const res = await apiList<Tables<"role_change_log">>("/api/role-change-log", {
                sort_by: "changed_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ACCESS REVIEWS & TEMPORARY GRANTS
// ═══════════════════════════════════════════════════════════════

export function useAccessAuditLog(limit = 100) {
    return useQuery({
        queryKey: ["access_audit_log", limit],
        queryFn: async () => {
            const res = await apiList<Tables<"access_audit_log">>("/api/access-audit-log", {
                sort_by: "performed_at",
                sort_order: "desc",
                limit,
            });
            return res.data;
        },
    });
}

export const useTemporaryAccessGrants = makeListHook<Tables<"temporary_access_grants">>(
    "temporary_access_grant",
    "/api/temporary-access-grants",
    { sort_by: "created_at", sort_order: "desc" }
);

export function useRevokeTemporaryGrant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiUpdate<Tables<"temporary_access_grants">>("/api/temporary-access-grants", id, {
                status: "revoked",
                revoked_at: new Date().toISOString(),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["temporary_access_grant"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// INVITATIONS
// ═══════════════════════════════════════════════════════════════

export const useInvitationsList = makeListHook<Tables<"invitations">>(
    "invitation",
    "/api/invitations",
    { sort_by: "created_at", sort_order: "desc" }
);

export function useUpdateInvitation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
            apiUpdate<Tables<"invitations">>("/api/invitations", id, updates),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["invitation"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// CASE STUDIES (public page)
// ═══════════════════════════════════════════════════════════════

export function usePublicCaseStudies() {
    return useQuery({
        queryKey: ["case_study_public"],
        queryFn: async () => {
            const res = await apiList<Tables<"case_studies">>("/api/case-studies", {
                is_published: true,
                sort_by: "published_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD AGGREGATION HOOKS
// ═══════════════════════════════════════════════════════════════

export const useDashboardWidgets = makeListHook<Tables<"dashboard_widgets">>(
    "dashboard_widget",
    "/api/dashboard-widgets",
    { sort_by: "sort_order", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// FORECASTING
// ═══════════════════════════════════════════════════════════════

export function useResourceBookings() {
    return useQuery({
        queryKey: ["resource_booking"],
        queryFn: async () => {
            const res = await apiList<Tables<"resource_bookings">>("/api/resource-bookings", {
                sort_by: "start_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export const useGoals = makeListHook<Tables<"goals">>("goal", "/api/goals", {
    sort_by: "created_at",
    sort_order: "desc",
});

// ═══════════════════════════════════════════════════════════════
// ORG CHART — CREW ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export const useLiveCrewAssignments = makeListHook<Tables<"live_crew_assignments">>(
    "live_crew_assignment",
    "/api/live-crew-assignments",
    { sort_by: "role", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// APPROVAL STEPS
// ═══════════════════════════════════════════════════════════════

export const useApprovalSteps = makeListHook<Tables<"approval_steps">>(
    "approval_step",
    "/api/approval-steps",
    { sort_by: "step_order", sort_order: "asc" }
);

// ═══════════════════════════════════════════════════════════════
// MISSING EXPORT ALIASES (consumed by pages)
// ═══════════════════════════════════════════════════════════════

export const useBrandKit = makeDetailHook<Tables<"brand_kits">>("brand_kit", "/api/brand-kits");
export const useContract = makeDetailHook<Tables<"contracts">>("contract", "/api/contracts");
export const useInvoice = makeDetailHook<Tables<"invoices">>("invoice", "/api/invoices");
export const usePerson = makeDetailHook<Tables<"user_profiles">>("people", "/api/user-profiles");
export const useTemplate = makeDetailHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates"
);
export const useTemplates = makeListHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useUpdateDocumentTemplate = makeUpdateHook<Tables<"project_templates">>(
    "template",
    "/api/project-templates"
);
export const useUpdateBudgetApproval = makeUpdateHook<Tables<"budget_approvals">>(
    "budget_approval",
    "/api/budget-approvals"
);
export const useWorkerProfile = makeDetailHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/worker-profiles"
);
export const useDispatchRecord = makeDetailHook<Tables<"dispatch_entries">>(
    "dispatch",
    "/api/dispatch"
);
export const useDispatch = useDispatchRecords;
export const useVendorComplianceDocs = useVendorComplianceDocuments;
export { useDocuments as useMyDocuments };
export { useCampaignKPIs as useCampaignKpis };

export const useUserDirectory = makeListHook<Tables<"user_profiles">>(
    "user_directory",
    "/api/user-directory",
    { sort_by: "display_name", sort_order: "asc" }
);

export function useSubmitTimeEntries() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (entryIds: string[]) =>
            apiFetch<{ data: unknown }>("/api/time-entries/submit", {
                method: "POST",
                body: JSON.stringify({ entry_ids: entryIds, status: "submitted" }),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["time_entry"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// BILLING / SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════

export function useBillingPlan() {
    return useQuery({
        queryKey: ["billing_plan"],
        queryFn: async () => {
            const res = await apiFetch<{ subscription: Record<string, unknown> | null }>(
                "/api/billing/subscribe"
            );
            return res.subscription;
        },
    });
}

export function useSelectPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            pricing_tier: "starter" | "core" | "team" | "pro" | "enterprise";
            billing_cycle: "monthly" | "annual";
        }) => {
            const res = await apiFetch<{ subscription: unknown }>("/api/billing/subscribe", {
                method: "POST",
                body: JSON.stringify(params),
            });
            return res.subscription;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["billing_plan"] }),
    });
}
