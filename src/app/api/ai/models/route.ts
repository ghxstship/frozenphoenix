/* ═══════════════════════════════════════════════════════════════
   AI Admin — Models List Endpoint
   GET /api/ai/models
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/ai/models",
        rbac: { resource: "ai", action: "read" },
    },
    async (_request, { log }) => {
        const admin = createAdminClient();
        if (!admin) return ApiErrors.serviceUnavailable();

        const { data: models, error } = await admin
            .from("ai_models")
            .select(
                `
                id, provider_id, model_key, display_name, is_active,
                context_window, cost_per_1k_input, cost_per_1k_output,
                supports_streaming, supports_tools, supports_vision,
                ai_providers ( display_name )
            `
            )
            .order("display_name");

        if (error) {
            log.error("[GET /api/ai/models]", { error });
            return ApiErrors.internalError("Failed to fetch AI models");
        }

        const enriched = (models ?? []).map((m) => ({
            ...m,
            provider_display_name: (m.ai_providers as { display_name: string } | null)
                ?.display_name,
            ai_providers: undefined,
        }));

        return NextResponse.json({ models: enriched });
    }
);
