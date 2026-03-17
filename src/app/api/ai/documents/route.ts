/* ═══════════════════════════════════════════════════════════════
   AI Admin — Knowledge Base Documents Endpoint
   GET /api/ai/documents
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/ai/documents",
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

        const { data: documents, error } = await admin
            .from("ai_documents")
            .select(
                "id, title, source_type, original_filename, processing_status, chunk_count, total_tokens, created_at"
            )
            .eq("org_id", membership.organization_id)
            .order("created_at", { ascending: false });

        if (error) {
            log.error("[GET /api/ai/documents]", { error });
            return ApiErrors.internalError("Failed to fetch AI documents");
        }

        return NextResponse.json({ documents: documents ?? [] });
    }
);
