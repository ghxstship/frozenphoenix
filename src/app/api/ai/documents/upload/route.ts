/* ═══════════════════════════════════════════════════════════════
   AI Admin — Document Upload Endpoint
   POST /api/ai/documents/upload
   
   Accepts multipart form data with a file and triggers the
   RAG ingestion pipeline.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/ai/rag/ingestion";
import { isSupportedMimeType } from "@/lib/ai/rag/extractors";
import type { DocumentSourceType } from "@/lib/ai/types";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/ai/documents/upload",
        mutation: true,
        rbac: { resource: "ai", action: "write" },
    },
    async (req, { supabase, user }) => {
        const { data: membership } = await supabase
            .from("org_memberships")
            .select("organization_id, role")
            .eq("user_id", user.id)
            .limit(1)
            .single();

        if (!membership || !["exec", "director"].includes(membership.role)) {
            return ApiErrors.forbidden("Requires exec or director role");
        }

        // Parse multipart form data
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return ApiErrors.badRequest("Invalid form data");
        }

        const file = formData.get("file") as File | null;
        if (!file) {
            return ApiErrors.badRequest("No file provided");
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 413 });
        }

        if (!isSupportedMimeType(file.type)) {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
        }

        const sourceType = (formData.get("source_type") as DocumentSourceType) ?? "upload";

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Run ingestion pipeline
        const result = await ingestDocument({
            fileBuffer: buffer,
            mimeType: file.type,
            fileName: file.name,
            orgId: membership.organization_id,
            uploadedBy: user.id,
            sourceType,
        });

        if (result.status === "failed") {
            return ApiErrors.internalError("Document processing failed");
        }

        return NextResponse.json({
            document_id: result.documentId,
            chunk_count: result.chunkCount,
            total_tokens: result.totalTokens,
            status: result.status,
        });
    }
);
