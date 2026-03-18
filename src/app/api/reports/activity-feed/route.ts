import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/reports/activity-feed?limit=50
 *
 * Gap #36: Activity feed on home dashboard
 * Returns a chronological feed of recent changes across the org.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/reports/activity-feed",
        rbac: { resource: "dashboard", action: "read" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);

        // Fetch recent record_comments (activity log entries)
        const { data: comments } = await serverFromTable(supabase, "record_comments")
            .select("id, entity_type, entity_id, body, is_system, created_at, user_id")
            .eq("organization_id", orgId)
            .order("created_at", { ascending: false })
            .limit(limit);

        // Fetch recent notifications as supplementary activity
        const { data: notifications } = await serverFromTable(supabase, "notifications")
            .select("id, type, title, message, entity_type, entity_id, created_at, user_id")
            .eq("organization_id", orgId)
            .order("created_at", { ascending: false })
            .limit(limit);

        type ActivityItem = {
            id: string;
            source: string;
            type: string;
            title: string;
            detail: string | null;
            entity_type: string | null;
            entity_id: string | null;
            user_id: string | null;
            created_at: string;
        };

        const activities: ActivityItem[] = [];

        if (comments) {
            for (const c of comments as Array<Record<string, unknown>>) {
                activities.push({
                    id: c.id as string,
                    source: (c.is_system as boolean) ? "system" : "user",
                    type: "comment",
                    title: (c.is_system as boolean) ? "System activity" : "Comment added",
                    detail: (c.body as string) ?? null,
                    entity_type: (c.entity_type as string) ?? null,
                    entity_id: (c.entity_id as string) ?? null,
                    user_id: (c.user_id as string) ?? null,
                    created_at: (c.created_at as string) ?? new Date().toISOString(),
                });
            }
        }

        if (notifications) {
            for (const n of notifications as Array<Record<string, unknown>>) {
                activities.push({
                    id: n.id as string,
                    source: "notification",
                    type: (n.type as string) ?? "info",
                    title: (n.title as string) ?? "",
                    detail: (n.message as string) ?? null,
                    entity_type: (n.entity_type as string) ?? null,
                    entity_id: (n.entity_id as string) ?? null,
                    user_id: (n.user_id as string) ?? null,
                    created_at: (n.created_at as string) ?? new Date().toISOString(),
                });
            }
        }

        // Sort by created_at descending and deduplicate
        activities.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json({ data: activities.slice(0, limit) });
    }
);
