"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterValue, getSupabase } from "./client";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

// ─── Join-aware return types ───
type WithJoin<T, J extends Record<string, unknown>> = T & J;

type ProfileName = { profiles: { name: string } | null };
type CompanyName = { companies: { name: string } | null };
type ContactName = { contacts: { full_name: string } | null };
type ProjectName = { projects: { name: string } | null };
type PipelineName = { pipelines: { name: string } | null };

export type CompanyWithManager = WithJoin<Tables<"companies">, ProfileName>;
export type ContactWithCompany = WithJoin<Tables<"contacts">, CompanyName>;
export type ProposalWithJoins = WithJoin<
    Tables<"proposals">,
    CompanyName & ContactName & { deals: { title: string } | null }
>;
export type ResourceBookingWithJoins = WithJoin<
    Tables<"resource_bookings">,
    ProjectName & { crew_members: { name: string } | null }
>;
export type TimeOffRequestWithJoins = WithJoin<
    Tables<"time_off_requests">,
    { crew_members: { name: string } | null } & ProfileName
>;
export type DashboardWithOwner = WithJoin<Tables<"dashboards">, ProfileName>;
export type DocumentWithOwner = WithJoin<Tables<"documents">, ProfileName & ProjectName>;
export type RateCardWithCompany = WithJoin<Tables<"rate_cards">, CompanyName>;
export type AutomationWithProject = WithJoin<Tables<"automations">, ProjectName>;
export type SavedViewWithOwner = WithJoin<Tables<"saved_views">, ProfileName>;
export type CustomField = Tables<"custom_fields">;
export type RecurringInvoiceWithCompany = WithJoin<
    Tables<"recurring_invoices">,
    CompanyName & ProjectName
>;
export type PaymentWithInvoice = WithJoin<
    Tables<"payments">,
    { invoices: { amount: number; status: string } | null }
>;
export type DealWithPipeline = WithJoin<Tables<"deals">, PipelineName & CompanyName & ContactName>;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: COMPANIES
// ═══════════════════════════════════════════════════════════════════════════

export function useCompanies() {
    return useQuery({
        queryKey: ["companies"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("companies")
                .select("*, profiles:account_manager_id(name)")
                .order("name", { ascending: true });
            if (error) throw error;
            return data as unknown as CompanyWithManager[];
        },
    });
}

export function useCompany(id: string) {
    return useQuery({
        queryKey: ["companies", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("companies")
                .select("*, profiles:account_manager_id(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as CompanyWithManager;
        },
        enabled: !!id,
    });
}

export function useCreateCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (company: TablesInsert<"companies">) => {
            const { data, error } = await getSupabase()
                .from("companies")
                .insert(company)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"companies">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
    });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"companies"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("companies")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"companies">;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            queryClient.invalidateQueries({ queryKey: ["companies", id] });
        },
    });
}

export function useDeleteCompany() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("companies").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: CONTACTS
// ═══════════════════════════════════════════════════════════════════════════

export function useContacts(companyId?: string) {
    return useQuery({
        queryKey: ["contacts", { companyId }],
        queryFn: async () => {
            let query = getSupabase()
                .from("contacts")
                .select("*, companies(name)")
                .order("full_name", { ascending: true });

            if (companyId) {
                query = query.eq("company_id", companyId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ContactWithCompany[];
        },
    });
}

export function useContact(id: string) {
    return useQuery({
        queryKey: ["contacts", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("contacts")
                .select("*, companies(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as ContactWithCompany;
        },
        enabled: !!id,
    });
}

export function useCreateContact() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (contact: TablesInsert<"contacts">) => {
            const { data, error } = await getSupabase()
                .from("contacts")
                .insert(contact)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"contacts">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
    });
}

export function useUpdateContact() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"contacts"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("contacts")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"contacts">;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            queryClient.invalidateQueries({ queryKey: ["contacts", id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: PIPELINES
// ═══════════════════════════════════════════════════════════════════════════

export function usePipelines() {
    return useQuery({
        queryKey: ["pipelines"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("pipelines")
                .select("*")
                .order("name", { ascending: true });
            if (error) throw error;
            return data as unknown as Tables<"pipelines">[];
        },
    });
}

export function useCreatePipeline() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (pipeline: TablesInsert<"pipelines">) => {
            const { data, error } = await getSupabase()
                .from("pipelines")
                .insert(pipeline)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"pipelines">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pipelines"] }),
    });
}

export function useUpdatePipeline() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"pipelines"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("pipelines")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"pipelines">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pipelines"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: CUSTOM FIELDS
// ═══════════════════════════════════════════════════════════════════════════

export function useCustomFields(entityType?: string) {
    return useQuery({
        queryKey: ["custom_fields", { entityType }],
        queryFn: async () => {
            let query = getSupabase()
                .from("custom_fields")
                .select("*")
                .order("display_order", { ascending: true });

            if (entityType) {
                query = query.eq("entity_type", filterValue(entityType));
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as Tables<"custom_fields">[];
        },
    });
}

export function useCustomFieldValues(entityId: string) {
    return useQuery({
        queryKey: ["custom_field_values", entityId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("custom_field_values")
                .select("*, custom_fields(*)")
                .eq("entity_id", entityId);
            if (error) throw error;
            return data as unknown as (Tables<"custom_field_values"> & {
                custom_fields: Tables<"custom_fields">;
            })[];
        },
        enabled: !!entityId,
    });
}

export function useCreateCustomField() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (field: TablesInsert<"custom_fields">) => {
            const { data, error } = await getSupabase()
                .from("custom_fields")
                .insert(field)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"custom_fields">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["custom_fields"] }),
    });
}

