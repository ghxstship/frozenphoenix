/* ═══════════════════════════════════════════════════════════════
   AI Admin — Models List Endpoint
   GET /api/ai/models
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = (models ?? []).map((m) => ({
        ...m,
        provider_display_name: (m.ai_providers as { display_name: string } | null)?.display_name,
        ai_providers: undefined,
    }));

    return NextResponse.json({ models: enriched });
}
