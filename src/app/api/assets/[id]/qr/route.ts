import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import QRCode from "qrcode";

/**
 * GET /api/assets/[id]/qr?size=256&format=png
 *
 * Generate a QR code for a specific asset. The QR encodes the asset's barcode
 * (or falls back to the asset ID). Returns a data-URL string or raw PNG buffer.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const size = Math.min(Number(searchParams.get("size") ?? 256), 1024);
    const format = searchParams.get("format") ?? "dataurl";

    const { data: asset, error } = await serverFromTable(supabase, "assets")
        .select("id, name, barcode")
        .eq("id", id)
        .maybeSingle();

    if (error || !asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const rec = asset as Record<string, unknown>;
    const payload = (typeof rec.barcode === "string" && rec.barcode) || String(rec.id);

    if (format === "png") {
        const buffer = await QRCode.toBuffer(payload, {
            width: size,
            margin: 2,
            errorCorrectionLevel: "M",
        });
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": `inline; filename="asset-${id}-qr.png"`,
                "Cache-Control": "public, max-age=86400",
            },
        });
    }

    const dataUrl = await QRCode.toDataURL(payload, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "M",
    });

    return NextResponse.json({
        asset_id: rec.id,
        asset_name: rec.name,
        barcode: rec.barcode,
        qr_data_url: dataUrl,
        qr_payload: payload,
        size,
    });
}
