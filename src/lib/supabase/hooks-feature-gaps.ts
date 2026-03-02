"use client";

/**
 * Supabase hooks for competitive feature gap implementations.
 * Covers: budget profitability, crew utilization, budget alerts,
 * record comments/activity, quality checks, reviews, goals, knowledge articles.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable, isSupabaseConfigured } from "./client";

export { isSupabaseConfigured };

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
        enabled: isSupabaseConfigured,
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
        enabled: isSupabaseConfigured,
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
        enabled: isSupabaseConfigured,
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
    mentioned_user_ids: string[];
    is_internal: boolean;
    created_at: string;
    updated_at: string;
    profiles?: { name: string; avatar_url: string | null } | null;
}

export function useRecordComments(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["record_comments", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("record_comments")
                .select("*, profiles(name, avatar_url)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return (data ?? []) as RecordCommentRow[];
        },
        enabled: isSupabaseConfigured && !!entityId,
    });
}

export function useCreateRecordComment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (comment: {
            entity_type: string;
            entity_id: string;
            author_id: string;
            body: string;
            parent_comment_id?: string;
            is_internal?: boolean;
        }) => {
            const { data, error } = await fromTable("record_comments")
                .insert(comment)
                .select("*, profiles(name, avatar_url)")
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
    profiles?: { name: string } | null;
}

export function useRecordActivityLog(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["record_activity_log", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("record_activity_log")
                .select("*, profiles(name)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return (data ?? []) as RecordActivityRow[];
        },
        enabled: isSupabaseConfigured && !!entityId,
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
        enabled: isSupabaseConfigured,
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
    profiles?: { name: string } | null;
}

export function useQualityChecks(entityType: string, entityId: string) {
    return useQuery({
        queryKey: ["quality_checks", entityType, entityId],
        queryFn: async () => {
            const { data, error } = await fromTable("quality_checks")
                .select("*, profiles(name)")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []) as QualityCheckRow[];
        },
        enabled: isSupabaseConfigured && !!entityId,
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
        enabled: isSupabaseConfigured,
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
                .select("*, profiles!review_feedback_requests_reviewer_id_fkey(name)")
                .order("created_at", { ascending: false });
            if (cycleId) query = query.eq("review_cycle_id", cycleId);
            if (revieweeId) query = query.eq("reviewee_id", revieweeId);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as ReviewFeedbackRow[];
        },
        enabled: isSupabaseConfigured,
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
            let query = fromTable("goals").select("*").order("created_at", { ascending: false });
            if (ownerId) query = query.eq("owner_id", ownerId);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as GoalRow[];
        },
        enabled: isSupabaseConfigured,
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
    profiles?: { name: string } | null;
}

export function useKnowledgeArticles(category?: string) {
    return useQuery({
        queryKey: ["knowledge_articles", category],
        queryFn: async () => {
            let query = fromTable("knowledge_articles")
                .select("*, profiles(name)")
                .order("updated_at", { ascending: false });
            if (category) query = query.eq("category", category);
            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as KnowledgeArticleRow[];
        },
        enabled: isSupabaseConfigured,
    });
}

export function useKnowledgeArticle(id: string) {
    return useQuery({
        queryKey: ["knowledge_article", id],
        queryFn: async () => {
            const { data, error } = await fromTable("knowledge_articles")
                .select("*, profiles(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data as KnowledgeArticleRow;
        },
        enabled: isSupabaseConfigured && !!id,
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
    knowledge_articles?: { title: string } | null;
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
        enabled: isSupabaseConfigured && !!entityId,
    });
}

export function useLinkArticle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (link: {
            article_id: string;
            entity_type: string;
            entity_id: string;
            linked_by?: string;
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