export function useUpsertCustomFieldValue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (value: TablesInsert<"custom_field_values">) => {
            const { data, error } = await getSupabase()
                .from("custom_field_values")
                .upsert(value, { onConflict: "custom_field_id,entity_id" })
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"custom_field_values">;
        },
        onSuccess: (_, { entity_id }) => {
            queryClient.invalidateQueries({ queryKey: ["custom_field_values", entity_id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: SAVED VIEWS
// ═══════════════════════════════════════════════════════════════════════════

export function useSavedViews(entityType?: string, projectId?: string) {
    return useQuery({
        queryKey: ["saved_views", { entityType, projectId }],
        queryFn: async () => {
            let query = getSupabase()
                .from("saved_views")
                .select("*, profiles:owner_id(name)")
                .order("name", { ascending: true });

            if (entityType) {
                query = query.eq("entity_type", filterValue(entityType));
            }
            if (projectId) {
                query = query.eq("project_id", projectId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as SavedViewWithOwner[];
        },
    });
}

export function useCreateSavedView() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (view: TablesInsert<"saved_views">) => {
            const { data, error } = await getSupabase()
                .from("saved_views")
                .insert(view)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"saved_views">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_views"] }),
    });
}

export function useUpdateSavedView() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"saved_views"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("saved_views")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"saved_views">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_views"] }),
    });
}

export function useDeleteSavedView() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("saved_views").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_views"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: AUTOMATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function useAutomations(entityType?: string) {
    return useQuery({
        queryKey: ["automations", { entityType }],
        queryFn: async () => {
            let query = getSupabase()
                .from("automations")
                .select("*, projects(name)")
                .order("name", { ascending: true });

            if (entityType) {
                query = query.eq("entity_type", filterValue(entityType));
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as AutomationWithProject[];
        },
    });
}

export function useAutomationWithRules(id: string) {
    return useQuery({
        queryKey: ["automations", id, "rules"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("automations")
                .select("*, automation_rules(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Tables<"automations"> & {
                automation_rules: Tables<"automation_rules">[];
            };
        },
        enabled: !!id,
    });
}

export function useCreateAutomation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (automation: TablesInsert<"automations">) => {
            const { data, error } = await getSupabase()
                .from("automations")
                .insert(automation)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"automations">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automations"] }),
    });
}

