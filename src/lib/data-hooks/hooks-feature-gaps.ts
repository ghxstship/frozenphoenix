"use client";

/**
 * Supabase hooks for competitive feature gap implementations.
 * Covers: budget profitability, crew utilization, budget alerts,
 * record comments/activity, quality checks, reviews, goals, knowledge articles.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase/client";

// ═══════════════════════════════════════════════════════════════
// BUDGET PROFITABILITY VIEW
// ═══════════════════════════════════════════════════════════════

export interface BudgetProfitabilityRow {
    budget_id: string;
    project_id: string;
    version: number;
    status: string;
    total_budget: number;
    total_actual: number;
    revenue: number;
    labor_cost: number;
    expense_cost: number;
    committed_cost: number;
    total_cost: number;
    profit: number;
    margin_percent: number;
    daily_burn_rate: number;
    burn_percent: number;
    total_hours_tracked: number;
    billable_hours: number;
    days_elapsed: number;
    contingency_percent: number;
    markup_percent: number;
}

export function useBudgetProfitability(projectId?: string) {
    return useQuery({
        queryKey: ["budget_profitability", projectId],
        queryFn: async () => {
            let query = fromTable("v_budget_profitability")
                .select("*")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as BudgetProfitabilityRow[];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// CREW UTILIZATION VIEW
// ═══════════════════════════════════════════════════════════════

export interface CrewUtilizationRow {
    crew_member_id: string;
    name: string;
    role: string;
    department: string;
    hourly_rate: number;
    crew_status: string;
    capacity_hours_per_day: number;
    booked_hours_week: number;
    booked_hours_month: number;
    time_off_hours_week: number;
    utilization_percent_week: number;
    utilization_percent_month: number;
    active_bookings: number;
    conflict_count: number;
}

export function useCrewUtilization() {
    return useQuery({
        queryKey: ["crew_utilization"],
        queryFn: async () => {
            const { data, error } = await fromTable("v_crew_utilization").select("*").order("name");
            if (error) throw error;
            return (data ?? []) as CrewUtilizationRow[];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// BUDGET ALERTS
// ═══════════════════════════════════════════════════════════════

export interface BudgetAlertRow {
    id: string;
    budget_id: string;
    project_id: string;
    threshold_percent: number;
    actual_percent: number;
    acknowledged_at: string | null;
    acknowledged_by: string | null;
    created_at: string;
}

export function useBudgetAlerts(projectId?: string) {
    return useQuery({
        queryKey: ["budget_alerts", projectId],
        queryFn: async () => {
            let query = fromTable("budget_alerts")
                .select("*")
                .order("created_at", { ascending: false });
            if (projectId) query = query.eq("project_id", projectId);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as BudgetAlertRow[];
        },
    });
}

export function useAcknowledgeBudgetAlert() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ alertId, userId }: { alertId: string; userId: string }) => {
            const { error } = await fromTable("budget_alerts")
                .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: userId })
                .eq("id", alertId);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["budget_alerts"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// RECORD COMMENTS (Chatter)
// ═══════════════════════════════════════════════════════════════

export interface RecordCommentRow {
    id: string;
    entity_type: string;
    entity_id: string;
    author_id: string;
    parent_comment_id: string | null;
    body: string;
    attachments: unknown[];
    is_internal: boolean;
    created_at: string;
    updated_at: string;
    user_profiles?: { display_name: string; avatar_url: string | null } | null | undefined;
}

/** @deprecated Use useEntityMessages from hooks-messaging.ts when messaging_enabled flag is on. Legacy fallback only. */
export function useRecordComments(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["record_comments", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("record_comments")
                .select("*, user_profiles(display_name, avatar_url)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return (data ?? []) as RecordCommentRow[];
        },
        enabled: !!entityId,
    });
}

