"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterValue, getSupabase } from "./client";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

// ─── Join-aware return types ───
// Supabase's .select("*, foreign(col)") narrows the inferred type.
// These explicit types ensure consumers get the full base row + joined fields.
type WithJoin<T, J extends Record<string, unknown>> = T & J;

type ProfileName = { profiles: { name: string } | null };
type ProfileNameAvatar = { profiles: { name: string; avatar_url: string | null } | null };
type ProjectName = { projects: { name: string } | null };
type VendorName = { vendors: { name: string } | null };
type LocationName = { locations: { name: string } | null };
type EventName = { events: { name: string } | null };
type ActivationName = { activations: { name: string } | null };

export type ApprovalWithProfile = WithJoin<Tables<"approvals">, ProfileName>;
export type VaultDocumentWithProfile = WithJoin<Tables<"vault_documents">, ProfileName>;
export type ExpenseWithJoins = WithJoin<Tables<"expenses">, ProfileName & ProjectName>;
export type CommentWithProfile = WithJoin<Tables<"comments">, ProfileNameAvatar>;
export type ActivityLogWithProfile = WithJoin<Tables<"activity_log">, ProfileName>;
export type TimeEntryWithJoins = WithJoin<
    Tables<"time_entries">,
    ProjectName & { tasks: { title: string } | null; crew_members: { name: string } | null }
>;
export type CalendarEventWithProject = WithJoin<Tables<"calendar_events">, ProjectName>;
export type ShiftWithJoins = WithJoin<
    Tables<"shifts">,
    { crew_members: { name: string; role: string } | null } & ProjectName
>;
export type ProjectWithMembers = WithJoin<
    Tables<"projects">,
    { project_members: { profile_id: string }[] }
>;
export type ProjectDetailWithMembers = WithJoin<
    Tables<"projects">,
    {
        project_members: {
            profile_id: string;
            profiles: { name: string; email: string; avatar_url: string | null } | null;
        }[];
    }
>;
export type CrewMemberWithCerts = WithJoin<
    Tables<"crew_members">,
    { certifications: Tables<"certifications">[] }
>;
export type PurchaseOrderWithJoins = WithJoin<
    Tables<"purchase_orders">,
    VendorName & { purchase_order_items: Tables<"purchase_order_items">[] }
>;
export type InvoiceWithJoins = WithJoin<
    Tables<"invoices">,
    VendorName & { purchase_orders: { total_amount: number } | null }
>;
export type StakeholderWithProjects = WithJoin<
    Tables<"stakeholders">,
    { stakeholder_projects: { project_id: string }[] }
>;
export type CaseStudyWithMetrics = WithJoin<
    Tables<"case_studies">,
    { case_study_metrics: Tables<"case_study_metrics">[] }
>;
export type DeckWithSlides = WithJoin<
    Tables<"decks">,
    { deck_slides: Tables<"deck_slides">[] } & ProjectName
>;
export type SOPWithAcknowledgments = WithJoin<
    Tables<"sops">,
    { sop_acknowledgments: { user_id: string }[] }
>;
export type TaskWithDeps = WithJoin<
    Tables<"tasks">,
    { task_dependencies: { depends_on_id: string }[] }
>;
export type ActivationWithLocation = WithJoin<Tables<"activations">, LocationName>;
export type EventWithJoins = WithJoin<Tables<"events">, LocationName & ActivationName>;
export type ProductionTaskWithJoins = WithJoin<
    Tables<"production_tasks">,
    ProfileName & VendorName & LocationName
>;
export type ProductionMilestoneWithJoins = WithJoin<
    Tables<"production_milestones">,
    ProfileName & { approvals: Tables<"approvals">[] }
>;
export type ShipmentWithJoins = WithJoin<
    Tables<"shipments">,
    VendorName & { vehicles: { name: string } | null }
>;
export type CrewShiftWithJoins = WithJoin<
    Tables<"crew_shifts">,
    { crew_members: { name: string; email: string; phone: string } | null } & LocationName &
        EventName
>;
export type IncidentWithJoins = WithJoin<Tables<"incidents">, ProfileName & LocationName>;
export type BudgetWithLines = WithJoin<
    Tables<"budgets">,
    { production_budget_lines: Tables<"production_budget_lines">[] }
