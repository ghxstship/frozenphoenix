/* ═══════════════════════════════════════════════════════════════
   AI Admin — Document Upload Endpoint
   POST /api/ai/documents/upload
   
   Accepts multipart form data with a file and triggers the
   RAG ingestion pipeline.
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDocument } from "@/lib/ai/rag/ingestion";
import { isSupportedMimeType } from "@/lib/ai/rag/extractors";
import type { DocumentSourceType } from "@/lib/ai/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership || !["exec", "director"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse multipart form data
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 413 });
    }

    if (!isSupportedMimeType(file.type)) {
        return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
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
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
        document_id: result.documentId,
        chunk_count: result.chunkCount,
        total_tokens: result.totalTokens,
        status: result.status,
    });
}