export function useCreateAutomationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (rule: TablesInsert<"automation_rules">) => {
            const { data, error } = await getSupabase()
                .from("automation_rules")
                .insert(rule)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"automation_rules">;
        },
        onSuccess: (_, { automation_id }) => {
            queryClient.invalidateQueries({ queryKey: ["automations", automation_id, "rules"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: RATE CARDS
// ═══════════════════════════════════════════════════════════════════════════

export function useRateCards() {
    return useQuery({
        queryKey: ["rate_cards"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("rate_cards")
                .select("*, companies(name)")
                .order("name", { ascending: true });
            if (error) throw error;
            return data as unknown as RateCardWithCompany[];
        },
    });
}

export function useRateCardWithItems(id: string) {
    return useQuery({
        queryKey: ["rate_cards", id, "items"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("rate_cards")
                .select("*, rate_card_items(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Tables<"rate_cards"> & {
                rate_card_items: Tables<"rate_card_items">[];
            };
        },
        enabled: !!id,
    });
}

export function useCreateRateCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (rateCard: TablesInsert<"rate_cards">) => {
            const { data, error } = await getSupabase()
                .from("rate_cards")
                .insert(rateCard)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"rate_cards">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rate_cards"] }),
    });
}

export function useCreateRateCardItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: TablesInsert<"rate_card_items">) => {
            const { data, error } = await getSupabase()
                .from("rate_card_items")
                .insert(item)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"rate_card_items">;
        },
        onSuccess: (_, { rate_card_id }) => {
            queryClient.invalidateQueries({ queryKey: ["rate_cards", rate_card_id, "items"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: RESOURCE BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════

export function useResourceBookings(filters?: {
    projectId?: string;
    crewMemberId?: string;
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: ["resource_bookings", filters],
        queryFn: async () => {
            let query = getSupabase()
                .from("resource_bookings")
                .select("*, projects(name), crew_members(name)")
                .order("start_date", { ascending: true });

            if (filters?.projectId) {
                query = query.eq("project_id", filters.projectId);
            }
            if (filters?.crewMemberId) {
                query = query.eq("crew_member_id", filters.crewMemberId);
            }
            if (filters?.startDate) {
                query = query.gte("end_date", filters.startDate);
            }
            if (filters?.endDate) {
                query = query.lte("start_date", filters.endDate);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ResourceBookingWithJoins[];
        },
    });
}

export function useCreateResourceBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (booking: TablesInsert<"resource_bookings">) => {
            const { data, error } = await getSupabase()
                .from("resource_bookings")
                .insert(booking)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"resource_bookings">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource_bookings"] }),
    });
}

export function useUpdateResourceBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"resource_bookings"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("resource_bookings")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"resource_bookings">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource_bookings"] }),
    });
}

export function useDeleteResourceBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await getSupabase().from("resource_bookings").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource_bookings"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9: TIME OFF REQUESTS
// ═══════════════════════════════════════════════════════════════════════════

export function useTimeOffRequests(status?: string) {
    return useQuery({
        queryKey: ["time_off_requests", { status }],
        queryFn: async () => {
            let query = getSupabase()
                .from("time_off_requests")
                .select("*, crew_members(name), profiles:approver_id(name)")
                .order("start_date", { ascending: false });

            if (status) {
                query = query.eq("status", filterValue(status));
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as TimeOffRequestWithJoins[];
        },
    });
}

export function useCreateTimeOffRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: TablesInsert<"time_off_requests">) => {
            const { data, error } = await getSupabase()
                .from("time_off_requests")
                .insert(request)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"time_off_requests">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time_off_requests"] }),
    });
}

export function useApproveTimeOffRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, approverId }: { id: string; approverId: string }) => {
            const { data, error } = await getSupabase()
                .from("time_off_requests")
                .update({
                    status: "approved",
                    approver_id: approverId,
                    approved_at: new Date().toISOString(),
                })
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"time_off_requests">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time_off_requests"] }),
    });
}

export function useRejectTimeOffRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            approverId,
            reason,
        }: {
            id: string;
            approverId: string;
            reason: string;
        }) => {
            const { data, error } = await getSupabase()
                .from("time_off_requests")
                .update({ status: "rejected", approver_id: approverId, rejection_reason: reason })
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"time_off_requests">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time_off_requests"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10: ACTIVE TIMERS
// ═══════════════════════════════════════════════════════════════════════════

export function useActiveTimer(userId: string) {
    return useQuery({
        queryKey: ["active_timers", userId],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("active_timers")
                .select("*, projects(name), production_tasks(title)")
                .eq("user_id", userId)
                .maybeSingle();
            if (error) throw error;
            return data as unknown as
                | (Tables<"active_timers"> & {
                      projects: { name: string } | null;
                      production_tasks: { title: string } | null;
                  })
                | null;
        },
        enabled: !!userId,
    });
}

