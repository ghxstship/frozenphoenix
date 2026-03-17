import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { createHash } from "crypto";

/**
 * POST /api/portal/[token]/submit
 *
 * Unauthenticated — token IS the auth.
 * Allows collaborators to submit/update requirement status + upload URL.
 *
 * Body: { requirement_id: string, upload_url?: string, notes?: string }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    if (!token || token.length < 10) {
        return NextResponse.json({ error: { message: "Invalid portal token" } }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: { message: "Service unavailable" } }, { status: 503 });
    }

    // Validate token
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data: pat, error: patError } = await serverFromTable(supabase, "portal_access_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .eq("is_active", true)
        .single();

    if (patError || !pat) {
        return NextResponse.json(
            { error: { message: "Invalid or expired portal link" } },
            { status: 404 }
        );
    }

    const portalToken = pat as Record<string, unknown>;

    // Check expiry + revocation
    if (new Date(String(portalToken.expires_at)) < new Date()) {
        return NextResponse.json(
            { error: { message: "This portal link has expired" } },
            { status: 410 }
        );
    }
    if (portalToken.revoked_at) {
        return NextResponse.json(
            { error: { message: "This portal link has been revoked" } },
            { status: 403 }
        );
    }

    // Check permissions
    const permissions = (portalToken.permissions as string[]) ?? [];
    if (!permissions.includes("submit")) {
        return NextResponse.json(
            { error: { message: "This portal link does not have submit permissions" } },
            { status: 403 }
        );
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: { message: "Invalid JSON body" } }, { status: 400 });
    }

    const requirementId = body.requirement_id as string | undefined;
    if (!requirementId) {
        return NextResponse.json(
            { error: { message: "requirement_id is required" } },
            { status: 400 }
        );
    }

    const collaboratorId = portalToken.collaborator_id as string;

    // Verify the requirement belongs to this collaborator
    const { data: requirement, error: reqError } = await serverFromTable(
        supabase,
        "collaborator_requirements"
    )
        .select("id, status, project_collaborator_id")
        .eq("id", requirementId)
        .eq("project_collaborator_id", collaboratorId)
        .single();

    if (reqError || !requirement) {
        return NextResponse.json({ error: { message: "Requirement not found" } }, { status: 404 });
    }

    const reqRecord = requirement as Record<string, unknown>;
    const currentStatus = reqRecord.status as string;

    // Only allow submission from "requested" or "rejected" states
    if (currentStatus !== "requested" && currentStatus !== "rejected") {
        return NextResponse.json(
            {
                error: {
                    message: `Cannot submit a requirement in '${currentStatus}' status`,
                },
            },
            { status: 400 }
        );
    }

    // Update requirement
    const updatePayload: Record<string, unknown> = {
        status: "submitted",
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
    };

    if (body.upload_url) {
        updatePayload.upload_url = body.upload_url;
    }

    const { data: updated, error: updateError } = await serverFromTable(
        supabase,
        "collaborator_requirements"
    )
        .update(updatePayload)
        .eq("id", requirementId)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json(
            { error: { message: "Failed to submit requirement" } },
            { status: 500 }
        );
    }

    return NextResponse.json({ data: updated });
}