>;
export type ContractWithVendor = WithJoin<Tables<"contracts">, VendorName>;
export type RFQWithProfile = WithJoin<Tables<"rfqs">, ProfileName>;
export type WarehouseWithProfile = WithJoin<Tables<"warehouses">, ProfileName>;
export type AssetAssignmentWithJoins = WithJoin<
    Tables<"asset_assignments">,
    { assets: { name: string; barcode: string } | null } & ProjectName & ProfileName
>;
export type CrewAvailabilityWithJoins = WithJoin<
    Tables<"crew_availability">,
    { crew_members: { name: string } | null } & ProjectName
>;
export type MilestoneWithApprovals = WithJoin<
    Tables<"milestones">,
    { approvals: Tables<"approvals">[] | null }
>;
export type KBArticleWithProfile = WithJoin<Tables<"knowledge_base_articles">, ProfileName>;
export type ProductionSOPWithProfile = WithJoin<Tables<"production_sops">, ProfileName>;
export type ProductionChecklistWithJoins = WithJoin<
    Tables<"production_checklists">,
    ProfileName & ProjectName & EventName
>;


// ─── Deals ───
export function useDeals() {
    return useQuery({
        queryKey: ["deals"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("deals")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as Tables<"deals">[];
        },
    });
}

export function useCreateDeal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deal: TablesInsert<"deals">) => {
            const { data, error } = await getSupabase()
                .from("deals")
                .insert(deal)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"deals">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
    });
}

export function useUpdateDeal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"deals"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("deals")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"deals">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
    });
}

// ─── Projects ───
export function useProjects() {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("projects")
                .select("*, project_members(profile_id)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as ProjectWithMembers[];
        },
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: ["projects", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("projects")
                .select("*, project_members(profile_id, profiles(name, email, avatar_url))")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as ProjectDetailWithMembers;
        },
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (project: TablesInsert<"projects">) => {
            const { data, error } = await getSupabase()
                .from("projects")
                .insert(project)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"projects">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"projects"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("projects")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"projects">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("projects").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}

// ─── Tasks ───
export function useTasks(projectId?: string) {
    return useQuery({
        queryKey: ["tasks", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("tasks")
                .select("*, task_dependencies(depends_on_id)")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as TaskWithDeps[];
        },
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (task: TablesInsert<"tasks">) => {
            const { data, error } = await getSupabase()
                .from("tasks")
                .insert(task)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"tasks">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"tasks"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("tasks")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"tasks">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("tasks").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

// ─── Crew Members ───
export function useCrewMembers() {
    return useQuery({
        queryKey: ["crew_members"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("crew_members")
                .select("*, certifications(*)")
                .order("name");
            if (error) throw error;
            return data as unknown as CrewMemberWithCerts[];
        },
    });
}

export function useCreateCrewMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (member: TablesInsert<"crew_members">) => {
            const { data, error } = await getSupabase()
                .from("crew_members")
                .insert(member)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"crew_members">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew_members"] }),
    });
}

export function useUpdateCrewMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"crew_members"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("crew_members")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"crew_members">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew_members"] }),
    });
}

// ─── Assets ───
export function useAssets() {
    return useQuery({
        queryKey: ["assets"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("assets").select("*").order("name");
            if (error) throw error;
            return data as unknown as Tables<"assets">[];
        },
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (asset: TablesInsert<"assets">) => {
            const { data, error } = await getSupabase()
                .from("assets")
                .insert(asset)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"assets">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
    });
}

export function useUpdateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"assets"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("assets")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"assets">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
    });
}

// ─── Vehicles ───
export function useVehicles() {
    return useQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("vehicles").select("*").order("name");
            if (error) throw error;
            return data as unknown as Tables<"vehicles">[];
        },
    });
}

// ─── Vendors ───
export function useVendors() {
    return useQuery({
        queryKey: ["vendors"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("vendors").select("*").order("name");
            if (error) throw error;
            return data as unknown as Tables<"vendors">[];
        },
    });
}

export function useCreateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (vendor: TablesInsert<"vendors">) => {
            const { data, error } = await getSupabase()
                .from("vendors")
                .insert(vendor)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"vendors">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"vendors"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("vendors")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"vendors">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
    });
}

export function useCreatePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (po: TablesInsert<"purchase_orders">) => {
            const { data, error } = await getSupabase()
                .from("purchase_orders")
                .insert(po)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"purchase_orders">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase_orders"] }),
    });
}

