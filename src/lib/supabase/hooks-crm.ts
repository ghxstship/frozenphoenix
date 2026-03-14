/* ═══════════════════════════════════════════════════════════════
   CRM & PUBLIC SITE HOOKS — Migration 004 tables
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterValue, getSupabase } from "./client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "./database.types";

type Lead = Tables<"leads">;
type Testimonial = Tables<"testimonials">;
type Review = Tables<"reviews">;
type LeadInsert = TablesInsert<"leads">;

// ─── Leads ───

export function useLeads(status?: string) {
    return useQuery({
        queryKey: ["leads", status],
        queryFn: async () => {
            let query = getSupabase()
                .from("leads")
                .select("*, user_profiles(display_name)")
                .order("created_at", { ascending: false });
            if (status && status !== "all") query = query.eq("status", filterValue(status));
            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as Lead[];
        },
    });
}

export function useLead(id: string) {
    return useQuery({
        queryKey: ["leads", id],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("leads")
                .select("*, user_profiles(display_name), lead_activities(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Lead & {
                user_profiles: { display_name: string } | null;
                lead_activities: Tables<"lead_activities">[];
            };
        },
        enabled: !!id,
    });
}

export function useCreateLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lead: LeadInsert) => {
            const { data, error } = await getSupabase()
                .from("leads")
                .insert(lead)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Lead;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
    });
}

export function useUpdateLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: TablesUpdate<"leads"> & { id: string }) => {
            const { data, error } = await getSupabase()
                .from("leads")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Lead;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["leads", variables.id] });
        },
    });
}

export function useConvertLeadToDeal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            leadId,
            dealData,
        }: {
            leadId: string;
            dealData: Record<string, unknown>;
        }) => {
            // Create deal
            const { data: deal, error: dealError } = await getSupabase()
                .from("deals")
                .insert(dealData as TablesInsert<"deals">)
                .select()
                .single();
            if (dealError) throw dealError;
            const dealRow = deal as unknown as Tables<"deals">;

            // Update lead
            const { error: leadError } = await getSupabase()
                .from("leads")
                .update({
                    status: "won",
                    converted_to_deal_id: dealRow.id,
                    converted_at: new Date().toISOString(),
                })
                .eq("id", leadId);
            if (leadError) throw leadError;

            return { dealId: dealRow.id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });
}

// ─── Lead Activities ───

export function useCreateLeadActivity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (activity: TablesInsert<"lead_activities">) => {
            const { data, error } = await getSupabase()
                .from("lead_activities")
                .insert(activity)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Tables<"lead_activities">;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["leads", variables.lead_id] });
        },
    });
}

// ─── Testimonials ───

export function useTestimonials(options?: { featured?: boolean; status?: string }) {
    return useQuery({
        queryKey: ["testimonials", options],
        queryFn: async () => {
            let query = getSupabase()
                .from("testimonials")
                .select("*, projects(name), case_studies(title)")
                .order("display_order");

            if (options?.featured) query = query.eq("featured", true);
            if (options?.status)
                query = query.eq(
                    "status",
                    options.status as Database["public"]["Enums"]["testimonial_status"]
                );

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as Testimonial[];
        },
    });
}

export function usePublicTestimonials() {
    return useQuery({
        queryKey: ["testimonials", "public"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("testimonials")
                .select("*")
                .in("status", ["approved", "featured"])
                .order("featured", { ascending: false })
                .order("display_order");
            if (error) throw error;
            return (data as unknown as Testimonial[]) ?? [];
        },
    });
}

export function useCreateTestimonial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (testimonial: TablesInsert<"testimonials">) => {
            const { data, error } = await getSupabase()
                .from("testimonials")
                .insert(testimonial)
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Testimonial;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
    });
}

// ─── Reviews ───

export function useReviews() {
    return useQuery({
        queryKey: ["reviews"],
        queryFn: async () => {
            const { data, error } = await getSupabase()
                .from("reviews")
                .select("*")
                .eq("visible", true)
                .order("review_date", { ascending: false });
            if (error) throw error;
            return (data as unknown as Review[]) ?? [];
        },
    });
}

export function useReviewStats() {
    return useQuery({
        queryKey: ["review_stats"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("review_stats").select("*").single();
            if (error) throw error;
            return data;
        },
    });
}

// ─── Lead Pipeline Stats ───

export function useLeadPipelineStats() {
    return useQuery({
        queryKey: ["lead_pipeline_stats"],
        queryFn: async () => {
            const { data, error } = await getSupabase().from("lead_pipeline_stats").select("*");
            if (error) throw error;
            return data;
        },
    });
}
