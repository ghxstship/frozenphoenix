"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import { getSupabase } from "./client";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

// ─── Join-aware return types ───
// Supabase's .select("*, foreign(col)") narrows the inferred type.
// These explicit types ensure consumers get the full base row + joined fields.
type WithJoin<T, J extends Record<string, unknown>> = T & J;

type ProfileName = { user_profiles: { display_name: string } | null };
type ProfileNameAvatar = {
    user_profiles: { display_name: string; avatar_url: string | null } | null;
};
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
type CompanyName = { companies: { name: string } | null };
export type ProjectWithMembers = WithJoin<
    Tables<"projects">,
    { project_members: { profile_id: string }[] } & CompanyName
>;
export type ProjectDetailWithMembers = WithJoin<
    Tables<"projects">,
    {
        project_members: {
            profile_id: string;
            user_profiles: {
                display_name: string;
                email: string;
                avatar_url: string | null;
            } | null;
        }[];
    } & CompanyName
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
export type KBArticleWithProfile = WithJoin<Tables<"knowledge_articles">, ProfileName>;
export type ProductionSOPWithProfile = WithJoin<Tables<"production_sops">, ProfileName>;
export type ProductionChecklistWithJoins = WithJoin<
    Tables<"production_checklists">,
    ProfileName & ProjectName & EventName
>;
// ═══════════════════════════════════════════════════════════════
// CORE HOOKS - Migration 001 tables
// All hooks use API routes for RBAC, validation & audit logging.
// ═══════════════════════════════════════════════════════════════

// ─── Deals ───
export function useDeals() {
    return useQuery({
        queryKey: ["deals"],
        queryFn: async () => {
            const res = await apiList<Tables<"deals">>("/api/deals", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreateDeal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deal: TablesInsert<"deals">) =>
            apiCreate<Tables<"deals">>("/api/deals", deal as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
    });
}

export function useUpdateDeal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"deals"> & { id: string }) =>
            apiUpdate<Tables<"deals">>("/api/deals", id, updates as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
    });
}