export function useStartTimer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (timer: TablesInsert<"active_timers">) => {
            const { data, error } = await getSupabase()
                .from("active_timers")
                .insert(timer)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"active_timers">;
        },
        onSuccess: (_, { user_id }) =>
            queryClient.invalidateQueries({ queryKey: ["active_timers", user_id] }),
    });
}

export function useStopTimer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const { data: timer } = await getSupabase()
                .from("active_timers")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (timer) {
                const { error } = await getSupabase()
                    .from("active_timers")
                    .delete()
                    .eq("user_id", userId);
                if (error) throw error;
            }

            return timer as unknown as Tables<"active_timers"> | null;
        },
        onSuccess: (_, userId) =>
            queryClient.invalidateQueries({ queryKey: ["active_timers", userId] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11: PROPOSALS
// ═══════════════════════════════════════════════════════════════════════════

export function useProposals(status?: string) {
    return useQuery({
        queryKey: ["proposals", { status }],
        queryFn: async () => {
            let query = getSupabase()
                .from("proposals")
                .select("*, companies(name), contacts(full_name), deals(title)")
                .order("created_at", { ascending: false });

            if (status) {
                query = query.eq("status", filterValue(status));
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ProposalWithJoins[];
        },
    });
}

export function useProposalWithItems(id: string) {
    return useQuery({
        queryKey: ["proposals", id, "items"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("proposals")
                .select("*, proposal_items(*), companies(name), contacts(full_name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Tables<"proposals"> & {
                proposal_items: Tables<"proposal_items">[];
                companies: { name: string } | null;
                contacts: { full_name: string } | null;
            };
        },
        enabled: !!id,
    });
}

export function useCreateProposal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (proposal: TablesInsert<"proposals">) => {
            const { data, error } = await getSupabase()
                .from("proposals")
                .insert(proposal)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"proposals">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
    });
}

export function useUpdateProposal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"proposals"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("proposals")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"proposals">;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
            queryClient.invalidateQueries({ queryKey: ["proposals", id, "items"] });
        },
    });
}

export function useCreateProposalItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: TablesInsert<"proposal_items">) => {
            const { data, error } = await getSupabase()
                .from("proposal_items")
                .insert(item)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"proposal_items">;
        },
        onSuccess: (_, { proposal_id }) => {
            queryClient.invalidateQueries({ queryKey: ["proposals", proposal_id, "items"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12: DASHBOARDS
// ═══════════════════════════════════════════════════════════════════════════

export function useDashboards() {
    return useQuery({
        queryKey: ["dashboards"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("dashboards")
                .select("*, profiles:owner_id(name)")
                .order("name", { ascending: true });
            if (error) throw error;
            return data as unknown as DashboardWithOwner[];
        },
    });
}

export function useDashboardWithWidgets(id: string) {
    return useQuery({
        queryKey: ["dashboards", id, "widgets"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("dashboards")
                .select("*, dashboard_widgets(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Tables<"dashboards"> & {
                dashboard_widgets: Tables<"dashboard_widgets">[];
            };
        },
        enabled: !!id,
    });
}

export function useCreateDashboard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dashboard: TablesInsert<"dashboards">) => {
            const { data, error } = await getSupabase()
                .from("dashboards")
                .insert(dashboard)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"dashboards">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboards"] }),
    });
}

export function useCreateDashboardWidget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (widget: TablesInsert<"dashboard_widgets">) => {
            const { data, error } = await getSupabase()
                .from("dashboard_widgets")
                .insert(widget)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"dashboard_widgets">;
        },
        onSuccess: (_, { dashboard_id }) => {
            queryClient.invalidateQueries({ queryKey: ["dashboards", dashboard_id, "widgets"] });
        },
    });
}

