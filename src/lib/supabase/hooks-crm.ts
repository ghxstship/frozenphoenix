/* ═══════════════════════════════════════════════════════════════
   CRM & PUBLIC SITE HOOKS — Migration 004 tables
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterValue, getSupabase, isSupabaseConfigured } from "./client";
import { logger } from "@/lib/logger";
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
            if (!isSupabaseConfigured) return [] as Lead[];
            let query = getSupabase()
                .from("leads")
                .select("*, profiles(name)")
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
            if (!isSupabaseConfigured) return null;
            const { data, error } = await getSupabase()
                .from("leads")
                .select("*, profiles(name), lead_activities(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as unknown as Lead & {
                profiles: { name: string } | null;
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
            if (!isSupabaseConfigured) {
                logger.debug("Lead submission (demo mode)", { lead });
                return {
                    id: `demo-lead-${Date.now()}`,
                    ...lead,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as unknown as Lead;
            }
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
            if (!isSupabaseConfigured) return { id, ...updates } as unknown as Lead;
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
            if (!isSupabaseConfigured) return { dealId: "mock-deal-id" };

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
            if (!isSupabaseConfigured) return activity as unknown as Tables<"lead_activities">;
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
            if (!isSupabaseConfigured) return [] as Testimonial[];
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
            if (!isSupabaseConfigured) return MOCK_TESTIMONIALS;
            const { data, error } = await getSupabase()
                .from("testimonials")
                .select("*")
                .in("status", ["approved", "featured"])
                .order("featured", { ascending: false })
                .order("display_order");
            if (error) throw error;
            const rows = data as unknown as Testimonial[];
            return rows?.length ? rows : MOCK_TESTIMONIALS;
        },
    });
}

export function useCreateTestimonial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (testimonial: TablesInsert<"testimonials">) => {
            if (!isSupabaseConfigured) return testimonial as unknown as Testimonial;
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
            if (!isSupabaseConfigured) return MOCK_REVIEWS;
            const { data, error } = await getSupabase()
                .from("reviews")
                .select("*")
                .eq("visible", true)
                .order("review_date", { ascending: false });
            if (error) throw error;
            const rows = data as unknown as Review[];
            return rows?.length ? rows : MOCK_REVIEWS;
        },
    });
}

export function useReviewStats() {
    return useQuery({
        queryKey: ["review_stats"],
        queryFn: async () => {
            if (!isSupabaseConfigured) {
                return {
                    total_reviews: MOCK_REVIEWS.length,
                    average_rating: 4.8,
                    positive_reviews: MOCK_REVIEWS.filter((r) => r.rating >= 4).length,
                    platforms: 3,
                };
            }
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
            if (!isSupabaseConfigured) {
                return DEMO_PIPELINE_STATS;
            }
            const { data, error } = await getSupabase().from("lead_pipeline_stats").select("*");
            if (error) throw error;
            return data;
        },
    });
}

// ─── Demo Data ───

const DEMO_PIPELINE_STATS = [
    { status: "new", count: 12, new_this_week: 5, new_this_month: 12 },
    { status: "contacted", count: 8, new_this_week: 2, new_this_month: 6 },
    { status: "qualified", count: 5, new_this_week: 1, new_this_month: 4 },
    { status: "proposal_sent", count: 3, new_this_week: 1, new_this_month: 2 },
];

// ─── Mock Data ───

const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: "test-1",
        project_id: null,
        case_study_id: null,
        author_name: "Sarah Mitchell",
        author_title: "VP of Marketing",
        author_company: "TechCorp Global",
        author_avatar_url: null,
        quote: "Playbook transformed our product launch into an unforgettable experience. Their attention to detail and creative vision exceeded all expectations.",
        full_testimonial: null,
        rating: 5,
        category: "brand_activation",
        tags: ["product_launch", "technology"],
        status: "featured",
        featured: true,
        display_order: 1,
        verified: true,
        verified_at: "2024-01-15T00:00:00Z",
        verified_by: null,
        received_at: "2024-01-15T00:00:00Z",
        created_at: "2024-01-15T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
    },
    {
        id: "test-2",
        project_id: null,
        case_study_id: null,
        author_name: "Marcus Chen",
        author_title: "Event Director",
        author_company: "Festival Productions Inc",
        author_avatar_url: null,
        quote: "Working with the FP team was seamless. They handled our 50,000-person festival with precision and professionalism.",
        full_testimonial: null,
        rating: 5,
        category: "festival_production",
        tags: ["festival", "large_scale"],
        status: "approved",
        featured: false,
        display_order: 2,
        verified: true,
        verified_at: "2024-02-20T00:00:00Z",
        verified_by: null,
        received_at: "2024-02-20T00:00:00Z",
        created_at: "2024-02-20T00:00:00Z",
        updated_at: "2024-02-20T00:00:00Z",
    },
    {
        id: "test-3",
        project_id: null,
        case_study_id: null,
        author_name: "Jennifer Walsh",
        author_title: "Brand Manager",
        author_company: "Luxury Auto Group",
        author_avatar_url: null,
        quote: "The immersive showroom they created drove a 40% increase in test drive bookings. Absolutely phenomenal ROI.",
        full_testimonial: null,
        rating: 5,
        category: "immersive_installation",
        tags: ["automotive", "showroom"],
        status: "approved",
        featured: false,
        display_order: 3,
        verified: true,
        verified_at: "2024-03-10T00:00:00Z",
        verified_by: null,
        received_at: "2024-03-10T00:00:00Z",
        created_at: "2024-03-10T00:00:00Z",
        updated_at: "2024-03-10T00:00:00Z",
    },
];

const MOCK_REVIEWS: Review[] = [
    {
        id: "rev-1",
        platform: "Google",
        external_id: "g-123",
        external_url: null,
        reviewer_name: "David K.",
        reviewer_avatar_url: null,
        rating: 5,
        title: "Outstanding Production Partner",
        content:
            "We've worked with Playbook on three major events now. Each one has been flawlessly executed.",
        review_date: "2024-02-15",
        helpful_count: 12,
        response: null,
        response_date: null,
        visible: true,
        flagged: false,
        created_at: "2024-02-15T00:00:00Z",
        updated_at: "2024-02-15T00:00:00Z",
    },
    {
        id: "rev-2",
        platform: "Clutch",
        external_id: "c-456",
        external_url: null,
        reviewer_name: "Amanda R.",
        reviewer_avatar_url: null,
        rating: 5,
        title: "Best in the Business",
        content:
            "Their project management system kept us informed every step of the way. Highly recommend.",
        review_date: "2024-01-28",
        helpful_count: 8,
        response: null,
        response_date: null,
        visible: true,
        flagged: false,
        created_at: "2024-01-28T00:00:00Z",
        updated_at: "2024-01-28T00:00:00Z",
    },
    {
        id: "rev-3",
        platform: "Google",
        external_id: "g-789",
        external_url: null,
        reviewer_name: "Michael T.",
        reviewer_avatar_url: null,
        rating: 4,
        title: "Great Experience",
        content: "Professional team, delivered on time and on budget. Would work with again.",
        review_date: "2024-03-05",
        helpful_count: 5,
        response: null,
        response_date: null,
        visible: true,
        flagged: false,
        created_at: "2024-03-05T00:00:00Z",
        updated_at: "2024-03-05T00:00:00Z",
    },
];
