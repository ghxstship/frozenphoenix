import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

const ASSET_SELECT =
    "id, name, barcode, category, condition, location, owned_or_rental, rfid_tag, nfc_serial, qr_code_url, notes, organization_id";

/**
 * GET /api/assets/lookup?identifier=...&type=auto|barcode|rfid|nfc
 *
 * Multi-identifier asset lookup. Tries barcode → rfid_tag → nfc_serial
 * based on the `type` query param (default "auto").
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier")?.trim();
    const idType = (searchParams.get("type") ?? "auto") as "barcode" | "rfid" | "nfc" | "auto";

    if (!identifier) {
        return ApiErrors.badRequest("identifier query param is required");
    }

    const sb = supabase!;

    const tryLookup = async (column: string, matchType: string) => {
        const { data, error } = await serverFromTable(sb, "assets")
            .select(ASSET_SELECT)
            .eq(column, identifier)
            .maybeSingle();
        if (error) {
            logger.error(`[assets/lookup] lookup by ${column} failed`, { error });
            return null;
        }
        return data ? { asset: data, matched_by: matchType } : null;
    };

    let result: { asset: Record<string, unknown>; matched_by: string } | null = null;

    if (idType === "barcode") {
        result = await tryLookup("barcode", "barcode");
    } else if (idType === "rfid") {
        result = await tryLookup("rfid_tag", "rfid");
    } else if (idType === "nfc") {
        result = await tryLookup("nfc_serial", "nfc");
    } else {
        // Auto-detect: barcode → rfid → nfc
        result =
            (await tryLookup("barcode", "barcode")) ??
            (await tryLookup("rfid_tag", "rfid")) ??
            (await tryLookup("nfc_serial", "nfc"));
    }

    if (!result) {
        return NextResponse.json(
            { asset: null, matched_by: idType, message: "Asset not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        asset: result.asset,
        matched_by: result.matched_by,
    });
}
