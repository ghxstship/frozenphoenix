import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { createHash } from "crypto";

/**
 * POST /api/portal/[token]/crew-roster
 *
 * Unauthenticated — token IS the auth.
 * Allows collaborators to submit crew roster entries.
 *
 * Body: { crew: Array<{ first_name, last_name, role_title, ... }> }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    if (!token || token.length < 10) {
        return ApiErrors.badRequest("Invalid portal token");
    }

    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    // Validate token
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data: pat, error: patError } = await serverFromTable(supabase, "portal_access_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .eq("is_active", true)
        .single();

    if (patError || !pat) {
        return ApiErrors.notFound("Portal link");
    }

    const portalToken = pat as Record<string, unknown>;

    if (new Date(String(portalToken.expires_at)) < new Date()) {
        return ApiErrors.gone("This portal link has expired");
    }
    if (portalToken.revoked_at) {
        return ApiErrors.forbidden("This portal link has been revoked");
    }

    const permissions = (portalToken.permissions as string[]) ?? [];
    if (!permissions.includes("submit")) {
        return ApiErrors.forbidden("This portal link does not have submit permissions");
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return ApiErrors.badRequest("Invalid JSON body");
    }

    const crew = body.crew as Record<string, unknown>[] | undefined;
    if (!crew || !Array.isArray(crew) || crew.length === 0) {
        return ApiErrors.badRequest("crew array is required and must not be empty");
    }

    const collaboratorId = portalToken.collaborator_id as string;
    const projectId = portalToken.project_id as string;
    const orgId = portalToken.organization_id as string;

    // Validate each crew member has required fields
    for (const [i, member] of crew.entries()) {
        if (!member || !member.first_name || !member.last_name || !member.role_title) {
            return ApiErrors.badRequest(
                `Crew member at index ${i} is missing required fields (first_name, last_name, role_title)`
            );
        }
    }

    // Insert crew submissions
    const rows = crew.map((member) => ({
        project_collaborator_id: collaboratorId,
        project_id: projectId,
        organization_id: orgId,
        first_name: String(member.first_name),
        last_name: String(member.last_name),
        email: member.email ? String(member.email) : null,
        phone: member.phone ? String(member.phone) : null,
        role_title: String(member.role_title),
        department: member.department ? String(member.department) : null,
        needs_credentials: Boolean(member.needs_credentials ?? true),
        credential_type: member.credential_type ? String(member.credential_type) : null,
        needs_parking: Boolean(member.needs_parking ?? false),
        parking_type: member.parking_type ? String(member.parking_type) : null,
        needs_radio: Boolean(member.needs_radio ?? false),
        radio_channel: member.radio_channel ? String(member.radio_channel) : null,
        needs_uniform: Boolean(member.needs_uniform ?? false),
        uniform_size: member.uniform_size ? String(member.uniform_size) : null,
        needs_travel: Boolean(member.needs_travel ?? false),
        travel_details: member.travel_details ?? {},
        needs_lodging: Boolean(member.needs_lodging ?? false),
        lodging_details: member.lodging_details ?? {},
        dietary_restrictions: member.dietary_restrictions
            ? String(member.dietary_restrictions)
            : null,
        meal_preferences: member.meal_preferences ? String(member.meal_preferences) : null,
        status: "submitted",
    }));

    const { data: inserted, error: insertError } = await serverFromTable(
        supabase,
        "project_crew_submissions"
    )
        .insert(rows as Record<string, unknown>[])
        .select();

    if (insertError) {
        return ApiErrors.internalError("Failed to submit crew roster");
    }

    // Update the crew_roster requirement to "submitted" if one exists
    await serverFromTable(supabase, "collaborator_requirements")
        .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("project_collaborator_id", collaboratorId)
        .eq("requirement_type", "crew_roster")
        .in("status", ["requested", "rejected"]);

    return NextResponse.json(
        {
            data: inserted,
            count: (inserted as unknown[])?.length ?? 0,
        },
        { status: 201 }
    );
}
