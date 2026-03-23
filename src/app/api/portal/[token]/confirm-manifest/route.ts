import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { createHash } from "crypto";

/**
 * POST /api/portal/[token]/confirm-manifest
 *
 * Unauthenticated — token IS the auth.
 * Allows collaborators to confirm advance item quantities, specs, and delivery schedule.
 *
 * Body: { items: Array<{ item_id, quantity_confirmed, scheduled_delivery?, item_specifications?, notes? }> }
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
        .select("id, vendor_id, collaborator_id, permissions, expires_at, revoked_at")
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

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return ApiErrors.badRequest("Invalid JSON body");
    }

    const items = body.items as Record<string, unknown>[] | undefined;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return ApiErrors.badRequest("items array is required and must not be empty");
    }

    const vendorId = portalToken.vendor_id as string;
    const collaboratorId = portalToken.collaborator_id as string;
    let updated = 0;
    let errors = 0;

    for (const item of items) {
        if (!item.item_id) continue;

        const updatePayload: Record<string, unknown> = {
            status: "confirmed",
            confirmed_at: new Date().toISOString(),
        };

        if (item.quantity_confirmed !== undefined) {
            updatePayload.quantity_confirmed = Number(item.quantity_confirmed);
        }
        if (item.scheduled_delivery) {
            updatePayload.scheduled_delivery = String(item.scheduled_delivery);
        }
        if (item.item_specifications) {
            updatePayload.item_specifications = item.item_specifications;
        }
        if (item.notes) {
            updatePayload.notes = String(item.notes);
        }

        const { error: updateError } = await serverFromTable(supabase, "production_advance_items")
            .update(updatePayload)
            .eq("id", String(item.item_id))
            .eq("vendor_id", vendorId)
            .is("deleted_at", null);

        if (updateError) {
            errors++;
        } else {
            updated++;
        }
    }

    // Update the advance_manifest requirement to "submitted" if one exists
    await serverFromTable(supabase, "collaborator_requirements")
        .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("project_collaborator_id", collaboratorId)
        .eq("requirement_type", "advance_manifest")
        .in("status", ["requested", "rejected"]);

    return NextResponse.json({
        data: { updated, errors },
    });
}
