/* ═══════════════════════════════════════════════════════════════
   AI Admin — Providers List Endpoint
   GET /api/ai/providers
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/ai/providers",
        rbac: { resource: "ai", action: "read" },
    },
    async (_request, { supabase, user, log }) => {
        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        // Get org
        const { data: membership } = await supabase
            .from("org_memberships")
            .select("organization_id, role")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership || !["exec", "director"].includes(membership.role)) {
            return ApiErrors.forbidden("Requires exec or director role");
        }

        const { data: providers, error } = await admin
            .from("ai_providers")
            .select("id, provider_key, display_name, is_active, api_base_url")
            .order("display_name");

        if (error) {
            log.error("[GET /api/ai/providers]", { error });
            return ApiErrors.internalError("Failed to fetch AI providers");
        }

        // Check which providers have API keys configured
        const { data: keys } = await admin
            .from("ai_api_keys")
            .select("provider_id")
            .eq("org_id", membership.organization_id)
            .eq("is_valid", true);

        const keyProviderIds = new Set((keys ?? []).map((k) => k.provider_id));

        const enriched = (providers ?? []).map((p) => ({
            ...p,
            has_api_key: keyProviderIds.has(p.id),
        }));

        return NextResponse.json({ providers: enriched });
    }
);