/** @deprecated Use useSendMessage from hooks-messaging.ts when messaging_enabled flag is on. Legacy fallback only. */
export function useCreateRecordComment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (comment: {
            entity_type: string;
            entity_id: string;
            author_id: string;
            body: string;
            parent_comment_id?: string | undefined;
            is_internal?: boolean | undefined;
        }) => {
            const { data, error } = await fromTable("record_comments")
                .insert(comment)
                .select("*, user_profiles(display_name, avatar_url)")
                .single();
            if (error) throw error;
            return data as RecordCommentRow;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: ["record_comments", variables.entity_type, variables.entity_id],
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// RECORD ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

export interface RecordActivityRow {
    id: string;
    entity_type: string;
    entity_id: string;
    actor_id: string | null;
    action: string;
    changes: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: string;
    user_profiles?: { display_name: string } | null | undefined;
}

export function useRecordActivityLog(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["record_activity_log", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("record_activity_log")
                .select("*, user_profiles(display_name)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return (data ?? []) as RecordActivityRow[];
        },
        enabled: !!entityId,
    });
}

// ═══════════════════════════════════════════════════════════════
// QUALITY CHECKS
// ═══════════════════════════════════════════════════════════════

export interface QualityCheckTemplateRow {
    id: string;
    name: string;
    description: string | null;
    entity_type: string;
    check_items: unknown[];
    is_active: boolean;
    created_at: string;
}

export function useQualityCheckTemplates(entityType?: string) {
    return useQuery({
        queryKey: ["quality_check_templates", entityType],
        queryFn: async () => {
            let query = fromTable("quality_check_templates")
                .select("*")
                .eq("is_active", true)
                .order("name");
            if (entityType) query = query.eq("entity_type", entityType);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as QualityCheckTemplateRow[];
        },
    });
}

export interface QualityCheckRow {
    id: string;
    template_id: string | null;
    entity_type: string;
    entity_id: string;
    inspector_id: string;
    status: string;
    results: unknown[];
    notes: string | null;
    photos: unknown[];
    completed_at: string | null;
    created_at: string;
    user_profiles?: { display_name: string } | null | undefined;
}

export function useAllQualityChecks() {
    return useQuery({
        queryKey: ["quality_checks", "all"],
        queryFn: async () => {
            const { data, error } = await fromTable("quality_checks")
                .select(
                    "*, user_profiles(display_name), quality_check_templates(name, description, entity_type, check_items)"
                )
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as (QualityCheckRow & {
                quality_check_templates?: {
                    name: string;
                    description: string | null;
                    entity_type: string;
                    check_items: unknown[];
                } | null;
            })[];
        },
    });
}

export function useQualityChecks(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["quality_checks", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("quality_checks")
                .select("*, user_profiles(display_name)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as QualityCheckRow[];
        },
        enabled: !!entityId,
    });
}

export function useCreateQualityCheck() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (check: Record<string, unknown>) => {
            const { data, error } = await fromTable("quality_checks")
                .insert(check)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quality_checks"] }),
    });
}

export function useUpdateQualityCheck() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("quality_checks")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quality_checks"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// REVIEW CYCLES & FEEDBACK
// ═══════════════════════════════════════════════════════════════

export interface ReviewCycleRow {
    id: string;
    name: string;
    description: string | null;
    cycle_type: string;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
}

export function useReviewCycles() {
    return useQuery({
        queryKey: ["review_cycles"],
        queryFn: async () => {
            const { data, error } = await fromTable("review_cycles")
                .select("*")
                .order("start_date", { ascending: false });
            if (error) throw error;
            return (data ?? []) as ReviewCycleRow[];
        },
    });
}

export interface ReviewFeedbackRow {
    id: string;
    review_cycle_id: string;
    reviewee_id: string;
    reviewer_id: string;
    relationship: string;
    status: string;
    responses: Record<string, unknown>;
    overall_rating: number | null;
    comments: string | null;
    submitted_at: string | null;
    created_at: string;
}

