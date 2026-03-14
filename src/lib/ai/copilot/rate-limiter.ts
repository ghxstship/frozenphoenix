/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Token Budget Rate Limiter
   
   Pre-request validation against per-user, per-role, and per-org
   token budgets stored in ai_usage_limits.
   
   Checks daily + monthly limits before allowing a request.
   Returns budget status with remaining allowance.
   ═══════════════════════════════════════════════════════════════ */

import { createAdminClient } from "@/lib/supabase/server";

// ─── Types ───────────────────────────────────────────────────

export interface BudgetCheckResult {
    allowed: boolean;
    reason?: string;
    dailyRemaining: number;
    monthlyRemaining: number;
    maxContextAllowed: number;
}

export interface BudgetCheckParams {
    userId: string;
    orgId: string;
    roleId?: string;
    estimatedTokens: number;
}

// ─── Budget Check ────────────────────────────────────────────

/**
 * Check if the user/org/role has sufficient token budget for the request.
 * Returns allowed=true if no limits are configured (permissive default).
 */
export async function checkTokenBudget(params: BudgetCheckParams): Promise<BudgetCheckResult> {
    const supabase = createAdminClient();
    if (!supabase) {
        // No DB connection — allow by default (fail-open for dev)
        return {
            allowed: true,
            dailyRemaining: Infinity,
            monthlyRemaining: Infinity,
            maxContextAllowed: Infinity,
        };
    }

    // 1. Fetch applicable usage limits (role-specific first, then org-wide fallback)
    const { data: limits } = await supabase
        .from("ai_usage_limits")
        .select("*")
        .eq("org_id", params.orgId)
        .eq("active", true)
        .order("role_id", { ascending: true, nullsFirst: false });

    if (!limits || limits.length === 0) {
        // No limits configured — allow
        return {
            allowed: true,
            dailyRemaining: Infinity,
            monthlyRemaining: Infinity,
            maxContextAllowed: Infinity,
        };
    }

    // Find the most specific limit: role-specific > org-wide (null role_id)
    const roleLimit = limits.find((l) => l.role_id === params.roleId);
    const orgLimit = limits.find((l) => l.role_id === null);
    const activeLimit = roleLimit ?? orgLimit;

    if (!activeLimit) {
        return {
            allowed: true,
            dailyRemaining: Infinity,
            monthlyRemaining: Infinity,
            maxContextAllowed: Infinity,
        };
    }

    // 2. Check per-request context limit
    if (params.estimatedTokens > activeLimit.max_context_per_request) {
        return {
            allowed: false,
            reason: `Request exceeds maximum context size (${params.estimatedTokens} > ${activeLimit.max_context_per_request} tokens).`,
            dailyRemaining: 0,
            monthlyRemaining: 0,
            maxContextAllowed: activeLimit.max_context_per_request,
        };
    }

    // 3. Check daily usage
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: dailyUsage } = await supabase
        .from("ai_usage_logs")
        .select("token_count_input, token_count_output")
        .eq("user_id", params.userId)
        .eq("org_id", params.orgId)
        .gte("created_at", todayStart.toISOString());

    const dailyTokensUsed = (dailyUsage ?? []).reduce(
        (sum, log) => sum + (log.token_count_input ?? 0) + (log.token_count_output ?? 0),
        0
    );

    const dailyRemaining = Math.max(0, activeLimit.daily_token_limit - dailyTokensUsed);

    if (dailyRemaining < params.estimatedTokens) {
        return {
            allowed: false,
            reason: `Daily token limit reached (${dailyTokensUsed}/${activeLimit.daily_token_limit} used). Resets at midnight.`,
            dailyRemaining,
            monthlyRemaining: 0,
            maxContextAllowed: activeLimit.max_context_per_request,
        };
    }

    // 4. Check monthly usage
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthlyUsage } = await supabase
        .from("ai_usage_logs")
        .select("token_count_input, token_count_output")
        .eq("user_id", params.userId)
        .eq("org_id", params.orgId)
        .gte("created_at", monthStart.toISOString());

    const monthlyTokensUsed = (monthlyUsage ?? []).reduce(
        (sum, log) => sum + (log.token_count_input ?? 0) + (log.token_count_output ?? 0),
        0
    );

    const monthlyRemaining = Math.max(0, activeLimit.monthly_token_limit - monthlyTokensUsed);

    if (monthlyRemaining < params.estimatedTokens) {
        return {
            allowed: false,
            reason: `Monthly token limit reached (${monthlyTokensUsed}/${activeLimit.monthly_token_limit} used). Resets on the 1st.`,
            dailyRemaining,
            monthlyRemaining,
            maxContextAllowed: activeLimit.max_context_per_request,
        };
    }

    return {
        allowed: true,
        dailyRemaining,
        monthlyRemaining,
        maxContextAllowed: activeLimit.max_context_per_request,
    };
}

// ─── Usage Logging ───────────────────────────────────────────

export interface LogUsageParams {
    userId: string;
    orgId: string;
    providerId: string;
    modelId?: string;
    tokenCountInput: number;
    tokenCountOutput: number;
    estimatedCost: number;
    endpointCalled: string;
    responseStatus: number;
}

/**
 * Append a usage log entry (immutable — no UPDATE/DELETE).
 */
export async function logUsage(params: LogUsageParams): Promise<void> {
    const supabase = createAdminClient();
    if (!supabase) return;

    await supabase.from("ai_usage_logs").insert({
        user_id: params.userId,
        org_id: params.orgId,
        provider_id: params.providerId,
        model_id: params.modelId,
        token_count_input: params.tokenCountInput,
        token_count_output: params.tokenCountOutput,
        estimated_cost: params.estimatedCost,
        endpoint_called: params.endpointCalled,
        response_status: params.responseStatus,
    });
}

/**
 * Calculate estimated cost from token counts and model pricing.
 */
export function estimateCost(
    inputTokens: number,
    outputTokens: number,
    costPer1kInput: number,
    costPer1kOutput: number
): number {
    return (inputTokens / 1000) * costPer1kInput + (outputTokens / 1000) * costPer1kOutput;
}