// ─── Purchase Orders ───
export function usePurchaseOrders() {
    return useQuery({
        queryKey: ["purchase_orders"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("purchase_orders")
                .select("*, vendors(name), purchase_order_items(*)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as PurchaseOrderWithJoins[];
        },
    });
}

// ─── Invoices ───
export function useInvoices() {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("invoices")
                .select("*, vendors(name), purchase_orders(total_amount)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as InvoiceWithJoins[];
        },
    });
}

// ─── Approvals ───
export function useApprovals() {
    return useQuery({
        queryKey: ["approvals"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("approvals")
                .select("*, profiles(name)")
                .order("deadline");
            if (error) throw error;
            return data as unknown as ApprovalWithProfile[];
        },
    });
}

export function useUpdateApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"approvals"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("approvals")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"approvals">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["approvals"] }),
    });
}

// ─── Stakeholders ───
export function useStakeholders() {
    return useQuery({
        queryKey: ["stakeholders"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("stakeholders")
                .select("*, stakeholder_projects(project_id)")
                .order("name");
            if (error) throw error;
            return data as unknown as StakeholderWithProjects[];
        },
    });
}

// ─── Case Studies ───
export function useCaseStudies() {
    return useQuery({
        queryKey: ["case_studies"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("case_studies")
                .select("*, case_study_metrics(*)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as CaseStudyWithMetrics[];
        },
    });
}

// ─── Notifications ───
export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);
            if (error) throw error;
            return data as unknown as Tables<"notifications">[];
        },
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase()
                .from("notifications")
                .update({ read: true })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
}

// ─── Calendar Events ───
export function useCalendarEvents(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ["calendar_events", startDate, endDate],
        queryFn: async () => {
            let query = getSupabase().from("calendar_events").select("*, projects(name)");
            if (startDate) query = query.gte("start_date", startDate);
            if (endDate) query = query.lte("end_date", endDate);
            const { data, error } = await query.order("start_date");
            if (error) throw error;
            return data as unknown as CalendarEventWithProject[];
        },
    });
}

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: TablesInsert<"calendar_events">) => {
            const { data, error } = await getSupabase()
                .from("calendar_events")
                .insert(event)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"calendar_events">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar_events"] }),
    });
}

// ─── Shifts ───
export function useShifts(projectId?: string, date?: string) {
    return useQuery({
        queryKey: ["shifts", projectId, date],
        queryFn: async () => {
            let query = getSupabase()
                .from("shifts")
                .select("*, crew_members(name, role), projects(name)");
            if (projectId) query = query.eq("project_id", projectId);
            if (date) query = query.eq("date", date);
            const { data, error } = await query.order("date").order("start_time");
            if (error) throw error;
            return data as unknown as ShiftWithJoins[];
        },
    });
}

export function useCreateShift() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (shift: TablesInsert<"shifts">) => {
            const { data, error } = await getSupabase()
                .from("shifts")
                .insert(shift)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"shifts">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] }),
    });
}

// ─── Brand Kits ───
export function useBrandKits() {
    return useQuery({
        queryKey: ["brand_kits"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("brand_kits")
                .select("*")
                .order("client_name");
            if (error) throw error;
            return data as unknown as Tables<"brand_kits">[];
        },
    });
}

// ─── Decks ───
export function useDecks(projectId?: string) {
    return useQuery({
        queryKey: ["decks", projectId],
        queryFn: async () => {
            let query = getSupabase().from("decks").select("*, deck_slides(*), projects(name)");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query.order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as DeckWithSlides[];
        },
    });
}

// ─── SOPs ───
export function useSOPs() {
    return useQuery({
        queryKey: ["sops"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("sops")
                .select("*, sop_acknowledgments(user_id)")
                .order("title");
            if (error) throw error;
            return data as unknown as SOPWithAcknowledgments[];
        },
    });
}

