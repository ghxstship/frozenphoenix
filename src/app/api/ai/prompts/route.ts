/* ═══════════════════════════════════════════════════════════════
   AI Admin — System Prompts List Endpoint
   GET /api/ai/prompts
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

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership || !["exec", "director"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: prompts, error } = await admin
        .from("ai_system_prompts")
        .select("id, name, role_scope, prompt_text, is_default, active")
        .eq("org_id", membership.organization_id)
        .order("is_default", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prompts: prompts ?? [] });
}
