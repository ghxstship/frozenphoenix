import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";

/**
 * GET /api/sign/[token]
 *
 * Unauthenticated — token IS the auth (e_signatures.access_token).
 * Returns contract + e_signature record for the signing UI.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    if (!token || token.length < 10) {
        return NextResponse.json(
            { error: { message: "Invalid signature token" } },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: { message: "Service unavailable" } }, { status: 503 });
    }

    // Look up e_signature by access_token
    const { data: esig, error: esigError } = await serverFromTable(supabase, "e_signatures")
        .select("*")
        .eq("access_token", token)
        .single();

    if (esigError || !esig) {
        return NextResponse.json(
            { error: { message: "Invalid or expired signature link" } },
            { status: 404 }
        );
    }

    const esigRecord = esig as Record<string, unknown>;

    // Check expiry
    if (esigRecord.expires_at && new Date(String(esigRecord.expires_at)) < new Date()) {
        return NextResponse.json(
            { error: { message: "This signature link has expired" } },
            { status: 410 }
        );
    }

    // Fetch associated contract via polymorphic entity_type/entity_id
    const entityType = esigRecord.entity_type as string;
    const entityId = esigRecord.entity_id as string;

    let contract: Record<string, unknown> | null = null;
    if (entityType === "contract" && entityId) {
        const { data } = await supabase
            .from("contracts")
            .select(
                "id, title, number, type, effective_date, expiration_date, value, description, status, project_id, counterparty_name"
            )
            .eq("id", entityId)
            .single();
        contract = data;
    }

    // Fetch project name + counterparty
    let projectName = "";
    let counterpartyName = "";
    if (contract) {
        const pid = contract.project_id as string | null;
        if (pid) {
            const { data: project } = await supabase
                .from("projects")
                .select("name")
                .eq("id", pid)
                .single();
            projectName = project?.name ?? "";
        }
        counterpartyName = String(contract.counterparty_name ?? "");
    }

    return NextResponse.json({
        data: {
            contract,
            e_signature: esigRecord,
            project_name: projectName,
            counterparty_name: counterpartyName,
        },
    });
}

/**
 * POST /api/sign/[token]
 *
 * Unauthenticated — token IS the auth.
 * Captures the typed-name electronic signature.
 *
 * Body: { typed_name: string, consent_given: boolean }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    if (!token || token.length < 10) {
        return NextResponse.json(
            { error: { message: "Invalid signature token" } },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: { message: "Service unavailable" } }, { status: 503 });
    }

    // Validate token
    const { data: esig, error: esigError } = await serverFromTable(supabase, "e_signatures")
        .select("*")
        .eq("access_token", token)
        .single();

    if (esigError || !esig) {
        return NextResponse.json(
            { error: { message: "Invalid or expired signature link" } },
            { status: 404 }
        );
    }

    const esigRecord = esig as Record<string, unknown>;

    // Check expiry
    if (esigRecord.expires_at && new Date(String(esigRecord.expires_at)) < new Date()) {
        return NextResponse.json(
            { error: { message: "This signature link has expired" } },
            { status: 410 }
        );
    }

    // Check if already signed
    if (esigRecord.signed_at) {
        return NextResponse.json(
            { error: { message: "This document has already been signed" } },
            { status: 409 }
        );
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: { message: "Invalid JSON body" } }, { status: 400 });
    }

    const typedName = body.typed_name as string | undefined;
    const consentGiven = body.consent_given as boolean | undefined;

    if (!typedName?.trim()) {
        return NextResponse.json({ error: { message: "typed_name is required" } }, { status: 400 });
    }
    if (!consentGiven) {
        return NextResponse.json(
            { error: { message: "consent_given must be true" } },
            { status: 400 }
        );
    }

    const now = new Date().toISOString();
    const ip =
        request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

    // Update e_signature record
    // Columns from migration 006: status, signed_at, signature_data, ip_address, user_agent
    const { error: updateError } = await serverFromTable(supabase, "e_signatures")
        .update({
            status: "signed",
            signed_at: now,
            signer_name: typedName.trim(),
            ip_address: ip,
            user_agent: request.headers.get("user-agent") ?? "",
            signature_data: JSON.stringify({
                type: "typed_name",
                value: typedName.trim(),
                consent: true,
                timestamp: now,
                ip,
            }),
        } as Record<string, unknown>)
        .eq("id", esigRecord.id as string);

    if (updateError) {
        return NextResponse.json(
            { error: { message: "Failed to record signature" } },
            { status: 500 }
        );
    }

    // Update contract status to "active" (signed contract becomes active)
    // e_signatures uses polymorphic entity_type/entity_id, not contract_id
    const signedEntityType = esigRecord.entity_type as string;
    const signedEntityId = esigRecord.entity_id as string;
    if (signedEntityType === "contract" && signedEntityId) {
        await supabase.from("contracts").update({ status: "active" }).eq("id", signedEntityId);
    }

    return NextResponse.json({
        data: { signed: true, signed_at: now },
    });
}
