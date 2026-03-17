import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { assetNfcRegisterSchema, validate } from "@/lib/validation/schemas";

/**
 * POST /api/assets/[id]/nfc
 *
 * Register an NFC serial number for an asset. This is called after
 * successfully writing the asset barcode to an NFC tag, to store
 * the tag's serial number on the asset record.
 */
export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/assets/[id]/nfc",
        mutation: true,
        rbac: { resource: "assets", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id } = await params;
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(assetNfcRegisterSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { nfc_serial } = result.data;

        // Verify asset exists
        const { data: asset, error: fetchError } = await serverFromTable(supabase, "assets")
            .select("id, name, nfc_serial")
            .eq("id", id)
            .maybeSingle();

        if (fetchError || !asset) {
            return ApiErrors.notFound("Asset");
        }

        // Update nfc_serial on the asset
        const { error: updateError } = await serverFromTable(supabase, "assets")
            .update({ nfc_serial } as Record<string, unknown>)
            .eq("id", id);

        if (updateError) {
            log.error("[assets/nfc] failed to update nfc_serial", { error: updateError });
            return ApiErrors.internalError("Failed to update NFC serial");
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
);

/**
 * GET /api/assets/[id]/nfc
 *
 * Get the NFC serial number for an asset.
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/assets/[id]/nfc",
        rbac: { resource: "assets", action: "read" },
    },
    async (_request, { supabase }, { params }) => {
        const { id } = await params;

        const { data: asset, error } = await serverFromTable(supabase, "assets")
            .select("id, name, nfc_serial, barcode")
            .eq("id", id)
            .maybeSingle();

        if (error || !asset) {
            return ApiErrors.notFound("Asset");
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
);
