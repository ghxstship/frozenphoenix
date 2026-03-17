/* ═══════════════════════════════════════════════════════════════
   AI Admin — Usage Limits Endpoint
   GET /api/ai/limits
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/ai/limits",
        rbac: { resource: "ai", action: "read" },
    },
    async (_request, { supabase, user, log }) => {
        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        const { data: membership } = await supabase
            .from("org_memberships")
            .select("organization_id, role")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership || !["exec", "director"].includes(membership.role)) {
            return ApiErrors.forbidden("Requires exec or director role");
        }

        const { data: limits, error } = await admin
            .from("ai_usage_limits")
            .select(
                "id, role_id, daily_token_limit, monthly_token_limit, max_context_per_request, active"
            )
            .eq("org_id", membership.organization_id)
            .order("role_id", { ascending: true, nullsFirst: false });

        if (error) {
            log.error("[GET /api/ai/limits]", { error });
            return ApiErrors.internalError("Failed to fetch AI usage limits");
        }

        return NextResponse.json({ limits: limits ?? [] });
    }
);