// ─── Vault Documents ───
export function useVaultDocuments() {
    return useQuery({
        queryKey: ["vault_documents"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("vault_documents")
                .select("*, profiles(name)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as VaultDocumentWithProfile[];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// EXTENDED HOOKS - Migration 002 tables
// Note: These hooks require the extended schema tables to exist in Supabase.
// If tables don't exist yet, these hooks will error. Run migrations first.
// ═══════════════════════════════════════════════════════════════

// ─── Time Entries ───
export function useTimeEntries(projectId?: string) {
    return useQuery({
        queryKey: ["time_entries", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("time_entries")
                .select("*, projects(name), tasks(title), crew_members(name)")
                .order("date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as TimeEntryWithJoins[];
        },
    });
}

export function useCreateTimeEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entry: TablesInsert<"time_entries">) => {
            const { data, error } = await getSupabase()
                .from("time_entries")
                .insert(entry)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"time_entries">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time_entries"] }),
    });
}

// ─── Expenses ───
export function useExpenses(projectId?: string) {
    return useQuery({
        queryKey: ["expenses", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("expenses")
                .select("*, projects(name), profiles(name)")
                .order("submitted_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ExpenseWithJoins[];
        },
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (expense: TablesInsert<"expenses">) => {
            const { data, error } = await getSupabase()
                .from("expenses")
                .insert(expense)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"expenses">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
    });
}

// ─── Budget Line Items ───
export function useBudgetLineItems(projectId: string) {
    return useQuery({
        queryKey: ["budget_line_items", projectId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("budget_line_items")
                .select("*")
                .eq("project_id", projectId)
                .order("category");
            if (error) throw error;
            return data as unknown as Tables<"budget_line_items">[];
        },
        enabled: !!projectId,
    });
}

export function useCreateBudgetLineItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: TablesInsert<"budget_line_items">) => {
            const { data, error } = await getSupabase()
                .from("budget_line_items")
                .insert(item)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"budget_line_items">;
        },
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["budget_line_items", variables.project_id],
            }),
    });
}

// ─── Milestones ───
export function useMilestones(projectId: string) {
    return useQuery({
        queryKey: ["milestones", projectId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("milestones")
                .select("*, approvals(*)")
                .eq("project_id", projectId)
                .order("due_date");
            if (error) throw error;
            return data as unknown as MilestoneWithApprovals[];
        },
        enabled: !!projectId,
    });
}

export function useCreateMilestone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (milestone: TablesInsert<"milestones">) => {
            const { data, error } = await getSupabase()
                .from("milestones")
                .insert(milestone)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"milestones">;
        },
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({ queryKey: ["milestones", variables.project_id] }),
    });
}

// ─── Comments ───
export function useComments(
    entityType: "project" | "task" | "approval" | "deal",
    entityId: string
) {
    return useQuery({
        queryKey: ["comments", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("comments")
                .select("*, profiles(name, avatar_url)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as unknown as CommentWithProfile[];
        },
        enabled: !!entityType && !!entityId,
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (comment: TablesInsert<"comments">) => {
            const { data, error } = await getSupabase()
                .from("comments")
                .insert(comment)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"comments">;
        },
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.entity_type, variables.entity_id],
            }),
    });
}

// ─── Activity Log ───
export function useActivityLog(entityType?: string, entityId?: string, limit = 20) {
    return useQuery({
        queryKey: ["activity_log", entityType, entityId],
        queryFn: async () => {
            let query = getSupabase()
                .from("activity_log")
                .select("*, profiles(name)")
                .order("created_at", { ascending: false })
                .limit(limit);
            if (entityType) query = query.eq("entity_type", entityType);
            if (entityId) query = query.eq("entity_id", entityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ActivityLogWithProfile[];
        },
    });
}

// ─── Project Templates ───
export function useProjectTemplates() {
    return useQuery({
        queryKey: ["project_templates"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("project_templates")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as unknown as Tables<"project_templates">[];
        },
    });
}

export function useCreateProjectTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: TablesInsert<"project_templates">) => {
            const { data, error } = await getSupabase()
                .from("project_templates")
                .insert(template)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"project_templates">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project_templates"] }),
    });
}

// ─── Integrations ───
export function useIntegrations() {
    return useQuery({
        queryKey: ["integrations"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("integrations")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as unknown as Tables<"integrations">[];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION LIFECYCLE HOOKS - Migration 003 tables
// ═══════════════════════════════════════════════════════════════

// ─── Locations ───
export function useLocations(projectId?: string) {
    return useQuery({
        queryKey: ["locations", projectId],
        queryFn: async () => {
            let query = getSupabase().from("locations").select("*").order("name");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as Tables<"locations">[];
        },
    });
}

export function useLocation(id: string) {
    return useQuery({
        queryKey: ["locations", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("locations")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Tables<"locations">;
        },
        enabled: !!id,
    });
}

export function useCreateLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (location: TablesInsert<"locations">) => {
            const { data, error } = await getSupabase()
                .from("locations")
                .insert(location)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"locations">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
    });
}

export function useUpdateLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"locations"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("locations")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"locations">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["locations"] });
            queryClient.invalidateQueries({ queryKey: ["locations", variables.id] });
        },
    });
}

