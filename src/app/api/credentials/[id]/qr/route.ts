import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import QRCode from "qrcode";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";

/**
 * GET /api/credentials/[id]/qr?size=256&format=dataurl
 *
 * Generate a QR code for a credential assignment. Encodes the barcode_value
 * (or falls back to the assignment ID).
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/credentials/[id]/qr",
        rbac: { resource: "credentials", action: "read" },
    },
    async (request, { supabase }, { params }) => {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const size = Math.min(Number(searchParams.get("size") ?? 256), 1024);
        const format = searchParams.get("format") ?? "dataurl";

        const { data: assignment, error } = await serverFromTable(
            supabase,
            "credential_assignments"
        )
            .select("id, barcode_value, credential_type_id, assignee_name")
            .eq("id", id)
            .maybeSingle();

        if (error || !assignment) {
            return NextResponse.json({ error: "Credential assignment not found" }, { status: 404 });
        }

        const rec = assignment as Record<string, unknown>;
        const payload =
            (typeof rec.barcode_value === "string" && rec.barcode_value) || String(rec.id);

        if (format === "png") {
            const buffer = await QRCode.toBuffer(payload, {
                width: size,
                margin: 2,
                errorCorrectionLevel: "M",
            });
            return new NextResponse(new Uint8Array(buffer), {
                headers: {
                    "Content-Type": "image/png",
                    "Content-Disposition": `inline; filename="credential-${id}-qr.png"`,
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
            assignment_id: rec.id,
            assignee_name: rec.assignee_name,
            barcode_value: rec.barcode_value,
            qr_data_url: dataUrl,
            qr_payload: payload,
            size,
        });
    }
);