export function useReviewFeedback(cycleId?: string, revieweeId?: string) {
    return useQuery({
        queryKey: ["review_feedback", cycleId, revieweeId],
        queryFn: async () => {
            let query = fromTable("review_feedback_requests")
                .select("*, user_profiles!review_feedback_requests_reviewer_id_fkey(display_name)")
                .order("created_at", { ascending: false });
            if (cycleId) query = query.eq("review_cycle_id", cycleId);
            if (revieweeId) query = query.eq("reviewee_id", revieweeId);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as ReviewFeedbackRow[];
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// GOALS
// ═══════════════════════════════════════════════════════════════

export interface GoalRow {
    id: string;
    owner_id: string;
    title: string;
    description: string | null;
    goal_type: string;
    target_value: number | null;
    current_value: number;
    unit: string;
    status: string;
    due_date: string | null;
    completed_at: string | null;
    parent_goal_id: string | null;
    project_id: string | null;
    created_at: string;
}

export function useGoals(ownerId?: string) {
    return useQuery({
        queryKey: ["goals", ownerId],
        queryFn: async () => {
            let query = fromTable("goals")
                .select("*, user_profiles(display_name), projects(name)")
                .order("created_at", { ascending: false });
            if (ownerId) query = query.eq("owner_id", ownerId);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as (GoalRow & {
                user_profiles?: { display_name: string } | null | undefined;
                projects?: { name: string } | null | undefined;
            })[];
        },
    });
}

export function useCreateGoal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (goal: Record<string, unknown>) => {
            const { data, error } = await fromTable("goals").insert(goal).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
    });
}

export function useUpdateGoal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("goals")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE ARTICLES
// ═══════════════════════════════════════════════════════════════

export interface KnowledgeArticleRow {
    id: string;
    title: string;
    body: string;
    category: string;
    tags: string[];
    status: string;
    version: number;
    author_id: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    user_profiles?: { display_name: string } | null | undefined;
}

export function useKnowledgeArticles(category?: string) {
    return useQuery({
        queryKey: ["knowledge_articles", category],
        queryFn: async () => {
            let query = fromTable("knowledge_articles")
                .select("*, user_profiles(display_name)")
                .order("updated_at", { ascending: false });
            if (category) query = query.eq("category", category);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as KnowledgeArticleRow[];
        },
    });
}

export function useKnowledgeArticle(id: string) {
    return useQuery({
        queryKey: ["knowledge_article", id],
        queryFn: async () => {
            const { data, error } = await fromTable("knowledge_articles")
                .select("*, user_profiles(display_name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as KnowledgeArticleRow;
        },
        enabled: !!id,
    });
}

export function useCreateKnowledgeArticle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (article: Record<string, unknown>) => {
            const { data, error } = await fromTable("knowledge_articles")
                .insert(article)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge_articles"] }),
    });
}

export function useUpdateKnowledgeArticle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
            const { data, error } = await fromTable("knowledge_articles")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["knowledge_articles"] });
            qc.invalidateQueries({ queryKey: ["knowledge_article", variables.id] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE ARTICLE LINKS
// ═══════════════════════════════════════════════════════════════

export interface ArticleLinkRow {
    id: string;
    article_id: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
    knowledge_articles?: { title: string } | null | undefined;
}

export function useArticleLinks(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["article_links", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("knowledge_article_links")
                .select("*, knowledge_articles(title)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId);
            if (error) throw error;
            return (data ?? []) as ArticleLinkRow[];
        },
        enabled: !!entityId,
    });
}

export function useLinkArticle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (link: {
            article_id: string;
            entity_type: string;
            entity_id: string;
            linked_by?: string | undefined;
        }) => {
            const { data, error } = await fromTable("knowledge_article_links")
                .insert(link)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: ["article_links", variables.entity_type, variables.entity_id],
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DATA COMPLETENESS (GAP-CRW-01)
// Configurable per-entity required-field rules with weighted scoring.
// ═══════════════════════════════════════════════════════════════

export interface DataCompletenessRule {
    /** Entity type this rule applies to */
    entityType: string;
    /** Supabase table name */
    table: string;
    /** Fields to check for completeness */
    requiredFields: {
        field: string;
        label: string;
        /** 1-3 importance weight (higher = more impact on score) */
        weight: number;
    }[];
}

export interface DataCompletenessResult {
    id: string;
    name: string;
    completenessPercent: number;
    filledCount: number;
    totalCount: number;
    missingFields: { field: string; label: string; weight: number }[];
}

export interface DataCompletenessSummary {
    entityType: string;
    totalRecords: number;
    avgCompleteness: number;
    fullyComplete: number;
    needsAttention: number;
    criticalGaps: number;
}

/** Configurable rules per entity type — extend as needed */
export const DATA_COMPLETENESS_RULES: DataCompletenessRule[] = [
    {
        entityType: "crew",
        table: "crew_members",
        requiredFields: [
            { field: "name", label: "Full Name", weight: 3 },
            { field: "email", label: "Email Address", weight: 3 },
            { field: "phone", label: "Phone Number", weight: 2 },
            { field: "role", label: "Role / Title", weight: 2 },
            { field: "department", label: "Department", weight: 1 },
            { field: "emergency_contact", label: "Emergency Contact", weight: 2 },
            { field: "shirt_size", label: "Shirt Size", weight: 1 },
            { field: "dietary_restrictions", label: "Dietary Restrictions", weight: 1 },
        ],
    },
    {
        entityType: "vendors",
        table: "vendors",
        requiredFields: [
            { field: "name", label: "Company Name", weight: 3 },
            { field: "primary_contact_name", label: "Primary Contact", weight: 3 },
            { field: "email", label: "Email Address", weight: 3 },
            { field: "phone", label: "Phone Number", weight: 2 },
            { field: "address", label: "Business Address", weight: 1 },
            { field: "tax_id", label: "Tax ID / EIN", weight: 2 },
            { field: "insurance_expiry", label: "Insurance Expiry", weight: 2 },
            { field: "payment_terms", label: "Payment Terms", weight: 1 },
        ],
    },
    {
        entityType: "contacts",
        table: "contacts",
        requiredFields: [
            { field: "name", label: "Full Name", weight: 3 },
            { field: "email", label: "Email Address", weight: 3 },
            { field: "phone", label: "Phone Number", weight: 2 },
            { field: "company", label: "Company", weight: 1 },
            { field: "title", label: "Job Title", weight: 1 },
        ],
    },
    {
        entityType: "assets",
        table: "assets",
        requiredFields: [
            { field: "name", label: "Asset Name", weight: 3 },
            { field: "asset_tag", label: "Asset Tag / ID", weight: 3 },
            { field: "category", label: "Category", weight: 2 },
            { field: "condition", label: "Condition", weight: 2 },
            { field: "location", label: "Current Location", weight: 2 },
            { field: "purchase_date", label: "Purchase Date", weight: 1 },
            { field: "purchase_price", label: "Purchase Price", weight: 1 },
        ],
    },
];

/**
 * Pure function: compute completeness for a single record against a rule set.
 * Exported for unit testing.
 */
export function computeCompleteness(
    record: Record<string, unknown>,
    rule: DataCompletenessRule
): DataCompletenessResult {
    const missing: DataCompletenessResult["missingFields"] = [];
    let totalWeight = 0;
    let filledWeight = 0;
    let filledCount = 0;

    for (const rf of rule.requiredFields) {
        totalWeight += rf.weight;
        const val = record[rf.field];
        const isFilled = val !== null && val !== undefined && val !== "" && val !== 0;
        if (isFilled) {
            filledWeight += rf.weight;
            filledCount++;
        } else {
            missing.push({ field: rf.field, label: rf.label, weight: rf.weight });
        }
    }

    const completenessPercent =
        totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 100;

    return {
        id: (record.id as string) ?? "",
        name: (record.name as string) ?? (record.title as string) ?? "Unnamed",
        completenessPercent,
        filledCount,
        totalCount: rule.requiredFields.length,
        missingFields: missing,
    };
}

export function useDataCompleteness(entityType: string) {
    const rule = DATA_COMPLETENESS_RULES.find((r) => r.entityType === entityType);
    return useQuery({
        queryKey: ["data_completeness", entityType],
        queryFn: async () => {
            if (!rule) return [];
            const selectFields = [
                "id",
                "name",
                "title",
                ...rule.requiredFields.map((f) => f.field),
            ];
            const uniqueFields = [...new Set(selectFields)];
            const { data, error } = await fromTable(rule.table)
                .select(uniqueFields.join(","))
                .order("name")
                .limit(500);
            if (error) throw error;
            return (data ?? []).map((record: Record<string, unknown>) =>
                computeCompleteness(record, rule)
            );
        },
        enabled: !!rule,
    });
}

export function useDataCompletenessSummary(entityType: string) {
    const { data: results, isLoading } = useDataCompleteness(entityType);

    const summary: DataCompletenessSummary | null = results
        ? {
              entityType,
              totalRecords: results.length,
              avgCompleteness:
                  results.length > 0
                      ? Math.round(
                            results.reduce(
                                (sum: number, r: DataCompletenessResult) =>
                                    sum + r.completenessPercent,
                                0
                            ) / results.length
                        )
                      : 0,
              fullyComplete: results.filter(
                  (r: DataCompletenessResult) => r.completenessPercent === 100
              ).length,
              needsAttention: results.filter(
                  (r: DataCompletenessResult) =>
                      r.completenessPercent < 100 && r.completenessPercent >= 50
              ).length,
              criticalGaps: results.filter(
                  (r: DataCompletenessResult) => r.completenessPercent < 50
              ).length,
          }
        : null;

    return { summary, isLoading };
}

// ═══════════════════════════════════════════════════════════════
// DUPLICATE ORDER DETECTION (GAP-PRC-01)
// Fuzzy matching on vendor + items + amount within a time window.
// ═══════════════════════════════════════════════════════════════

export interface DuplicateCandidate {
    id: string;
    po_number: string;
    vendor_id: string;
    vendor_name: string;
    total_amount: number;
    created_at: string;
    similarity: number;
    matchReasons: string[];
}

/**
 * Pure function: compute similarity between two POs.
 * Exported for unit testing.
 */
export function computeOrderSimilarity(
    newOrder: { vendorId: string; amount: number; description?: string | undefined },
    existing: { vendor_id: string; total_amount: number; description?: string | null }
): { similarity: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Vendor match = 40% weight
    if (newOrder.vendorId === existing.vendor_id) {
        score += 40;
        reasons.push("Same vendor");
    }

    // Amount within 10% tolerance = 40% weight
    const amtDiff = Math.abs(newOrder.amount - existing.total_amount);
    const amtTolerance = Math.max(newOrder.amount, existing.total_amount) * 0.1;
    if (amtDiff <= amtTolerance) {
        const amtScore = 40 * (1 - amtDiff / Math.max(amtTolerance, 1));
        score += amtScore;
        if (amtDiff === 0) {
            reasons.push("Exact amount match");
        } else {
            reasons.push(
                `Amount within ${Math.round((amtDiff / Math.max(newOrder.amount, 1)) * 100)}% tolerance`
            );
        }
    }

    // Description overlap = 20% weight (simple word overlap)
    if (newOrder.description && existing.description) {
        const newWords = new Set(newOrder.description.toLowerCase().split(/\s+/));
        const existingWords = new Set(existing.description.toLowerCase().split(/\s+/));
        const overlap = [...newWords].filter((w) => existingWords.has(w)).length;
        const maxWords = Math.max(newWords.size, existingWords.size, 1);
        const descScore = 20 * (overlap / maxWords);
        if (descScore > 5) {
            score += descScore;
            reasons.push("Similar description");
        }
    }

    return { similarity: Math.round(score), reasons };
}

export function useDuplicateOrderDetection(
    vendorId: string | undefined,
    amount: number | undefined,
    description?: string,
    windowDays = 30
) {
    return useQuery({
        queryKey: ["duplicate_order_detection", vendorId, amount, windowDays],
        queryFn: async () => {
            if (!vendorId || amount === undefined) return [];

            const windowStart = new Date();
            windowStart.setDate(windowStart.getDate() - windowDays);

            const { data, error } = await fromTable("purchase_orders")
                .select(
                    "id, po_number, vendor_id, total_amount, description, created_at, vendors(name)"
                )
                .eq("vendor_id", vendorId)
                .gte("created_at", windowStart.toISOString())
                .order("created_at", { ascending: false })
                .limit(20);
            if (error) throw error;

            const candidates: DuplicateCandidate[] = [];
            for (const po of data ?? []) {
                const { similarity, reasons } = computeOrderSimilarity(
                    { vendorId, amount, description },
                    po as { vendor_id: string; total_amount: number; description?: string | null }
                );
                if (similarity >= 50) {
                    candidates.push({
                        id: (po as Record<string, unknown>).id as string,
                        po_number: ((po as Record<string, unknown>).po_number as string) ?? "",
                        vendor_id: (po as Record<string, unknown>).vendor_id as string,
                        vendor_name:
                            ((po as Record<string, unknown>).vendors as { name: string } | null)
                                ?.name ?? "",
                        total_amount: (po as Record<string, unknown>).total_amount as number,
                        created_at: (po as Record<string, unknown>).created_at as string,
                        similarity,
                        matchReasons: reasons,
                    });
                }
            }

            return candidates.sort((a, b) => b.similarity - a.similarity);
        },
        enabled: !!vendorId && amount !== undefined && amount > 0,
        staleTime: 30_000,
    });
}