// ─── Activations ───
export function useActivations(projectId?: string) {
    return useQuery({
        queryKey: ["activations", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("activations")
                .select("*, locations(name)")
                .order("name");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ActivationWithLocation[];
        },
    });
}

export function useCreateActivation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (activation: TablesInsert<"activations">) => {
            const { data, error } = await getSupabase()
                .from("activations")
                .insert(activation)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"activations">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activations"] }),
    });
}

// ─── Events ───
export function useEvents(projectId?: string) {
    return useQuery({
        queryKey: ["events", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("events")
                .select("*, locations(name), activations(name)")
                .order("date");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as EventWithJoins[];
        },
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: TablesInsert<"events">) => {
            const { data, error } = await getSupabase()
                .from("events")
                .insert(event)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"events">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    });
}

// ─── Production Tasks ───
export function useProductionTasks(projectId?: string, department?: string) {
    return useQuery({
        queryKey: ["production_tasks", projectId, department],
        queryFn: async () => {
            let query = getSupabase()
                .from("production_tasks")
                .select("*, profiles(name), vendors(name), locations(name)")
                .order("due_date");
            if (projectId) query = query.eq("project_id", projectId);
            if (department) query = query.eq("department", filterValue(department));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProductionTaskWithJoins[];
        },
    });
}

export function useCreateProductionTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (task: TablesInsert<"production_tasks">) => {
            const { data, error } = await getSupabase()
                .from("production_tasks")
                .insert(task)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"production_tasks">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_tasks"] }),
    });
}

export function useUpdateProductionTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"production_tasks"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("production_tasks")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"production_tasks">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_tasks"] }),
    });
}

// ─── Production Milestones ───
export function useProductionMilestones(projectId: string) {
    return useQuery({
        queryKey: ["production_milestones", projectId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("production_milestones")
                .select("*, profiles(name), approvals(*)")
                .eq("project_id", projectId)
                .order("due_date");
            if (error) throw error;
            return data as unknown as ProductionMilestoneWithJoins[];
        },
        enabled: !!projectId,
    });
}

// ─── Shipments ───
export function useShipments(projectId?: string) {
    return useQuery({
        queryKey: ["shipments", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("shipments")
                .select("*, vendors(name), vehicles(name)")
                .order("pickup_date");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ShipmentWithJoins[];
        },
    });
}

export function useCreateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (shipment: TablesInsert<"shipments">) => {
            const { data, error } = await getSupabase()
                .from("shipments")
                .insert(shipment)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"shipments">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shipments"] }),
    });
}

// ─── Crew Shifts ───
export function useCrewShifts(projectId?: string, date?: string) {
    return useQuery({
        queryKey: ["crew_shifts", projectId, date],
        queryFn: async () => {
            let query = getSupabase()
                .from("crew_shifts")
                .select("*, crew_members(name, email, phone), locations(name), events(name)")
                .order("date")
                .order("call_time");
            if (projectId) query = query.eq("project_id", projectId);
            if (date) query = query.eq("date", date);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as CrewShiftWithJoins[];
        },
    });
}

export function useCreateCrewShift() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (shift: TablesInsert<"crew_shifts">) => {
            const { data, error } = await getSupabase()
                .from("crew_shifts")
                .insert(shift)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"crew_shifts">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew_shifts"] }),
    });
}

// ─── Incidents ───
export function useIncidents(projectId?: string) {
    return useQuery({
        queryKey: ["incidents", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("incidents")
                .select("*, profiles(name), locations(name)")
                .order("occurred_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as IncidentWithJoins[];
        },
    });
}

export function useCreateIncident() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (incident: TablesInsert<"incidents">) => {
            const { data, error } = await getSupabase()
                .from("incidents")
                .insert(incident)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"incidents">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] }),
    });
}

// ─── Budgets ───
export function useBudgets(projectId: string) {
    return useQuery({
        queryKey: ["budgets", projectId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("budgets")
                .select("*, production_budget_lines(*)")
                .eq("project_id", projectId)
                .order("version", { ascending: false });
            if (error) throw error;
            return data as unknown as BudgetWithLines[];
        },
        enabled: !!projectId,
    });
}

