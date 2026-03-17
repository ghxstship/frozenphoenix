import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

const ASSET_SELECT =
    "id, name, barcode, category, condition, location, owned_or_rental, rfid_tag, nfc_serial, qr_code_url, notes, organization_id";

/**
 * GET /api/assets/lookup?identifier=...&type=auto|barcode|rfid|nfc
 *
 * Multi-identifier asset lookup. Tries barcode → rfid_tag → nfc_serial
 * based on the `type` query param (default "auto").
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/assets/lookup",
        rbac: { resource: "assets", action: "read" },
    },
    async (request, { supabase, log }) => {
        const { searchParams } = new URL(request.url);
        const identifier = searchParams.get("identifier")?.trim();
        const idType = (searchParams.get("type") ?? "auto") as "barcode" | "rfid" | "nfc" | "auto";

        if (!identifier) {
            return ApiErrors.badRequest("identifier query param is required");
        }

        const tryLookup = async (column: string, matchType: string) => {
            const { data, error } = await serverFromTable(supabase, "assets")
                .select(ASSET_SELECT)
                .eq(column, identifier)
                .maybeSingle();
            if (error) {
                log.error(`[assets/lookup] lookup by ${column} failed`, { error });
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
);
