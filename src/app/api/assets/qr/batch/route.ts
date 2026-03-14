import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import QRCode from "qrcode";

/**
 * POST /api/assets/qr/batch
 *
 * Generate QR codes for multiple assets in a single request.
 * Body: { asset_ids: string[], size?: number }
 * Returns an array of { asset_id, asset_name, barcode, qr_data_url, qr_payload }.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const body = await request.json();
    const { asset_ids, size: rawSize } = body as {
        asset_ids: string[];
        size?: number;
    };

    if (!Array.isArray(asset_ids) || asset_ids.length === 0) {
        return ApiErrors.badRequest("asset_ids array is required");
    }

    if (asset_ids.length > 100) {
        return ApiErrors.badRequest("Maximum 100 assets per batch");
    }

    const size = Math.min(Number(rawSize ?? 256), 1024);

    const { data: assets, error } = await serverFromTable(supabase, "assets")
        .select("id, name, barcode")
        .in("id", asset_ids);

    if (error) {
        return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
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
