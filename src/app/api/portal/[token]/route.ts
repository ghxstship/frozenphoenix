import { NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { createHash } from "crypto";

/**
 * GET /api/portal/[token]
 *
 * Unauthenticated endpoint — the token IS the auth.
 * Validates portal_access_token, returns project + vendor + requirements + advance items.
 * Does NOT require Supabase session (collaborators are not org members).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    if (!token || token.length < 10) {
        return ApiErrors.badRequest("Invalid portal token");
    }

    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Look up the portal access token by hash (new table, use serverFromTable)
    const { data: pat, error: patError } = await serverFromTable(supabase, "portal_access_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .eq("is_active", true)
        .single();

    if (patError || !pat) {
        return ApiErrors.notFound("Portal link");
    }

    const portalToken = pat as Record<string, unknown>;

    // Check expiry
    if (new Date(String(portalToken.expires_at)) < new Date()) {
        return ApiErrors.gone("This portal link has expired");
    }

    // Check revocation
    if (portalToken.revoked_at) {
        return ApiErrors.forbidden("This portal link has been revoked");
    }

    const projectId = portalToken.project_id as string;
    const vendorId = portalToken.vendor_id as string;
    const collaboratorId = portalToken.collaborator_id as string;

    // Update last_used_at and use_count
    await serverFromTable(supabase, "portal_access_tokens")
        .update({
            last_used_at: new Date().toISOString(),
            use_count: ((portalToken.use_count as number) ?? 0) + 1,
        } as Record<string, unknown>)
        .eq("id", portalToken.id as string);

    // Fetch project details (typed table)
    const { data: project } = await supabase
        .from("projects")
        .select("id, name, client, status, current_phase, start_date, end_date")
        .eq("id", projectId)
        .single();

    // Fetch vendor details (typed table)
    const { data: vendor } = await supabase
        .from("vendors")
        .select("id, name, contact_name, email, phone, specialty")
        .eq("id", vendorId)
        .single();

    // Fetch collaborator with requirements (new tables, use serverFromTable)
    const { data: collaborator } = await serverFromTable(supabase, "project_collaborators")
        .select(
            `
            id, status, engagement_type, scope_summary, invited_at, portal_activated_at,
            collaborator_requirements(
                id, requirement_type, label, description, status, deadline,
                is_blocking, entity_type, entity_id, submitted_at, approved_at,
                rejection_reason, custom_instructions, upload_url, sort_order
            )
        `
        )
        .eq("id", collaboratorId)
        .single();

    // Fetch advance items assigned to this vendor (typed table)
    const { data: advanceItems } = await serverFromTable(supabase, "production_advance_items")
        .select(
            `
            id, quantity_requested, quantity_confirmed, unit_cost, status,
            scheduled_delivery, notes, is_critical_path, start_date, end_date,
            operational_purpose, special_requests,
            catalog_items:catalog_item_id(name, sku, thumbnail_url, unit_of_measure),
            production_advances!inner(id, title, advance_number, status, project_id)
        `
        )
        .eq("vendor_id", vendorId)
        .is("deleted_at", null);

    // Filter advance items to this project only
    const projectAdvanceItems = (advanceItems ?? []).filter((item: Record<string, unknown>) => {
        const advance = item.production_advances as Record<string, unknown> | null;
        return advance && advance.project_id === projectId;
    });

    // Fetch crew submissions for this collaborator (new table)
    const { data: crewSubmissions } = await serverFromTable(supabase, "project_crew_submissions")
        .select("*")
        .eq("project_collaborator_id", collaboratorId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

    // Update portal_last_access_at on collaborator
    if (collaborator) {
        const collabRecord = collaborator as Record<string, unknown>;
        await serverFromTable(supabase, "project_collaborators")
            .update({
                portal_last_access_at: new Date().toISOString(),
                portal_activated_at: collabRecord.portal_activated_at ?? new Date().toISOString(),
            } as Record<string, unknown>)
            .eq("id", collaboratorId);
    }

    return NextResponse.json({
        data: {
            project,
            vendor,
            collaborator,
            advance_items: projectAdvanceItems,
            crew_submissions: crewSubmissions ?? [],
            permissions: portalToken.permissions,
            expires_at: portalToken.expires_at,
        },
    });
}
