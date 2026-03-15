/* ═══════════════════════════════════════════════════════════════
   AI Admin — Providers List Endpoint
   GET /api/ai/providers
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

    // Get org
    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership || !["exec", "director"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: providers, error } = await admin
        .from("ai_providers")
        .select("id, provider_key, display_name, is_active, api_base_url")
        .order("display_name");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
