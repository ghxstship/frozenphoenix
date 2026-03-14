/* ═══════════════════════════════════════════════════════════════
   AI Admin — Knowledge Base Documents Endpoint
   GET /api/ai/documents
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership || !["exec", "director"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: documents, error } = await admin
        .from("ai_documents")
        .select(
            "id, title, source_type, file_name, file_size, processing_status, chunk_count, total_tokens, created_at"
        )
        .eq("org_id", membership.organization_id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: documents ?? [] });
}