// ─── Projects ───
export function useProjects() {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await apiList<ProjectWithMembers>("/api/projects", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: ["projects", id],
        queryFn: async () => apiGet<ProjectDetailWithMembers>("/api/projects", id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (project: TablesInsert<"projects">) =>
            apiCreate<Tables<"projects">>("/api/projects", project as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"projects"> & { id: string }) =>
            apiUpdate<Tables<"projects">>("/api/projects", id, updates as Record<string, unknown>),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => apiDelete("/api/projects", id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}

// ─── Tasks ───
export function useTasks(projectId?: string) {
    return useQuery({
        queryKey: ["tasks", projectId],
        queryFn: async () => {
            const res = await apiList<TaskWithDeps>("/api/tasks", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (task: TablesInsert<"tasks">) =>
            apiCreate<Tables<"tasks">>("/api/tasks", task as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"tasks"> & { id: string }) =>
            apiUpdate<Tables<"tasks">>("/api/tasks", id, updates as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });
}

// ─── User-Scoped Task Hooks (Home module) ───
export function useMyTasks() {
    return useQuery({
        queryKey: ["my-tasks"],
        queryFn: async () => {
            const {
                data: { user },
            } = await getSupabase().auth.getUser();
            if (!user) return [];
            const res = await apiList<TaskWithDeps & { projects: { name: string } | null }>(
                "/api/tasks",
                { assignee_id: user.id, sort_by: "due_date", sort_order: "asc" }
            );
            return res.data;
        },
    });
}

export function useMyTaskCounts() {
    return useQuery({
        queryKey: ["my-task-counts"],
        queryFn: async () => {
            const res = await fetch("/api/tasks/counts");
            if (!res.ok)
                return { total: 0, overdue: 0, dueToday: 0, dueThisWeek: 0, inProgress: 0 };
            return res.json() as Promise<{
                total: number;
                overdue: number;
                dueToday: number;
                dueThisWeek: number;
                inProgress: number;
            }>;
        },
    });
}

// ─── Crew Members ───
export function useCrewMembers() {
    return useQuery({
        queryKey: ["crew_members"],
        queryFn: async () => {
            const res = await apiList<CrewMemberWithCerts>("/api/crew", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateCrewMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (member: TablesInsert<"crew_members">) =>
            apiCreate<Tables<"crew_members">>("/api/crew", member as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew_members"] }),
    });
}

export function useUpdateCrewMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"crew_members"> & { id: string }) =>
            apiUpdate<Tables<"crew_members">>("/api/crew", id, updates as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew_members"] }),
    });
}

// ─── Assets ───
export function useAssets() {
    return useQuery({
        queryKey: ["assets"],
        queryFn: async () => {
            const res = await apiList<Tables<"assets">>("/api/assets", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (asset: TablesInsert<"assets">) =>
            apiCreate<Tables<"assets">>("/api/assets", asset as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
    });
}

export function useUpdateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"assets"> & { id: string }) =>
            apiUpdate<Tables<"assets">>("/api/assets", id, updates as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
    });
}

// ─── Vehicles ───
export function useVehicles() {
    return useQuery({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const res = await apiList<Tables<"vehicles">>("/api/fleet", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Vendors ───
export function useVendors() {
    return useQuery({
        queryKey: ["vendors"],
        queryFn: async () => {
            const res = await apiList<Tables<"vendors">>("/api/vendors", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (vendor: TablesInsert<"vendors">) =>
            apiCreate<Tables<"vendors">>("/api/vendors", vendor as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"vendors"> & { id: string }) =>
            apiUpdate<Tables<"vendors">>("/api/vendors", id, updates as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
    });
}

// ─── Purchase Orders ───
export function usePurchaseOrders() {
    return useQuery({
        queryKey: ["purchase_orders"],
        queryFn: async () => {
            const res = await apiList<PurchaseOrderWithJoins>("/api/purchase-orders", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreatePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (po: TablesInsert<"purchase_orders">) =>
            apiCreate<Tables<"purchase_orders">>(
                "/api/purchase-orders",
                po as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase_orders"] }),
    });
}

// ─── Invoices ───
export function useInvoices() {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const res = await apiList<InvoiceWithJoins>("/api/invoices", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ─── Approvals ───
export function useApprovals() {
    return useQuery({
        queryKey: ["approvals"],
        queryFn: async () => {
            const res = await apiList<ApprovalWithProfile>("/api/approvals", {
                sort_by: "deadline",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useUpdateApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"approvals"> & { id: string }) =>
            apiUpdate<Tables<"approvals">>(
                "/api/approvals",
                id,
                updates as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["approvals"] }),
    });
}

// ─── Stakeholders ───
export function useStakeholders() {
    return useQuery({
        queryKey: ["stakeholders"],
        queryFn: async () => {
            const res = await apiList<StakeholderWithProjects>("/api/stakeholders", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Case Studies ───
export function useCaseStudies() {
    return useQuery({
        queryKey: ["case_studies"],
        queryFn: async () => {
            const res = await apiList<CaseStudyWithMetrics>("/api/case-studies", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ─── Notifications ───
export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await apiList<Tables<"notifications">>("/api/notifications", {
                sort_by: "created_at",
                sort_order: "desc",
                per_page: 20,
            });
            return res.data;
        },
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) =>
            apiUpdate<Tables<"notifications">>("/api/notifications", id, { read: true }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
}

// ─── Calendar Events ───
export function useCalendarEvents(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ["calendar_events", startDate, endDate],
        queryFn: async () => {
            const res = await apiList<CalendarEventWithProject>("/api/calendar-events", {
                start_date: startDate,
                end_date: endDate,
                sort_by: "start_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: TablesInsert<"calendar_events">) =>
            apiCreate<Tables<"calendar_events">>(
                "/api/calendar-events",
                event as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar_events"] }),
    });
}

// ─── Shifts ───
export function useShifts(projectId?: string, date?: string) {
    return useQuery({
        queryKey: ["shifts", projectId, date],
        queryFn: async () => {
            const res = await apiList<ShiftWithJoins>("/api/shifts", {
                project_id: projectId,
                date,
                sort_by: "date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateShift() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (shift: TablesInsert<"shifts">) =>
            apiCreate<Tables<"shifts">>("/api/shifts", shift as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shifts"] }),
    });
}

// ─── Brand Kits ───
export function useBrandKits() {
    return useQuery({
        queryKey: ["brand_kits"],
        queryFn: async () => {
            const res = await apiList<Tables<"brand_kits">>("/api/brand-kits", {
                sort_by: "client_name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Decks ───
export function useDecks(projectId?: string) {
    return useQuery({
        queryKey: ["decks", projectId],
        queryFn: async () => {
            const res = await apiList<DeckWithSlides>("/api/decks", {
                project_id: projectId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ─── SOPs ───
export function useSOPs() {
    return useQuery({
        queryKey: ["sops"],
        queryFn: async () => {
            const res = await apiList<SOPWithAcknowledgments>("/api/sops", {
                sort_by: "title",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Vault Documents ───
export function useVaultDocuments() {
    return useQuery({
        queryKey: ["vault_documents"],
        queryFn: async () => {
            const res = await apiList<VaultDocumentWithProfile>("/api/vault-documents", {
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// EXTENDED HOOKS - Migration 002 tables
// ═══════════════════════════════════════════════════════════════

// ─── Time Entries ───
export function useTimeEntries(projectId?: string) {
    return useQuery({
        queryKey: ["time_entries", projectId],
        queryFn: async () => {
            const res = await apiList<TimeEntryWithJoins>("/api/time-entries", {
                project_id: projectId,
                sort_by: "date",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreateTimeEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entry: TablesInsert<"time_entries">) =>
            apiCreate<Tables<"time_entries">>(
                "/api/time-entries",
                entry as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time_entries"] }),
    });
}

// ─── Expenses ───
export function useExpenses(projectId?: string) {
    return useQuery({
        queryKey: ["expenses", projectId],
        queryFn: async () => {
            const res = await apiList<ExpenseWithJoins>("/api/expenses", {
                project_id: projectId,
                sort_by: "submitted_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (expense: TablesInsert<"expenses">) =>
            apiCreate<Tables<"expenses">>("/api/expenses", expense as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
    });
}

// ─── Budget Line Items ───
export function useBudgetLineItems(projectId: string) {
    return useQuery({
        queryKey: ["budget_line_items", projectId],
        queryFn: async () => {
            const res = await apiList<Tables<"budget_line_items">>("/api/budget-line-items", {
                project_id: projectId,
                sort_by: "category",
                sort_order: "asc",
            });
            return res.data;
        },
        enabled: !!projectId,
    });
}

export function useCreateBudgetLineItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: TablesInsert<"budget_line_items">) =>
            apiCreate<Tables<"budget_line_items">>(
                "/api/budget-line-items",
                item as Record<string, unknown>
            ),
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
            const res = await apiList<MilestoneWithApprovals>("/api/milestones", {
                project_id: projectId,
                sort_by: "due_date",
                sort_order: "asc",
            });
            return res.data;
        },
        enabled: !!projectId,
    });
}

export function useCreateMilestone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (milestone: TablesInsert<"milestones">) =>
            apiCreate<Tables<"milestones">>(
                "/api/milestones",
                milestone as Record<string, unknown>
            ),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({ queryKey: ["milestones", variables.project_id] }),
    });
}

// ─── Comments ───
/** @deprecated Use useEntityMessages from hooks-messaging.ts when messaging_enabled flag is on. Legacy fallback only. */
export function useComments(
    entityType: "project" | "task" | "approval" | "deal",
    entityId: string
) {
    return useQuery({
        queryKey: ["comments", entityType, entityId],
        queryFn: async () => {
            const res = await apiList<CommentWithProfile>("/api/comments", {
                entity_type: entityType,
                entity_id: entityId,
                sort_by: "created_at",
                sort_order: "desc",
            });
            return res.data;
        },
        enabled: !!entityType && !!entityId,
    });
}

/** @deprecated Use useSendMessage from hooks-messaging.ts when messaging_enabled flag is on. Legacy fallback only. */
export function useCreateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (comment: TablesInsert<"comments">) =>
            apiCreate<Tables<"comments">>("/api/comments", comment as Record<string, unknown>),
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
            const res = await apiList<ActivityLogWithProfile>("/api/activity-log", {
                entity_type: entityType,
                entity_id: entityId,
                sort_by: "created_at",
                sort_order: "desc",
                per_page: limit,
            });
            return res.data;
        },
    });
}

// ─── Project Templates ───
export function useProjectTemplates() {
    return useQuery({
        queryKey: ["project_templates"],
        queryFn: async () => {
            const res = await apiList<Tables<"project_templates">>("/api/project-templates", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateProjectTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: TablesInsert<"project_templates">) =>
            apiCreate<Tables<"project_templates">>(
                "/api/project-templates",
                template as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project_templates"] }),
    });
}

// ─── Integrations ───
export function useIntegrations() {
    return useQuery({
        queryKey: ["integrations"],
        queryFn: async () => {
            const res = await apiList<Tables<"integrations">>("/api/integrations", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
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
            const res = await apiList<Tables<"locations">>("/api/locations", {
                project_id: projectId,
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useLocation(id: string) {
    return useQuery({
        queryKey: ["locations", id],
        queryFn: async () => apiGet<Tables<"locations">>("/api/locations", id),
        enabled: !!id,
    });
}

export function useCreateLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (location: TablesInsert<"locations">) =>
            apiCreate<Tables<"locations">>("/api/locations", location as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
    });
}

export function useUpdateLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"locations"> & { id: string }) =>
            apiUpdate<Tables<"locations">>(
                "/api/locations",
                id,
                updates as Record<string, unknown>
            ),
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
            const res = await apiList<ActivationWithLocation>("/api/activations", {
                project_id: projectId,
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateActivation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (activation: TablesInsert<"activations">) =>
            apiCreate<Tables<"activations">>(
                "/api/activations",
                activation as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activations"] }),
    });
}

// ─── Events ───
export function useEvents(projectId?: string) {
    return useQuery({
        queryKey: ["events", projectId],
        queryFn: async () => {
            const res = await apiList<EventWithJoins>("/api/events", {
                project_id: projectId,
                sort_by: "date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: TablesInsert<"events">) =>
            apiCreate<Tables<"events">>("/api/events", event as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
    });
}

// ─── Production Tasks ───
export function useProductionTasks(projectId?: string, department?: string) {
    return useQuery({
        queryKey: ["production_tasks", projectId, department],
        queryFn: async () => {
            const res = await apiList<ProductionTaskWithJoins>("/api/production-tasks", {
                project_id: projectId,
                department,
                sort_by: "due_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateProductionTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (task: TablesInsert<"production_tasks">) =>
            apiCreate<Tables<"production_tasks">>(
                "/api/production-tasks",
                task as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_tasks"] }),
    });
}

export function useUpdateProductionTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"production_tasks"> & { id: string }) =>
            apiUpdate<Tables<"production_tasks">>(
                "/api/production-tasks",
                id,
                updates as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["production_tasks"] }),
    });
}

// ─── Production Milestones ───
export function useProductionMilestones(projectId: string) {
    return useQuery({
        queryKey: ["production_milestones", projectId],
        queryFn: async () => {
            const res = await apiList<ProductionMilestoneWithJoins>("/api/production-milestones", {
                project_id: projectId,
                sort_by: "due_date",
                sort_order: "asc",
            });
            return res.data;
        },
        enabled: !!projectId,
    });
}

// ─── Shipments ───
export function useShipments(projectId?: string) {
    return useQuery({
        queryKey: ["shipments", projectId],
        queryFn: async () => {
            const res = await apiList<ShipmentWithJoins>("/api/shipments", {
                project_id: projectId,
                sort_by: "pickup_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (shipment: TablesInsert<"shipments">) =>
            apiCreate<Tables<"shipments">>("/api/shipments", shipment as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shipments"] }),
    });
}

// ─── Crew Shifts ───
export function useCrewShifts(projectId?: string, date?: string) {
    return useQuery({
        queryKey: ["crew_shifts", projectId, date],
        queryFn: async () => {
            const res = await apiList<CrewShiftWithJoins>("/api/crew-shifts", {
                project_id: projectId,
                date,
                sort_by: "date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateCrewShift() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (shift: TablesInsert<"crew_shifts">) =>
            apiCreate<Tables<"crew_shifts">>("/api/crew-shifts", shift as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew_shifts"] }),
    });
}

// ─── Incidents ───
export function useIncidents(projectId?: string) {
    return useQuery({
        queryKey: ["incidents", projectId],
        queryFn: async () => {
            const res = await apiList<IncidentWithJoins>("/api/incidents", {
                project_id: projectId,
                sort_by: "occurred_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreateIncident() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (incident: TablesInsert<"incidents">) =>
            apiCreate<Tables<"incidents">>("/api/incidents", incident as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] }),
    });
}

// ─── Budgets ───
export function useBudgets(projectId: string) {
    return useQuery({
        queryKey: ["budgets", projectId],
        queryFn: async () => {
            const res = await apiList<BudgetWithLines>("/api/budgets", {
                project_id: projectId,
                sort_by: "version",
                sort_order: "desc",
            });
            return res.data;
        },
        enabled: !!projectId,
    });
}

export function useCreateBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (budget: TablesInsert<"budgets">) =>
            apiCreate<Tables<"budgets">>("/api/budgets", budget as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    });
}

// ─── Contracts ───
export function useContracts(projectId?: string) {
    return useQuery({
        queryKey: ["contracts", projectId],
        queryFn: async () => {
            const res = await apiList<ContractWithVendor>("/api/contracts", {
                project_id: projectId,
                sort_by: "effective_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateContract() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (contract: TablesInsert<"contracts">) =>
            apiCreate<Tables<"contracts">>("/api/contracts", contract as Record<string, unknown>),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
    });
}

// ─── RFQs ───
export function useRFQs(projectId?: string) {
    return useQuery({
        queryKey: ["rfqs", projectId],
        queryFn: async () => {
            const res = await apiList<RFQWithProfile>("/api/rfqs", {
                project_id: projectId,
                sort_by: "issue_date",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ─── Warehouses ───
export function useWarehouses() {
    return useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const res = await apiList<WarehouseWithProfile>("/api/warehouses", {
                sort_by: "name",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Asset Assignments ───
export function useAssetAssignments(projectId?: string, assetId?: string) {
    return useQuery({
        queryKey: ["asset_assignments", projectId, assetId],
        queryFn: async () => {
            const res = await apiList<AssetAssignmentWithJoins>("/api/asset-assignments", {
                project_id: projectId,
                asset_id: assetId,
                sort_by: "check_out_date",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

export function useCreateAssetAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (assignment: TablesInsert<"asset_assignments">) =>
            apiCreate<Tables<"asset_assignments">>(
                "/api/asset-assignments",
                assignment as Record<string, unknown>
            ),
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
            const res = await apiList<CrewAvailabilityWithJoins>("/api/crew-availability", {
                crew_member_id: crewMemberId,
                start_date: startDate,
                end_date: endDate,
                sort_by: "date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Knowledge Base ───
export function useKnowledgeBaseArticles(category?: string, department?: string) {
    return useQuery({
        queryKey: ["knowledge_base_articles", category, department],
        queryFn: async () => {
            const res = await apiList<KBArticleWithProfile>("/api/knowledge-base", {
                status: "published",
                category,
                department,
                sort_by: "title",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

export function useCreateKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (article: TablesInsert<"knowledge_articles">) =>
            apiCreate<Tables<"knowledge_articles">>(
                "/api/knowledge-base",
                article as Record<string, unknown>
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledge_base_articles"] }),
    });
}

// ─── Production SOPs ───
export function useProductionSOPs(department?: string) {
    return useQuery({
        queryKey: ["production_sops", department],
        queryFn: async () => {
            const res = await apiList<ProductionSOPWithProfile>("/api/production-sops", {
                status: "active",
                department,
                sort_by: "number",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}

// ─── Production Checklists ───
export function useProductionChecklists(projectId?: string, eventId?: string) {
    return useQuery({
        queryKey: ["production_checklists", projectId, eventId],
        queryFn: async () => {
            const res = await apiList<ProductionChecklistWithJoins>("/api/production-checklists", {
                project_id: projectId,
                event_id: eventId,
                sort_by: "due_date",
                sort_order: "asc",
            });
            return res.data;
        },
    });
}
