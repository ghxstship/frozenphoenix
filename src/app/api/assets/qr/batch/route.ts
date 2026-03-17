import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import QRCode from "qrcode";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { assetQrBatchSchema, validate } from "@/lib/validation/schemas";

/**
 * POST /api/assets/qr/batch
 *
 * Generate QR codes for multiple assets in a single request.
 * Body: { asset_ids: string[], size?: number }
 * Returns an array of { asset_id, asset_name, barcode, qr_data_url, qr_payload }.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/assets/qr/batch",
        mutation: true,
        rbac: { resource: "assets", action: "read" },
    },
    async (request, { supabase, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(assetQrBatchSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { asset_ids, size } = result.data;

        const { data: assets, error } = await serverFromTable(supabase, "assets")
            .select("id, name, barcode")
            .in("id", asset_ids);

        if (error) {
            log.error("[assets/qr/batch] fetch failed", { error });
            return ApiErrors.internalError("Failed to fetch assets");
        }

        const results = await Promise.all(
            (assets ?? []).map(async (a: Record<string, unknown>) => {
                const rec = a;
                const payload = (typeof rec.barcode === "string" && rec.barcode) || String(rec.id);
                const qrDataUrl = await QRCode.toDataURL(payload, {
                    width: size,
                    margin: 2,
                    errorCorrectionLevel: "M",
                });
                return {
                    asset_id: rec.id,
                    asset_name: rec.name,
                    barcode: rec.barcode,
                    qr_data_url: qrDataUrl,
                    qr_payload: payload,
                };
            })
        );

        return NextResponse.json({
            codes: results,
            count: results.length,
            size,
        });
    }
);
