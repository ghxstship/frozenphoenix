"use client";

/**
 * Supabase hooks for tables required by dashboard pages that were previously
 * mock-data-only. These complement hooks.ts and hooks-extended.ts.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, isSupabaseConfigured } from "./client";

function getSupabase() {
    const client = createClient();
    if (!client) throw new Error("Supabase client not configured");
    return client;
}

/* Generic table accessor for CRUD wrappers that use Record<string, unknown> payloads.
   Scoped any-cast — see settings/hooks.ts for rationale on dynamic table typing. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromTable(table: string): any {
    return getSupabase().from(table as never);
}

export { isSupabaseConfigured };

// ═══════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════

export function useCampaigns(projectId?: string) {
    return useQuery({
        queryKey: ["campaigns", projectId],
        queryFn: async () => {
            let query = fromTable("campaigns")
                .select("*, projects(name), profiles(name)")
                .order("start_date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (c: Record<string, unknown>) => {
            const { data, error } = await fromTable("campaigns").insert(c).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PROPOSALS
// ═══════════════════════════════════════════════════════════════

export function useProposals(status?: string) {
    return useQuery({
        queryKey: ["proposals", status],
        queryFn: async () => {
            let query = fromTable("proposals")
                .select("*, deals(title, company_name), profiles(name)")
                .order("created_at", { ascending: false });
            if (status && status !== "all") query = query.eq("status", status);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateProposal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (p: Record<string, unknown>) => {
            const { data, error } = await fromTable("proposals").insert(p).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["proposals"] }),
    });
}

export function useUpdateProposal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Record<string, unknown>) => {
            const { data, error } = await fromTable("proposals").update(updates).eq("id", id as string).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["proposals"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// BRIEFS
// ═══════════════════════════════════════════════════════════════

export function useBriefs(projectId?: string) {
    return useQuery({
        queryKey: ["briefs", projectId],
        queryFn: async () => {
            let query = fromTable("briefs")
                .select("*, projects(name), profiles(name)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateBrief() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("briefs").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["briefs"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// CLIENT INVOICES
// ═══════════════════════════════════════════════════════════════

export function useClientInvoices(status?: string) {
    return useQuery({
        queryKey: ["client_invoices", status],
        queryFn: async () => {
            let query = fromTable("client_invoices")
                .select("*, projects(name), profiles(name)")
                .order("due_date", { ascending: false });
            if (status && status !== "all") query = query.eq("status", status);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateClientInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (inv: Record<string, unknown>) => {
            const { data, error } = await fromTable("client_invoices").insert(inv).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["client_invoices"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// COMPANIES (stakeholders)
// ═══════════════════════════════════════════════════════════════

export function useCompanies() {
    return useQuery({
        queryKey: ["companies"],
        queryFn: async () => {
            const { data, error } = await fromTable("stakeholders")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ESTIMATES
// ═══════════════════════════════════════════════════════════════

export function useEstimates() {
    return useQuery({
        queryKey: ["estimates"],
        queryFn: async () => {
            const { data, error } = await fromTable("estimates")
                .select("*, deals(title, company_name), profiles(name)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateEstimate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (e: Record<string, unknown>) => {
            const { data, error } = await fromTable("estimates").insert(e).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["estimates"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// DIGITAL ASSETS
// ═══════════════════════════════════════════════════════════════

export function useDigitalAssets(projectId?: string) {
    return useQuery({
        queryKey: ["digital_assets", projectId],
        queryFn: async () => {
            let query = fromTable("digital_assets")
                .select("*, profiles(name), projects(name)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateDigitalAsset() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (a: Record<string, unknown>) => {
            const { data, error } = await fromTable("digital_assets").insert(a).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["digital_assets"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export function useCertifications(crewMemberId?: string) {
    return useQuery({
        queryKey: ["certifications", crewMemberId],
        queryFn: async () => {
            let query = fromTable("certifications")
                .select("*, crew_members(name)")
                .order("expiry_date");
            if (crewMemberId) query = query.eq("crew_member_id", crewMemberId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CHANGE ORDERS
// ═══════════════════════════════════════════════════════════════

export function useChangeOrders(projectId?: string) {
    return useQuery({
        queryKey: ["change_orders", projectId],
        queryFn: async () => {
            let query = fromTable("change_orders")
                .select("*, projects(name), profiles(name)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateChangeOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (co: Record<string, unknown>) => {
            const { data, error } = await fromTable("change_orders").insert(co).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["change_orders"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE CHECKLISTS
// ═══════════════════════════════════════════════════════════════

export function useComplianceChecklists() {
    return useQuery({
        queryKey: ["compliance_checklists"],
        queryFn: async () => {
            const { data, error } = await fromTable("compliance_checklists")
                .select("*, profiles(name)")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CALL SHEETS
// ═══════════════════════════════════════════════════════════════

export function useCallSheets(projectId?: string) {
    return useQuery({
        queryKey: ["call_sheets", projectId],
        queryFn: async () => {
            let query = fromTable("call_sheets")
                .select("*, projects(name), profiles(name), events(name), locations(name)")
                .order("date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateCallSheet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (cs: Record<string, unknown>) => {
            const { data, error } = await fromTable("call_sheets").insert(cs).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["call_sheets"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// AUTOMATIONS
// ═══════════════════════════════════════════════════════════════

export function useAutomations() {
    return useQuery({
        queryKey: ["automations"],
        queryFn: async () => {
            const { data, error } = await fromTable("automations")
                .select("*, profiles(name)")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateAutomation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (a: Record<string, unknown>) => {
            const { data, error } = await fromTable("automations").insert(a).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// SCOPES OF WORK
// ═══════════════════════════════════════════════════════════════

export function useScopesOfWork(projectId?: string) {
    return useQuery({
        queryKey: ["scopes_of_work", projectId],
        queryFn: async () => {
            let query = fromTable("scopes_of_work")
                .select("*, projects(name), profiles(name)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateScopeOfWork() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (s: Record<string, unknown>) => {
            const { data, error } = await fromTable("scopes_of_work").insert(s).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["scopes_of_work"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════

export function useLeads(status?: string) {
    return useQuery({
        queryKey: ["leads", status],
        queryFn: async () => {
            let query = fromTable("leads")
                .select("*, profiles(name)")
                .order("created_at", { ascending: false });
            if (status && status !== "all") query = query.eq("status", status);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (l: Record<string, unknown>) => {
            const { data, error } = await fromTable("leads").insert(l).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// VENDOR REVIEWS
// ═══════════════════════════════════════════════════════════════

export function useVendorReviews(vendorId?: string) {
    return useQuery({
        queryKey: ["vendor_reviews", vendorId],
        queryFn: async () => {
            let query = fromTable("vendor_reviews")
                .select("*, vendors(name), profiles(name), projects(name)")
                .order("created_at", { ascending: false });
            if (vendorId) query = query.eq("vendor_id", vendorId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// E-SIGNATURES
// ═══════════════════════════════════════════════════════════════

export function useESignatures(contractId?: string) {
    return useQuery({
        queryKey: ["e_signatures", contractId],
        queryFn: async () => {
            let query = fromTable("e_signatures")
                .select("*, contracts(title), profiles(name)")
                .order("created_at", { ascending: false });
            if (contractId) query = query.eq("contract_id", contractId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS (generic)
// ═══════════════════════════════════════════════════════════════

export function useDocuments(projectId?: string) {
    return useQuery({
        queryKey: ["documents", projectId],
        queryFn: async () => {
            let query = fromTable("vault_documents")
                .select("*, profiles(name)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DISPATCH / FLEET
// ═══════════════════════════════════════════════════════════════

export function useFleetVehicles() {
    return useQuery({
        queryKey: ["fleet_vehicles"],
        queryFn: async () => {
            const { data, error } = await fromTable("vehicles")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNTS (CRM contacts/accounts)
// ═══════════════════════════════════════════════════════════════

export function useAccounts() {
    return useQuery({
        queryKey: ["accounts"],
        queryFn: async () => {
            const { data, error } = await fromTable("stakeholders")
                .select("*")
                .eq("type", "company")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

export function usePeople() {
    return useQuery({
        queryKey: ["people"],
        queryFn: async () => {
            const { data, error } = await fromTable("profiles")
                .select("*")
                .order("full_name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CREATIVE ASSETS (campaign_assets)
// ═══════════════════════════════════════════════════════════════

export function useCreativeAssets(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_assets", campaignId],
        queryFn: async () => {
            let q = fromTable("campaign_assets").select("*").order("created_at", { ascending: false });
            if (campaignId) q = q.eq("campaign_id", campaignId);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════

export function useOpportunities(stage?: string) {
    return useQuery({
        queryKey: ["opportunities", stage],
        queryFn: async () => {
            let q = fromTable("opportunities").select("*").order("created_at", { ascending: false });
            if (stage) q = q.eq("stage", stage);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════════════════

export function useIncidents() {
    return useQuery({
        queryKey: ["incidents"],
        queryFn: async () => {
            const { data, error } = await fromTable("incidents")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// BRAND GUIDELINES
// ═══════════════════════════════════════════════════════════════

export function useBrandGuidelines() {
    return useQuery({
        queryKey: ["brand_guidelines"],
        queryFn: async () => {
            const { data, error } = await fromTable("brand_guidelines")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════

export function usePurchaseOrders(status?: string) {
    return useQuery({
        queryKey: ["purchase_orders", status],
        queryFn: async () => {
            let q = fromTable("purchase_orders").select("*").order("created_at", { ascending: false });
            if (status) q = q.eq("status", status);
            const { data, error } = await q;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPENSES (production_expenses)
// ═══════════════════════════════════════════════════════════════

export function useExpenses() {
    return useQuery({
        queryKey: ["expenses"],
        queryFn: async () => {
            const { data, error } = await fromTable("production_expenses")
                .select("*")
                .order("expense_date", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPENSE REPORTS
// ═══════════════════════════════════════════════════════════════

export function useExpenseReports() {
    return useQuery({
        queryKey: ["expense_reports"],
        queryFn: async () => {
            const { data, error } = await fromTable("expense_reports")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// TIMESHEETS
// ═══════════════════════════════════════════════════════════════

export function useTimesheets() {
    return useQuery({
        queryKey: ["timesheets"],
        queryFn: async () => {
            const { data, error } = await fromTable("timesheets")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════════════════════════

export function useWorkflows() {
    return useQuery({
        queryKey: ["workflows"],
        queryFn: async () => {
            const { data, error } = await fromTable("workflows")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// INSURANCE POLICIES
// ═══════════════════════════════════════════════════════════════

export function useInsurancePolicies() {
    return useQuery({
        queryKey: ["insurance_policies"],
        queryFn: async () => {
            const { data, error } = await fromTable("insurance_policies")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PERMITS
// ═══════════════════════════════════════════════════════════════

export function usePermits() {
    return useQuery({
        queryKey: ["permits"],
        queryFn: async () => {
            const { data, error } = await fromTable("permits")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// RISK ASSESSMENTS
// ═══════════════════════════════════════════════════════════════

export function useRiskAssessments() {
    return useQuery({
        queryKey: ["risk_assessments"],
        queryFn: async () => {
            const { data, error } = await fromTable("risk_assessments")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// SHIPMENTS
// ═══════════════════════════════════════════════════════════════

export function useShipments() {
    return useQuery({
        queryKey: ["shipments"],
        queryFn: async () => {
            const { data, error } = await fromTable("shipments")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// WAREHOUSES
// ═══════════════════════════════════════════════════════════════

export function useWarehouses() {
    return useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const { data, error } = await fromTable("warehouses")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DISPATCH
// ═══════════════════════════════════════════════════════════════

export function useDispatch() {
    return useQuery({
        queryKey: ["dispatch"],
        queryFn: async () => {
            const { data, error } = await fromTable("shipments")
                .select("*")
                .in("status", ["pending", "in_transit", "dispatched"])
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PAYROLL
// ═══════════════════════════════════════════════════════════════

export function usePayroll() {
    return useQuery({
        queryKey: ["payroll_batches"],
        queryFn: async () => {
            const { data, error } = await fromTable("payroll_batches")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CREDIT NOTES
// ═══════════════════════════════════════════════════════════════

export function useCreditNotes() {
    return useQuery({
        queryKey: ["credit_notes"],
        queryFn: async () => {
            const { data, error } = await fromTable("credit_notes")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// WORK ORDERS
// ═══════════════════════════════════════════════════════════════

export function useWorkOrders() {
    return useQuery({
        queryKey: ["work_orders"],
        queryFn: async () => {
            const { data, error } = await fromTable("work_orders")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// WORKER PROFILES (workforce)
// ═══════════════════════════════════════════════════════════════

export function useWorkerProfiles() {
    return useQuery({
        queryKey: ["worker_profiles"],
        queryFn: async () => {
            const { data, error } = await fromTable("worker_profiles")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// BUDGET APPROVALS
// ═══════════════════════════════════════════════════════════════

export function useBudgetApprovals() {
    return useQuery({
        queryKey: ["budget_approvals"],
        queryFn: async () => {
            const { data, error } = await fromTable("budget_approvals")
                .select("*")
                .order("requested_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CHECKLISTS
// ═══════════════════════════════════════════════════════════════

export function useChecklists() {
    return useQuery({
        queryKey: ["checklists"],
        queryFn: async () => {
            const { data, error } = await fromTable("checklists")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════

export function useServiceRequests() {
    return useQuery({
        queryKey: ["service_requests"],
        queryFn: async () => {
            const { data, error } = await fromTable("service_requests")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG (audit log)
// ═══════════════════════════════════════════════════════════════

export function useActivityLog() {
    return useQuery({
        queryKey: ["activity_log"],
        queryFn: async () => {
            const { data, error } = await fromTable("activity_log")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(200);
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// VENDOR COMPLIANCE DOCUMENTS
// ═══════════════════════════════════════════════════════════════

export function useVendorComplianceDocs() {
    return useQuery({
        queryKey: ["vendor_compliance_documents"],
        queryFn: async () => {
            const { data, error } = await fromTable("vendor_compliance_documents")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// TIME ENTRIES (production_time_entries)
// ═══════════════════════════════════════════════════════════════

export function useTimeEntries() {
    return useQuery({
        queryKey: ["time_entries"],
        queryFn: async () => {
            const { data, error } = await fromTable("production_time_entries")
                .select("*")
                .order("entry_date", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════

export function usePayments() {
    return useQuery({
        queryKey: ["payments"],
        queryFn: async () => {
            const { data, error } = await fromTable("payments")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE REQUISITIONS
// ═══════════════════════════════════════════════════════════════

export function usePurchaseRequisitions() {
    return useQuery({
        queryKey: ["purchase_requisitions"],
        queryFn: async () => {
            const { data, error } = await fromTable("purchase_requisitions")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// RECURRING INVOICES
// ═══════════════════════════════════════════════════════════════

export function useRecurringInvoices() {
    return useQuery({
        queryKey: ["recurring_invoices"],
        queryFn: async () => {
            const { data, error } = await fromTable("recurring_invoices")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE ARTICLES
// ═══════════════════════════════════════════════════════════════

export function useKnowledgeBaseArticles() {
    return useQuery({
        queryKey: ["knowledge_base_articles"],
        queryFn: async () => {
            const { data, error } = await fromTable("knowledge_base_articles")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY ITEMS
// ═══════════════════════════════════════════════════════════════

export function useInventoryItems() {
    return useQuery({
        queryKey: ["inventory_items"],
        queryFn: async () => {
            const { data, error } = await fromTable("consumables")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// IP RIGHTS
// ═══════════════════════════════════════════════════════════════

export function useIpRights() {
    return useQuery({
        queryKey: ["ip_rights"],
        queryFn: async () => {
            const { data, error } = await fromTable("ip_rights")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT OBLIGATIONS
// ═══════════════════════════════════════════════════════════════

export function useContractObligations() {
    return useQuery({
        queryKey: ["contract_obligations"],
        queryFn: async () => {
            const { data, error } = await fromTable("contract_obligations")
                .select("*")
                .order("due_date", { ascending: true });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// GOODS RECEIPTS
// ═══════════════════════════════════════════════════════════════

export function useGoodsReceipts() {
    return useQuery({
        queryKey: ["goods_receipts"],
        queryFn: async () => {
            const { data, error } = await fromTable("goods_receipts")
                .select("*")
                .order("received_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// TECH SHEETS
// ═══════════════════════════════════════════════════════════════

export function useTechSheets() {
    return useQuery({
        queryKey: ["tech_sheets"],
        queryFn: async () => {
            const { data, error } = await fromTable("tech_sheets")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// RATE CARDS
// ═══════════════════════════════════════════════════════════════

export function useRateCards() {
    return useQuery({
        queryKey: ["rate_cards"],
        queryFn: async () => {
            const { data, error } = await fromTable("rate_cards")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// REVENUE SCHEDULES
// ═══════════════════════════════════════════════════════════════

export function useRevenueSchedules() {
    return useQuery({
        queryKey: ["revenue_schedules"],
        queryFn: async () => {
            const { data, error } = await fromTable("revenue_schedules")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// GL ACCOUNTS
// ═══════════════════════════════════════════════════════════════

export function useGlAccounts() {
    return useQuery({
        queryKey: ["gl_accounts"],
        queryFn: async () => {
            const { data, error } = await fromTable("gl_accounts")
                .select("*")
                .order("account_code");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES
// ═══════════════════════════════════════════════════════════════

export function useTemplates() {
    return useQuery({
        queryKey: ["document_templates"],
        queryFn: async () => {
            const { data, error } = await fromTable("document_templates")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// USER DIRECTORY (profiles)
// ═══════════════════════════════════════════════════════════════

export function useUserDirectory() {
    return useQuery({
        queryKey: ["user_directory"],
        queryFn: async () => {
            const { data, error } = await fromTable("profiles")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// VENDOR ONBOARDING
// ═══════════════════════════════════════════════════════════════

export function useVendorOnboarding() {
    return useQuery({
        queryKey: ["vendor_onboarding"],
        queryFn: async () => {
            const { data, error } = await fromTable("vendors")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ENGINEERING APPROVALS
// ═══════════════════════════════════════════════════════════════

export function useEngineeringApprovals() {
    return useQuery({
        queryKey: ["engineering_approvals"],
        queryFn: async () => {
            const { data, error } = await fromTable("engineering_approvals")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// JOB COST ENTRIES
// ═══════════════════════════════════════════════════════════════

export function useJobCostEntries() {
    return useQuery({
        queryKey: ["job_cost_entries"],
        queryFn: async () => {
            const { data, error } = await fromTable("job_cost_entries")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CLAUSE LIBRARY
// ═══════════════════════════════════════════════════════════════

export function useClauseLibrary() {
    return useQuery({
        queryKey: ["clause_library"],
        queryFn: async () => {
            const { data, error } = await fromTable("clause_library")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}
