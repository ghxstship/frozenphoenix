"use client";

/**
 * Supabase hooks for tables required by dashboard pages that were previously
 * mock-data-only. These complement hooks.ts and hooks-extended.ts.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable, isSupabaseConfigured } from "./client";

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
            const { data, error } = await fromTable("proposals")
                .update(updates)
                .eq("id", id as string)
                .select()
                .single();
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

export function useClientInvoice(id: string) {
    return useQuery({
        queryKey: ["client_invoice", id],
        queryFn: async () => {
            const { data, error } = await fromTable("client_invoices")
                .select("*, projects(name), profiles(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateClientInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (inv: Record<string, unknown>) => {
            const { data, error } = await fromTable("client_invoices")
                .insert(inv)
                .select()
                .single();
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
            const { data, error } = await fromTable("stakeholders").select("*").order("name");
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

export function useComplianceChecklist(id: string) {
    return useQuery({
        queryKey: ["compliance_checklist", id],
        queryFn: async () => {
            const { data, error } = await fromTable("compliance_checklists")
                .select("*, profiles(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
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

export function useVendorReview(id: string) {
    return useQuery({
        queryKey: ["vendor_review", id],
        queryFn: async () => {
            const { data, error } = await fromTable("vendor_reviews")
                .select("*, vendors(name), profiles(name), projects(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
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
            const { data, error } = await fromTable("vehicles").select("*").order("name");
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

export function useAccount(id: string) {
    return useQuery({
        queryKey: ["account", id],
        queryFn: async () => {
            const { data, error } = await fromTable("stakeholders")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function usePeople() {
    return useQuery({
        queryKey: ["people"],
        queryFn: async () => {
            const { data, error } = await fromTable("profiles").select("*").order("full_name");
            if (error) throw error;
            return data;
        },
    });
}

export function usePerson(id: string) {
    return useQuery({
        queryKey: ["person", id],
        queryFn: async () => {
            const { data, error } = await fromTable("profiles").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// CREATIVE ASSETS (campaign_assets)
// ═══════════════════════════════════════════════════════════════

export function useCreativeAssets(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_assets", campaignId],
        queryFn: async () => {
            let q = fromTable("campaign_assets")
                .select("*")
                .order("created_at", { ascending: false });
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
            let q = fromTable("opportunities")
                .select("*")
                .order("created_at", { ascending: false });
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

export function useBrandGuideline(id: string) {
    return useQuery({
        queryKey: ["brand_guideline", id],
        queryFn: async () => {
            const { data, error } = await fromTable("brand_guidelines")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════

export function usePurchaseOrders(status?: string) {
    return useQuery({
        queryKey: ["purchase_orders", status],
        queryFn: async () => {
            let q = fromTable("purchase_orders")
                .select("*")
                .order("created_at", { ascending: false });
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
            const { data, error } = await fromTable("warehouses").select("*").order("name");
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

export function useDispatchRecord(id: string) {
    return useQuery({
        queryKey: ["dispatch_record", id],
        queryFn: async () => {
            const { data, error } = await fromTable("shipments").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
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

export function useWorkerProfile(id: string) {
    return useQuery({
        queryKey: ["worker_profile", id],
        queryFn: async () => {
            const { data, error } = await fromTable("worker_profiles")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
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
            const { data, error } = await fromTable("consumables").select("*").order("name");
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
            const { data, error } = await fromTable("profiles").select("*").order("name");
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

// ═══════════════════════════════════════════════════════════════
// SINGLE-RECORD HOOKS (detail [id] pages)
// ═══════════════════════════════════════════════════════════════

export function useActivation(id: string) {
    return useQuery({
        queryKey: ["activation", id],
        queryFn: async () => {
            const { data, error } = await fromTable("activations")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useShipment(id: string) {
    return useQuery({
        queryKey: ["shipment", id],
        queryFn: async () => {
            const { data, error } = await fromTable("shipments").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useVendor(id: string) {
    return useQuery({
        queryKey: ["vendor", id],
        queryFn: async () => {
            const { data, error } = await fromTable("vendors").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useWorkOrder(id: string) {
    return useQuery({
        queryKey: ["work_order", id],
        queryFn: async () => {
            const { data, error } = await fromTable("work_orders")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useTask(id: string) {
    return useQuery({
        queryKey: ["task", id],
        queryFn: async () => {
            const { data, error } = await fromTable("tasks").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useOpportunity(id: string) {
    return useQuery({
        queryKey: ["opportunity", id],
        queryFn: async () => {
            const { data, error } = await fromTable("opportunities")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useInsurancePolicy(id: string) {
    return useQuery({
        queryKey: ["insurance_policy", id],
        queryFn: async () => {
            const { data, error } = await fromTable("insurance_policies")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useEstimate(id: string) {
    return useQuery({
        queryKey: ["estimate", id],
        queryFn: async () => {
            const { data, error } = await fromTable("estimates").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function usePermit(id: string) {
    return useQuery({
        queryKey: ["permit", id],
        queryFn: async () => {
            const { data, error } = await fromTable("permits").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useChangeOrder(id: string) {
    return useQuery({
        queryKey: ["change_order", id],
        queryFn: async () => {
            const { data, error } = await fromTable("change_orders")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useBrief(id: string) {
    return useQuery({
        queryKey: ["brief", id],
        queryFn: async () => {
            const { data, error } = await fromTable("briefs").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useServiceRequest(id: string) {
    return useQuery({
        queryKey: ["service_request", id],
        queryFn: async () => {
            const { data, error } = await fromTable("service_requests")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useBudget(id: string) {
    return useQuery({
        queryKey: ["budget", id],
        queryFn: async () => {
            const { data, error } = await fromTable("budgets").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: ["campaign", id],
        queryFn: async () => {
            const { data, error } = await fromTable("campaigns").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useIncident(id: string) {
    return useQuery({
        queryKey: ["incident", id],
        queryFn: async () => {
            const { data, error } = await fromTable("incidents").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCertification(id: string) {
    return useQuery({
        queryKey: ["certification", id],
        queryFn: async () => {
            const { data, error } = await fromTable("certifications")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// BUDGET LINE ITEMS
// ═══════════════════════════════════════════════════════════════

export function useBudgetLines(budgetId?: string) {
    return useQuery({
        queryKey: ["production_budget_lines", budgetId],
        queryFn: async () => {
            let query = fromTable("production_budget_lines").select("*").order("created_at");
            if (budgetId) query = query.eq("budget_id", budgetId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN SUB-ENTITIES
// ═══════════════════════════════════════════════════════════════

export function useCampaignChannels(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_channels", campaignId],
        queryFn: async () => {
            let query = fromTable("campaign_channels").select("*").order("created_at");
            if (campaignId) query = query.eq("campaign_id", campaignId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!campaignId,
    });
}

export function useCampaignAssets(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_assets", campaignId],
        queryFn: async () => {
            let query = fromTable("campaign_assets").select("*").order("created_at");
            if (campaignId) query = query.eq("campaign_id", campaignId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!campaignId,
    });
}

export function useCampaignKpis(campaignId?: string) {
    return useQuery({
        queryKey: ["campaign_kpis", campaignId],
        queryFn: async () => {
            let query = fromTable("campaign_kpis").select("*").order("created_at");
            if (campaignId) query = query.eq("campaign_id", campaignId);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!campaignId,
    });
}

export function useEvent(id: string) {
    return useQuery({
        queryKey: ["event", id],
        queryFn: async () => {
            const { data, error } = await fromTable("events").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// SINGLE-RECORD HOOKS (Phase 1 — wire mock detail pages to Supabase)
// ═══════════════════════════════════════════════════════════════

export function useBrandKit(id: string) {
    return useQuery({
        queryKey: ["brand_kit", id],
        queryFn: async () => {
            const { data, error } = await fromTable("brand_kits").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCallSheet(id: string) {
    return useQuery({
        queryKey: ["call_sheet", id],
        queryFn: async () => {
            const { data, error } = await fromTable("call_sheets")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCompany(id: string) {
    return useQuery({
        queryKey: ["company", id],
        queryFn: async () => {
            const { data, error } = await fromTable("companies").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useContract(id: string) {
    return useQuery({
        queryKey: ["contract", id],
        queryFn: async () => {
            const { data, error } = await fromTable("contracts").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreativeAsset(id: string) {
    return useQuery({
        queryKey: ["creative_asset", id],
        queryFn: async () => {
            const { data, error } = await fromTable("digital_assets")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useDeck(id: string) {
    return useQuery({
        queryKey: ["deck", id],
        queryFn: async () => {
            const { data, error } = await fromTable("decks").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useDigitalAsset(id: string) {
    return useQuery({
        queryKey: ["digital_asset", id],
        queryFn: async () => {
            const { data, error } = await fromTable("digital_assets")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useExpense(id: string) {
    return useQuery({
        queryKey: ["expense", id],
        queryFn: async () => {
            const { data, error } = await fromTable("expenses").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ["invoice", id],
        queryFn: async () => {
            const { data, error } = await fromTable("invoices").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useProposal(id: string) {
    return useQuery({
        queryKey: ["proposal", id],
        queryFn: async () => {
            const { data, error } = await fromTable("proposals").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useRecurringInvoice(id: string) {
    return useQuery({
        queryKey: ["recurring_invoice", id],
        queryFn: async () => {
            const { data, error } = await fromTable("recurring_invoices")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useScopeOfWork(id: string) {
    return useQuery({
        queryKey: ["scope_of_work", id],
        queryFn: async () => {
            const { data, error } = await fromTable("scopes_of_work")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useTechSheet(id: string) {
    return useQuery({
        queryKey: ["tech_sheet", id],
        queryFn: async () => {
            const { data, error } = await fromTable("tech_sheets")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useTemplate(id: string) {
    return useQuery({
        queryKey: ["template", id],
        queryFn: async () => {
            const { data, error } = await fromTable("project_templates")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ═══════════════════════════════════════════════════════════════
// UPDATE MUTATION HOOKS (Phase 2)
// ═══════════════════════════════════════════════════════════════

function makeUpdateHook(table: string, keyPrefix: string) {
    return function useUpdateEntity() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: async ({ id, ...updates }: Record<string, unknown>) => {
                const { data, error } = await fromTable(table)
                    .update(updates)
                    .eq("id", id as string)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            onSuccess: (_d, vars) => {
                qc.invalidateQueries({ queryKey: [keyPrefix] });
                qc.invalidateQueries({ queryKey: [keyPrefix, vars.id] });
            },
        });
    };
}

function makeDeleteHook(table: string, keyPrefix: string) {
    return function useDeleteEntity() {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: async (id: string) => {
                const { error } = await fromTable(table).delete().eq("id", id);
                if (error) throw error;
            },
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: [keyPrefix] });
            },
        });
    };
}

export const useUpdateBrandKit = makeUpdateHook("brand_kits", "brand_kits");
export const useUpdateActivation = makeUpdateHook("activations", "activations");
export const useUpdateAsset = makeUpdateHook("assets", "assets");
export const useUpdateBrief = makeUpdateHook("briefs", "briefs");
export const useUpdateBudget = makeUpdateHook("budgets", "budgets");
export const useUpdateCallSheet = makeUpdateHook("call_sheets", "call_sheets");
export const useUpdateCampaign = makeUpdateHook("campaigns", "campaigns");
export const useUpdateCertification = makeUpdateHook("certifications", "certifications");
export const useUpdateCrewMember = makeUpdateHook("crew_members", "crew_members");
export const useUpdateChangeOrder = makeUpdateHook("change_orders", "change_orders");
export const useUpdateCompany = makeUpdateHook("companies", "companies");
export const useUpdateContract = makeUpdateHook("contracts", "contracts");
export const useUpdateCreativeAsset = makeUpdateHook("digital_assets", "creative_assets");
export const useUpdateDeal = makeUpdateHook("deals", "deals");
export const useUpdateDeck = makeUpdateHook("decks", "decks");
export const useUpdateDigitalAsset = makeUpdateHook("digital_assets", "digital_assets");
export const useUpdateEstimate = makeUpdateHook("estimates", "estimates");
export const useUpdateEvent = makeUpdateHook("events", "events");
export const useUpdateExpense = makeUpdateHook("expenses", "expenses");
export const useUpdateIncident = makeUpdateHook("incidents", "incidents");
export const useUpdateInsurancePolicy = makeUpdateHook("insurance_policies", "insurance_policies");
export const useUpdateInvoice = makeUpdateHook("invoices", "invoices");
export const useUpdateKBArticle = makeUpdateHook(
    "knowledge_base_articles",
    "knowledge_base_articles"
);
export const useUpdateLead = makeUpdateHook("leads", "leads");
export const useUpdateLocation = makeUpdateHook("locations", "locations");
export const useUpdateOpportunity = makeUpdateHook("opportunities", "opportunities");
export const useUpdatePermit = makeUpdateHook("permits", "permits");
export const useUpdateRecurringInvoice = makeUpdateHook("recurring_invoices", "recurring_invoices");
export const useUpdateScopeOfWork = makeUpdateHook("scopes_of_work", "scopes_of_work");
export const useUpdateServiceRequest = makeUpdateHook("service_requests", "service_requests");
export const useUpdateShipment = makeUpdateHook("shipments", "shipments");
export const useUpdateTechSheet = makeUpdateHook("tech_sheets", "tech_sheets");
export const useUpdateTemplate = makeUpdateHook("project_templates", "templates");
export const useUpdateVendor = makeUpdateHook("vendors", "vendors");
export const useUpdateWorkerProfile = makeUpdateHook("worker_profiles", "worker_profiles");
export const useUpdateWorkOrder = makeUpdateHook("work_orders", "work_orders");
export const useUpdateAccount = makeUpdateHook("stakeholders", "accounts");
export const useUpdateBrandGuideline = makeUpdateHook("brand_guidelines", "brand_guidelines");
export const useUpdateClientInvoice = makeUpdateHook("client_invoices", "client_invoices");
export const useUpdateComplianceChecklist = makeUpdateHook(
    "compliance_checklists",
    "compliance_checklists"
);
export const useUpdateDispatchRecord = makeUpdateHook("shipments", "dispatch");
export const useUpdatePerson = makeUpdateHook("profiles", "people");
export const useUpdateVendorReview = makeUpdateHook("vendor_reviews", "vendor_reviews");

// ═══════════════════════════════════════════════════════════════
// DELETE MUTATION HOOKS (Phase 3)
// ═══════════════════════════════════════════════════════════════

export const useDeleteBrandKit = makeDeleteHook("brand_kits", "brand_kits");
export const useDeleteActivation = makeDeleteHook("activations", "activations");
export const useDeleteAsset = makeDeleteHook("assets", "assets");
export const useDeleteBrief = makeDeleteHook("briefs", "briefs");
export const useDeleteBudget = makeDeleteHook("budgets", "budgets");
export const useDeleteCallSheet = makeDeleteHook("call_sheets", "call_sheets");
export const useDeleteCampaign = makeDeleteHook("campaigns", "campaigns");
export const useDeleteCertification = makeDeleteHook("certifications", "certifications");
export const useDeleteCrewMember = makeDeleteHook("crew_members", "crew_members");
export const useDeleteChangeOrder = makeDeleteHook("change_orders", "change_orders");
export const useDeleteCompany = makeDeleteHook("companies", "companies");
export const useDeleteContract = makeDeleteHook("contracts", "contracts");
export const useDeleteCreativeAsset = makeDeleteHook("digital_assets", "creative_assets");
export const useDeleteDeal = makeDeleteHook("deals", "deals");
export const useDeleteVendor = makeDeleteHook("vendors", "vendors");
export const useDeleteDeck = makeDeleteHook("decks", "decks");
export const useDeleteDigitalAsset = makeDeleteHook("digital_assets", "digital_assets");
export const useDeleteEstimate = makeDeleteHook("estimates", "estimates");
export const useDeleteEvent = makeDeleteHook("events", "events");
export const useDeleteExpense = makeDeleteHook("expenses", "expenses");
export const useDeleteIncident = makeDeleteHook("incidents", "incidents");
export const useDeleteInsurancePolicy = makeDeleteHook("insurance_policies", "insurance_policies");
export const useDeleteInvoice = makeDeleteHook("invoices", "invoices");
export const useDeleteKBArticle = makeDeleteHook(
    "knowledge_base_articles",
    "knowledge_base_articles"
);
export const useDeleteLead = makeDeleteHook("leads", "leads");
export const useDeleteLocation = makeDeleteHook("locations", "locations");
export const useDeleteOpportunity = makeDeleteHook("opportunities", "opportunities");
export const useDeletePermit = makeDeleteHook("permits", "permits");
export const useDeleteProposal = makeDeleteHook("proposals", "proposals");
export const useDeleteRecurringInvoice = makeDeleteHook("recurring_invoices", "recurring_invoices");
export const useDeleteScopeOfWork = makeDeleteHook("scopes_of_work", "scopes_of_work");
export const useDeleteServiceRequest = makeDeleteHook("service_requests", "service_requests");
export const useDeleteShipment = makeDeleteHook("shipments", "shipments");
export const useDeleteTechSheet = makeDeleteHook("tech_sheets", "tech_sheets");
export const useDeleteTemplate = makeDeleteHook("project_templates", "templates");
export const useDeleteWorkerProfile = makeDeleteHook("worker_profiles", "worker_profiles");
export const useDeleteWorkOrder = makeDeleteHook("work_orders", "work_orders");
export const useDeleteAccount = makeDeleteHook("stakeholders", "accounts");
export const useDeleteBrandGuideline = makeDeleteHook("brand_guidelines", "brand_guidelines");
export const useDeleteClientInvoice = makeDeleteHook("client_invoices", "client_invoices");
export const useDeleteComplianceChecklist = makeDeleteHook(
    "compliance_checklists",
    "compliance_checklists"
);
export const useDeleteDispatchRecord = makeDeleteHook("shipments", "dispatch");
export const useDeletePerson = makeDeleteHook("profiles", "people");
export const useDeleteVendorReview = makeDeleteHook("vendor_reviews", "vendor_reviews");

// ═══════════════════════════════════════════════════════════════
// MISSING CREATE HOOKS (Phase 5)
// ═══════════════════════════════════════════════════════════════

export function useCreateCertification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("certifications").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["certifications"] }),
    });
}

export function useCreateInsurancePolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("insurance_policies")
                .insert(b)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance_policies"] }),
    });
}

export function useCreateOpportunity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("opportunities").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
    });
}

export function useCreatePermit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("permits").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["permits"] }),
    });
}

export function useCreateServiceRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("service_requests").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["service_requests"] }),
    });
}

export function useCreateWorkOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("work_orders").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["work_orders"] }),
    });
}

export function useCreateAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("stakeholders").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["stakeholders"] }),
    });
}

export function useCreateBrandGuideline() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("brand_guidelines").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["brand_guidelines"] }),
    });
}

export function useCreateBrandKit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("brand_kits").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["brand_kits"] }),
    });
}

export function useCreateComplianceChecklist() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("compliance_checklists")
                .insert(b)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance_checklists"] }),
    });
}

export function useCreateDeck() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("decks").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
    });
}

export function useCreateDispatchRecord() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("shipments").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
    });
}

export function useCreatePerson() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("profiles").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
    });
}

export function useCreateVendorReview() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("vendor_reviews").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor_reviews"] }),
    });
}

export function useCreateWorkerProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("worker_profiles").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["worker_profiles"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE REQUISITIONS — single-record + mutations
// ═══════════════════════════════════════════════════════════════

export function usePurchaseRequisition(id: string) {
    return useQuery({
        queryKey: ["purchase_requisition", id],
        queryFn: async () => {
            const { data, error } = await fromTable("purchase_requisitions")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreatePurchaseRequisition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("purchase_requisitions")
                .insert(b)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_requisitions"] }),
    });
}

export function useUpdatePurchaseRequisition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("purchase_requisitions")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_requisitions"] }),
    });
}

export function useDeletePurchaseRequisition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await fromTable("purchase_requisitions").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_requisitions"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDERS — single-record + mutations
// ═══════════════════════════════════════════════════════════════

export function usePurchaseOrder(id: string) {
    return useQuery({
        queryKey: ["purchase_order", id],
        queryFn: async () => {
            const { data, error } = await fromTable("purchase_orders")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useUpdatePurchaseOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("purchase_orders")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_orders"] }),
    });
}

export function useDeletePurchaseOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await fromTable("purchase_orders").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_orders"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// APPROVALS — single-record + mutations
// ═══════════════════════════════════════════════════════════════

export function useApproval(id: string) {
    return useQuery({
        queryKey: ["approval", id],
        queryFn: async () => {
            const { data, error } = await fromTable("approvals").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateApproval() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("approvals").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
    });
}

export function useDeleteApproval() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await fromTable("approvals").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS (vault_documents) — single-record + mutations
// ═══════════════════════════════════════════════════════════════

export function useDocument(id: string) {
    return useQuery({
        queryKey: ["document", id],
        queryFn: async () => {
            const { data, error } = await fromTable("vault_documents")
                .select("*, profiles(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (b: Record<string, unknown>) => {
            const { data, error } = await fromTable("vault_documents").insert(b).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
    });
}

export function useUpdateDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("vault_documents")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
    });
}

export function useDeleteDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await fromTable("vault_documents").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
    });
}