export function useCreateBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (budget: TablesInsert<"budgets">) => {
            const { data, error } = await getSupabase()
                .from("budgets")
                .insert(budget)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"budgets">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    });
}

// ─── Contracts ───
export function useCreateContract() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (contract: TablesInsert<"contracts">) => {
            const { data, error } = await getSupabase()
                .from("contracts")
                .insert(contract)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"contracts">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
    });
}

export function useContracts(projectId?: string) {
    return useQuery({
        queryKey: ["contracts", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("contracts")
                .select("*, vendors(name)")
                .order("effective_date");
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ContractWithVendor[];
        },
    });
}

// ─── RFQs ───
export function useRFQs(projectId?: string) {
    return useQuery({
        queryKey: ["rfqs", projectId],
        queryFn: async () => {
            let query = getSupabase()
                .from("rfqs")
                .select("*, profiles(name)")
                .order("issue_date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as RFQWithProfile[];
        },
    });
}

// ─── Warehouses ───
export function useWarehouses() {
    return useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("warehouses")
                .select("*, profiles(name)")
                .order("name");
            if (error) throw error;
            return data as unknown as WarehouseWithProfile[];
        },
    });
}

// ─── Asset Assignments ───
export function useAssetAssignments(projectId?: string, assetId?: string) {
    return useQuery({
        queryKey: ["asset_assignments", projectId, assetId],
        queryFn: async () => {
            let query = getSupabase()
                .from("asset_assignments")
                .select("*, assets(name, barcode), projects(name), profiles(name)")
                .order("check_out_date", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            if (assetId) query = query.eq("asset_id", assetId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as AssetAssignmentWithJoins[];
        },
    });
}

export function useCreateAssetAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (assignment: TablesInsert<"asset_assignments">) => {
            const { data, error } = await getSupabase()
                .from("asset_assignments")
                .insert(assignment)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"asset_assignments">;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["asset_assignments"] });
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
    });
}

// ─── Crew Availability ───
export function useCrewAvailability(crewMemberId?: string, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ["crew_availability", crewMemberId, startDate, endDate],
        queryFn: async () => {
            let query = getSupabase()
                .from("crew_availability")
                .select("*, crew_members(name), projects(name)")
                .order("date");
            if (crewMemberId) query = query.eq("crew_member_id", crewMemberId);
            if (startDate) query = query.gte("date", startDate);
            if (endDate) query = query.lte("date", endDate);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as CrewAvailabilityWithJoins[];
        },
    });
}

// ─── Knowledge Base ───
export function useKnowledgeBaseArticles(category?: string, department?: string) {
    return useQuery({
        queryKey: ["knowledge_base_articles", category, department],
        queryFn: async () => {
            let query = getSupabase()
                .from("knowledge_base_articles")
                .select("*, profiles(name)")
                .eq("status", "published")
                .order("title");
            if (category) query = query.eq("category", filterValue(category));
            if (department) query = query.eq("department", filterValue(department));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as KBArticleWithProfile[];
        },
    });
}

export function useCreateKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (article: TablesInsert<"knowledge_base_articles">) => {
            const { data, error } = await getSupabase()
                .from("knowledge_base_articles")
                .insert(article)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"knowledge_base_articles">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledge_base_articles"] }),
    });
}

// ─── Production SOPs ───
export function useProductionSOPs(department?: string) {
    return useQuery({
        queryKey: ["production_sops", department],
        queryFn: async () => {
            let query = getSupabase()
                .from("production_sops")
                .select("*, profiles(name)")
                .eq("status", "active")
                .order("number");
            if (department) query = query.eq("department", filterValue(department));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProductionSOPWithProfile[];
        },
    });
}

// ─── Production Checklists ───
export function useProductionChecklists(projectId?: string, eventId?: string) {
    return useQuery({
        queryKey: ["production_checklists", projectId, eventId],
        queryFn: async () => {
            let query = getSupabase()
                .from("production_checklists")
                .select("*, profiles(name), projects(name), events(name)")
                .order("due_date");
            if (projectId) query = query.eq("project_id", projectId);
            if (eventId) query = query.eq("event_id", eventId);
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProductionChecklistWithJoins[];
        },
    });
}
