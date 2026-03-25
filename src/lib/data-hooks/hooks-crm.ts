"use client";

/**
 * CRM entity hooks: leads, opportunities, companies, contacts, pipelines,
 * proposals, estimates, testimonials, reviews, case_studies, stakeholders.
 *
 * ALL hooks use factory pattern. Query keys match entityConfig.entityName.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiGet, apiList, apiUpdate } from "@/lib/api/client";
import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════

export const useLeads = makeListHook<Tables<"leads">>("lead", "/api/entities/leads", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useLead = makeDetailHook<Tables<"leads">>("lead", "/api/entities/leads");
export const useCreateLead = makeCreateHook<Tables<"leads">>("lead", "/api/entities/leads");
export const useUpdateLead = makeUpdateHook<Tables<"leads">>("lead", "/api/entities/leads");
export const useDeleteLead = makeDeleteHook("lead", "/api/entities/leads");

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
            const deal = await apiCreate<Tables<"deals">>("/api/entities/deals", dealData);
            await apiUpdate<Tables<"leads">>("/api/entities/leads", leadId, {
                status: "won",
                converted_to_deal_id: deal.id,
                converted_at: new Date().toISOString(),
            });
            return { dealId: deal.id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lead"] });
            queryClient.invalidateQueries({ queryKey: ["deal"] });
        },
    });
}

export const useCreateLeadActivity = makeCreateHook<Tables<"lead_activities">>(
    "lead_activity",
    "/api/entities/lead-activities",
    ["lead"]
);

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════

export const useOpportunities = makeListHook<Tables<"opportunities">>(
    "opportunity",
    "/api/entities/opportunities",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useOpportunity = makeDetailHook<Tables<"opportunities">>(
    "opportunity",
    "/api/entities/opportunities"
);
export const useCreateOpportunity = makeCreateHook<Tables<"opportunities">>(
    "opportunity",
    "/api/entities/opportunities"
);
export const useUpdateOpportunity = makeUpdateHook<Tables<"opportunities">>(
    "opportunity",
    "/api/entities/opportunities"
);
export const useDeleteOpportunity = makeDeleteHook("opportunity", "/api/entities/opportunities");

// ═══════════════════════════════════════════════════════════════
// COMPANIES
// ═══════════════════════════════════════════════════════════════

export const useCompanies = makeListHook<Tables<"companies">>(
    "company",
    "/api/entities/companies",
    { sort_by: "name", sort_order: "asc" },
    { staleTime: 5 * 60_000, gcTime: 10 * 60_000 }
);
export const useCompany = makeDetailHook<Tables<"companies">>("company", "/api/entities/companies");
export const useCreateCompany = makeCreateHook<Tables<"companies">>(
    "company",
    "/api/entities/companies"
);
export const useUpdateCompany = makeUpdateHook<Tables<"companies">>(
    "company",
    "/api/entities/companies"
);
export const useDeleteCompany = makeDeleteHook("company", "/api/entities/companies");

// ═══════════════════════════════════════════════════════════════
// CONTACTS
// ═══════════════════════════════════════════════════════════════

export const useContacts = makeListHook<Tables<"contacts">>(
    "contact",
    "/api/entities/contacts",
    { sort_by: "full_name", sort_order: "asc" },
    { staleTime: 5 * 60_000, gcTime: 10 * 60_000 }
);
export const useContact = makeDetailHook<Tables<"contacts">>("contact", "/api/entities/contacts");
export const useCreateContact = makeCreateHook<Tables<"contacts">>(
    "contact",
    "/api/entities/contacts"
);
export const useUpdateContact = makeUpdateHook<Tables<"contacts">>(
    "contact",
    "/api/entities/contacts"
);
export const useDeleteContact = makeDeleteHook("contact", "/api/entities/contacts");

// ═══════════════════════════════════════════════════════════════
// PIPELINES
// ═══════════════════════════════════════════════════════════════

export const usePipelines = makeListHook<Tables<"pipelines">>(
    "pipeline",
    "/api/entities/pipelines",
    {
        sort_by: "name",
        sort_order: "asc",
    }
);
export const usePipeline = makeDetailHook<Tables<"pipelines">>(
    "pipeline",
    "/api/entities/pipelines"
);
export const useCreatePipeline = makeCreateHook<Tables<"pipelines">>(
    "pipeline",
    "/api/entities/pipelines"
);
export const useUpdatePipeline = makeUpdateHook<Tables<"pipelines">>(
    "pipeline",
    "/api/entities/pipelines"
);
export const useDeletePipeline = makeDeleteHook("pipeline", "/api/entities/pipelines");

// ═══════════════════════════════════════════════════════════════
// PROPOSALS
// ═══════════════════════════════════════════════════════════════

export const useProposals = makeListHook<Tables<"proposals">>(
    "proposal",
    "/api/entities/proposals",
    {
        sort_by: "created_at",
        sort_order: "desc",
    }
);
export const useProposal = makeDetailHook<Tables<"proposals">>(
    "proposal",
    "/api/entities/proposals"
);
export const useCreateProposal = makeCreateHook<Tables<"proposals">>(
    "proposal",
    "/api/entities/proposals"
);
export const useUpdateProposal = makeUpdateHook<Tables<"proposals">>(
    "proposal",
    "/api/entities/proposals"
);
export const useDeleteProposal = makeDeleteHook("proposal", "/api/entities/proposals");

export function useProposalWithItems(id: string) {
    return useQuery({
        queryKey: ["proposal", "detail", id, "items"],
        queryFn: () => apiGet<Tables<"proposals">>("/api/entities/proposals", id),
        enabled: !!id,
    });
}

export const useCreateProposalItem = makeCreateHook<Tables<"proposal_items">>(
    "proposal_item",
    "/api/entities/proposal-items",
    ["proposal"]
);

// ═══════════════════════════════════════════════════════════════
// ESTIMATES
// ═══════════════════════════════════════════════════════════════

export const useEstimates = makeListHook<Tables<"estimates">>(
    "estimate",
    "/api/entities/estimates",
    {
        sort_by: "created_at",
        sort_order: "desc",
    }
);
export const useEstimate = makeDetailHook<Tables<"estimates">>(
    "estimate",
    "/api/entities/estimates"
);
export const useCreateEstimate = makeCreateHook<Tables<"estimates">>(
    "estimate",
    "/api/entities/estimates"
);
export const useUpdateEstimate = makeUpdateHook<Tables<"estimates">>(
    "estimate",
    "/api/entities/estimates"
);
export const useDeleteEstimate = makeDeleteHook("estimate", "/api/entities/estimates");

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════

export const useTestimonials = makeListHook<Tables<"testimonials">>(
    "testimonial",
    "/api/entities/testimonials",
    { sort_by: "display_order", sort_order: "asc" }
);
export const useTestimonial = makeDetailHook<Tables<"testimonials">>(
    "testimonial",
    "/api/entities/testimonials"
);
export const useCreateTestimonial = makeCreateHook<Tables<"testimonials">>(
    "testimonial",
    "/api/entities/testimonials"
);
export const useUpdateTestimonial = makeUpdateHook<Tables<"testimonials">>(
    "testimonial",
    "/api/entities/testimonials"
);

export function usePublicTestimonials() {
    return useQuery({
        queryKey: ["testimonial", { status: "approved" }],
        queryFn: async () => {
            const res = await apiList<Tables<"testimonials">>("/api/entities/testimonials", {
                status: "approved",
                sort_by: "display_order",
                sort_order: "asc",
            });
            return res.data ?? [];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════

export const useReviews = makeListHook<Tables<"reviews">>("review", "/api/entities/reviews", {
    sort_by: "review_date",
    sort_order: "desc",
});
export const useReview = makeDetailHook<Tables<"reviews">>("review", "/api/entities/reviews");
export const useCreateReview = makeCreateHook<Tables<"reviews">>("review", "/api/entities/reviews");

export function useReviewStats() {
    return useQuery({
        queryKey: ["review_stat"],
        queryFn: async () => {
            const res = await apiGet<Record<string, unknown>>(
                "/api/entities/review-stats",
                "summary"
            );
            return res;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CASE STUDIES
// ═══════════════════════════════════════════════════════════════

export const useCaseStudies = makeListHook<Tables<"case_studies">>(
    "case_study",
    "/api/entities/case-studies",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCaseStudy = makeDetailHook<Tables<"case_studies">>(
    "case_study",
    "/api/entities/case-studies"
);
export const useCreateCaseStudy = makeCreateHook<Tables<"case_studies">>(
    "case_study",
    "/api/entities/case-studies"
);
export const useUpdateCaseStudy = makeUpdateHook<Tables<"case_studies">>(
    "case_study",
    "/api/entities/case-studies"
);
export const useDeleteCaseStudy = makeDeleteHook("case_study", "/api/entities/case-studies");

export function usePublicCaseStudies() {
    return useQuery({
        queryKey: ["case_study", { is_published: true }],
        queryFn: async () => {
            const res = await apiList<Tables<"case_studies">>("/api/entities/case-studies", {
                is_published: true,
                sort_by: "published_at",
                sort_order: "desc",
            });
            return res.data;
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// STAKEHOLDERS
// ═══════════════════════════════════════════════════════════════

export const useStakeholders = makeListHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/entities/stakeholders",
    { sort_by: "name", sort_order: "asc" }
);
export const useStakeholder = makeDetailHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/entities/stakeholders"
);
export const useCreateStakeholder = makeCreateHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/entities/stakeholders"
);
export const useUpdateStakeholder = makeUpdateHook<Tables<"stakeholders">>(
    "stakeholder",
    "/api/entities/stakeholders"
);
export const useDeleteStakeholder = makeDeleteHook("stakeholder", "/api/entities/stakeholders");

// ─── Accounts (alias for stakeholders) ───
export const useAccounts = useStakeholders;
export const useAccount = useStakeholder;
export const useCreateAccount = useCreateStakeholder;
export const useUpdateAccount = useUpdateStakeholder;
export const useDeleteAccount = useDeleteStakeholder;

// ─── Stakeholder Projects (junction) ───
export const useStakeholderProjects = makeListHook<Tables<"stakeholder_projects">>(
    "stakeholder_project",
    "/api/entities/stakeholder-projects"
);
export const useCreateStakeholderProject = makeCreateHook<Tables<"stakeholder_projects">>(
    "stakeholder_project",
    "/api/entities/stakeholder-projects",
    ["stakeholder"]
);
export const useDeleteStakeholderProject = makeDeleteHook(
    "stakeholder_project",
    "/api/entities/stakeholder-projects",
    ["stakeholder"]
);

// ═══════════════════════════════════════════════════════════════
// LOST REASONS
// ═══════════════════════════════════════════════════════════════

export const useLostReasons = makeListHook<Tables<"lost_reasons">>(
    "lost_reason",
    "/api/entities/lost-reasons",
    { sort_by: "name", sort_order: "asc" }
);
export const useCreateLostReason = makeCreateHook<Tables<"lost_reasons">>(
    "lost_reason",
    "/api/entities/lost-reasons"
);

// ═══════════════════════════════════════════════════════════════
// LEAD PIPELINE STATS (aggregate view)
// ═══════════════════════════════════════════════════════════════

export function useLeadPipelineStats() {
    return useQuery({
        queryKey: ["lead_pipeline_stat"],
        queryFn: async () => {
            const res = await apiList<Record<string, unknown>>(
                "/api/entities/lead-pipeline-stats",
                {}
            );
            return res.data;
        },
    });
}
