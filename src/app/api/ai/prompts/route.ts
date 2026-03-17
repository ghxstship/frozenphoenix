/* ═══════════════════════════════════════════════════════════════
   AI Admin — System Prompts List Endpoint
   GET /api/ai/prompts
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/ai/prompts",
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

        const { data: prompts, error } = await admin
            .from("ai_system_prompts")
            .select("id, name, role_scope, prompt_text, is_default, active")
            .eq("org_id", membership.organization_id)
            .order("is_default", { ascending: false });

        if (error) {
            log.error("[GET /api/ai/prompts]", { error });
            return ApiErrors.internalError("Failed to fetch system prompts");
        }

        return NextResponse.json({ prompts: prompts ?? [] });
    }
);