export function useUpdateDashboardWidget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TablesUpdate<"dashboard_widgets"> & { id: string; dashboard_id: string }) => {
            const { data, error } = await getSupabase()
                .from("dashboard_widgets")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"dashboard_widgets">;
        },
        onSuccess: (_, { dashboard_id }) => {
            queryClient.invalidateQueries({ queryKey: ["dashboards", dashboard_id, "widgets"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 13: DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════

export function useDocuments(projectId?: string) {
    return useQuery({
        queryKey: ["documents", { projectId }],
        queryFn: async () => {
            let query = getSupabase()
                .from("documents")
                .select("*, profiles:owner_id(name), projects(name)")
                .order("updated_at", { ascending: false });

            if (projectId) {
                query = query.eq("project_id", projectId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as DocumentWithOwner[];
        },
    });
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: ["documents", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("documents")
                .select("*, profiles:owner_id(name), projects(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as DocumentWithOwner;
        },
        enabled: !!id,
    });
}

export function useDocumentVersions(documentId: string) {
    return useQuery({
        queryKey: ["documents", documentId, "versions"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("document_versions")
                .select("*")
                .eq("document_id", documentId)
                .order("version_number", { ascending: false });
            if (error) throw error;
            return data as unknown as Tables<"document_versions">[];
        },
        enabled: !!documentId,
    });
}

export function useCreateDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (doc: TablesInsert<"documents">) => {
            const { data, error } = await getSupabase()
                .from("documents")
                .insert(doc)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"documents">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
    });
}

export function useUpdateDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"documents"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("documents")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"documents">;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["documents", id] });
        },
    });
}

export function useCreateDocumentVersion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (version: TablesInsert<"document_versions">) => {
            const { data, error } = await getSupabase()
                .from("document_versions")
                .insert(version)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"document_versions">;
        },
        onSuccess: (_, { document_id }) => {
            queryClient.invalidateQueries({ queryKey: ["documents", document_id, "versions"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 14: RECURRING INVOICES
// ═══════════════════════════════════════════════════════════════════════════

export function useRecurringInvoices() {
    return useQuery({
        queryKey: ["recurring_invoices"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("recurring_invoices")
                .select("*, companies(name), projects(name)")
                .order("next_invoice_date", { ascending: true });
            if (error) throw error;
            return data as unknown as RecurringInvoiceWithCompany[];
        },
    });
}

export function useCreateRecurringInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoice: TablesInsert<"recurring_invoices">) => {
            const { data, error } = await getSupabase()
                .from("recurring_invoices")
                .insert(invoice)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"recurring_invoices">;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring_invoices"] }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 15: PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════

export function usePayments(invoiceId?: string) {
    return useQuery({
        queryKey: ["payments", { invoiceId }],
        queryFn: async () => {
            let query = getSupabase()
                .from("payments")
                .select("*, invoices(amount, status)")
                .order("payment_date", { ascending: false });

            if (invoiceId) {
                query = query.eq("invoice_id", invoiceId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as PaymentWithInvoice[];
        },
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payment: TablesInsert<"payments">) => {
            const { data, error } = await getSupabase()
                .from("payments")
                .insert(payment)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"payments">;
        },
        onSuccess: (_, { invoice_id }) => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["invoices", invoice_id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 16: UTILIZATION & REPORTING VIEWS
// ═══════════════════════════════════════════════════════════════════════════

export function useCrewUtilization() {
    return useQuery({
        queryKey: ["crew_utilization"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("v_crew_utilization").select("*");
            if (error) throw error;
            return data as unknown as {
                crew_member_id: string;
                name: string;
                department: string | null;
                organization_id: string;
                period_start: string;
                period_end: string;
                utilization_percent: number;
            }[];
        },
    });
}

export function useProjectProfitability() {
    return useQuery({
        queryKey: ["project_profitability"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("v_project_profitability").select("*");
            if (error) throw error;
            return data as unknown as {
                project_id: string;
                name: string;
                client: string;
                company_id: string | null;
                organization_id: string;
                budget_planned: number;
                budget_actual: number;
                budget_variance: number;
                margin_percent: number;
                total_hours_logged: number;
                total_labor_cost: number;
                total_expenses: number;
            }[];
        },
    });
}

export function usePipelineSummary() {
    return useQuery({
        queryKey: ["pipeline_summary"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("v_pipeline_summary").select("*");
            if (error) throw error;
            return data as unknown as {
                organization_id: string;
                pipeline_id: string | null;
                pipeline_name: string | null;
                stage: string;
                deal_count: number;
                total_value: number;
                avg_probability: number;
                weighted_value: number;
            }[];
        },
    });
}

export function useInvoiceAging() {
    return useQuery({
        queryKey: ["invoice_aging"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("v_invoice_aging").select("*");
            if (error) throw error;
            return data as unknown as {
                organization_id: string;
                invoice_id: string;
                vendor_id: string | null;
                company_id: string | null;
                amount: number;
                due_date: string;
                status: string;
                days_overdue: number;
                aging_bucket: string;
            }[];
        },
    });
}
