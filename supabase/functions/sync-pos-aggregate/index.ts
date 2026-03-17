/**
 * Edge Function: sync-pos-aggregate
 * Scheduled function (via pg_cron or Supabase scheduled invocation) that
 * aggregates POS transaction data into live_financial_snapshots and
 * foh_zone_readings for real-time dashboard consumption.
 *
 * Can also be invoked manually via POST with optional filters:
 * {
 *   "event_id": "uuid",       // optional, scope to specific event
 *   "time_window_hours": 24   // optional, default 24h lookback
 * }
 */

import {
    createServiceClient,
    errorResponse,
    jsonResponse,
    requireServiceRoleAuth,
} from "../_shared/webhook-utils.ts";

interface AggregateRequest {
    event_id?: string;
    time_window_hours?: number;
}

Deno.serve(async (req: Request) => {
    if (req.method !== "POST" && req.method !== "GET") {
        return errorResponse("Method not allowed", 405);
    }

    const authError = requireServiceRoleAuth(req);
    if (authError) return authError;

    const supabase = createServiceClient();

    let params: AggregateRequest = {};
    if (req.method === "POST") {
        try {
            params = await req.json();
        } catch {
            // Empty body is fine for scheduled invocations
        }
    }

    const timeWindowHours = params.time_window_hours ?? 24;
    const cutoff = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();

    try {
        // -------------------------------------------------------------------
        // 1. Aggregate POS transactions by category
        // -------------------------------------------------------------------
        let txnQuery = supabase
            .from("pos_transactions")
            .select("*")
            .gte("completed_at", cutoff)
            .order("completed_at", { ascending: false });

        if (params.event_id) {
            txnQuery = txnQuery.eq("event_id", params.event_id);
        }

        const { data: transactions, error: txnError } = await txnQuery;

        if (txnError) {
            console.error("Failed to fetch POS transactions:", txnError.message);
            return errorResponse("Failed to fetch transactions", 500);
        }

        const txns = (transactions ?? []) as Record<string, unknown>[];

        // -------------------------------------------------------------------
        // 2. Compute aggregates
        // -------------------------------------------------------------------
        const totalRevenue = txns.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
        const totalTax = txns.reduce((sum, t) => sum + (Number(t.tax_amount) || 0), 0);
        const totalTips = txns.reduce((sum, t) => sum + (Number(t.tip_amount) || 0), 0);
        const transactionCount = txns.length;

        // Category breakdown
        const byCategory: Record<string, { revenue: number; count: number }> = {};
        for (const t of txns) {
            const cat = (t.category as string) || "uncategorized";
            if (!byCategory[cat]) byCategory[cat] = { revenue: 0, count: 0 };
            byCategory[cat].revenue += Number(t.total_amount) || 0;
            byCategory[cat].count++;
        }

        // Payment method breakdown
        const byPaymentMethod: Record<string, { revenue: number; count: number }> = {};
        for (const t of txns) {
            const method = (t.payment_method as string) || "unknown";
            if (!byPaymentMethod[method]) byPaymentMethod[method] = { revenue: 0, count: 0 };
            byPaymentMethod[method].revenue += Number(t.total_amount) || 0;
            byPaymentMethod[method].count++;
        }

        // Hourly breakdown for trending
        const byHour: Record<string, number> = {};
        for (const t of txns) {
            const hour = new Date(t.completed_at as string).toISOString().slice(0, 13) + ":00:00Z";
            byHour[hour] = (byHour[hour] ?? 0) + (Number(t.total_amount) || 0);
        }

        // -------------------------------------------------------------------
        // 3. F&B revenue for foh_zone_readings (if event scoped)
        // -------------------------------------------------------------------
        const fbRevenue =
            (byCategory["food"]?.revenue ?? 0) + (byCategory["beverage"]?.revenue ?? 0);
        const merchRevenue = byCategory["merchandise"]?.revenue ?? 0;

        // -------------------------------------------------------------------
        // 4. Build aggregate summary
        // -------------------------------------------------------------------
        const summary = {
            time_window_hours: timeWindowHours,
            cutoff,
            generated_at: new Date().toISOString(),
            event_id: params.event_id ?? null,
            totals: {
                revenue: totalRevenue,
                tax: totalTax,
                tips: totalTips,
                transaction_count: transactionCount,
                avg_transaction: transactionCount > 0 ? totalRevenue / transactionCount : 0,
            },
            by_category: byCategory,
            by_payment_method: byPaymentMethod,
            by_hour: byHour,
            fb_revenue: fbRevenue,
            merch_revenue: merchRevenue,
        };

        // -------------------------------------------------------------------
        // 5. Update live_financial_snapshots if event scoped
        // -------------------------------------------------------------------
        if (params.event_id) {
            const { data: existingSnapshot } = await supabase
                .from("live_financial_snapshots")
                .select("id")
                .eq("event_id", params.event_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (existingSnapshot) {
                await supabase
                    .from("live_financial_snapshots")
                    .update({
                        revenue_fb: fbRevenue,
                        revenue_merch: merchRevenue,
                        revenue_other: totalRevenue - fbRevenue - merchRevenue,
                        metadata: { pos_aggregate: summary },
                    })
                    .eq("id", existingSnapshot.id);
            }
        }

        return jsonResponse({
            status: "completed",
            summary,
        });
    } catch (err) {
        console.error("POS aggregation failed:", (err as Error).message);
        return errorResponse(`Aggregation failed: ${(err as Error).message}`, 500);
    }
});
