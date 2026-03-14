import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

/**
 * POST /api/assets/[id]/nfc
 *
 * Register an NFC serial number for an asset. This is called after
 * successfully writing the asset barcode to an NFC tag, to store
 * the tag's serial number on the asset record.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;
    const body = await request.json();
    const { nfc_serial } = body as { nfc_serial: string };

    if (!nfc_serial || typeof nfc_serial !== "string") {
        return ApiErrors.badRequest("nfc_serial is required");
    }

    // Verify asset exists
    const { data: asset, error: fetchError } = await serverFromTable(supabase, "assets")
        .select("id, name, nfc_serial")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Update nfc_serial on the asset
    const { error: updateError } = await serverFromTable(supabase, "assets")
        .update({ nfc_serial } as Record<string, unknown>)
        .eq("id", id);

    if (updateError) {
        logger.error("[assets/nfc] failed to update nfc_serial", { error: updateError });
        return NextResponse.json({ error: "Failed to update NFC serial" }, { status: 500 });
    }

    const rec = asset as Record<string, unknown>;

    return NextResponse.json({
        asset_id: rec.id,
        asset_name: rec.name,
        nfc_serial,
        previous_nfc_serial: rec.nfc_serial ?? null,
        message: "NFC serial registered",
    });
}

/**
 * GET /api/assets/[id]/nfc
 *
 * Get the NFC serial number for an asset.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;

    const { data: asset, error } = await serverFromTable(supabase, "assets")
        .select("id, name, nfc_serial, barcode")
        .eq("id", id)
        .maybeSingle();

    if (error || !asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const rec = asset as Record<string, unknown>;

    return NextResponse.json({
        asset_id: rec.id,
        asset_name: rec.name,
        nfc_serial: rec.nfc_serial ?? null,
        barcode: rec.barcode ?? null,
        has_nfc: !!rec.nfc_serial,
    });
}
