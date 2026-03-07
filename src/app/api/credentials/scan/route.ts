import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const body = await request.json();
    const { barcode_value, scan_type, zone_id, device_id, latitude, longitude, notes } = body;

    if (!barcode_value || !scan_type) {
        return ApiErrors.badRequest("barcode_value and scan_type are required");
    }

    const sb = supabase!;

    // Look up the credential assignment by barcode
    const { data: assignment, error: lookupError } = await serverFromTable(sb, "credential_assignments")
        .select("*, credential_types:credential_type_id(id, name, category, color_hex, default_zone_access)")
        .eq("barcode_value", barcode_value)
        .single();

    if (lookupError || !assignment) {
        // Log a denied scan for unknown barcode
        await serverFromTable(sb, "credential_scan_log").insert({
            assignment_id: "00000000-0000-0000-0000-000000000000",
            scan_type,
            scan_result: "denied",
            zone_id: zone_id ?? null,
            device_id: device_id ?? null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            scanned_by: user.id,
            scanned_at: new Date().toISOString(),
            notes: `Unknown barcode: ${barcode_value}`,
        } as Record<string, unknown>);

        return NextResponse.json({
            result: "denied",
            assignment: null,
            credential_type: null,
            message: "Credential not found",
        });
    }

    const rec = assignment as Record<string, unknown>;
    const status = rec.status as string;
    const zoneAccess = rec.zone_access as string[];
    const validUntil = rec.valid_until as string | null;

    // Determine scan result
    let scanResult = "valid";
    let message = "Access granted";

    if (status === "revoked") {
        scanResult = "revoked";
        message = "Credential has been revoked";
    } else if (status === "expired" || (validUntil && new Date(validUntil) < new Date())) {
        scanResult = "expired";
        message = "Credential has expired";
    } else if (zone_id && zoneAccess.length > 0 && !zoneAccess.includes(zone_id)) {
        scanResult = "zone_denied";
        message = `Access denied for zone ${zone_id}`;
    } else if (!["approved", "issued", "checked_in"].includes(status)) {
        scanResult = "denied";
        message = `Credential status is ${status}`;
    }

    // Log the scan
    const { error: scanError } = await serverFromTable(sb, "credential_scan_log")
        .insert({
            organization_id: rec.organization_id,
            assignment_id: rec.id,
            scan_type,
            scan_result: scanResult,
            zone_id: zone_id ?? null,
            device_id: device_id ?? null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            scanned_by: user.id,
            scanned_at: new Date().toISOString(),
            notes: notes ?? null,
        } as Record<string, unknown>);

    if (scanError) {
        logger.error("[POST /api/credentials/scan] scan log insert failed", { error: scanError });
    }

    // Update assignment status on successful check-in/check-out
    if (scanResult === "valid") {
        if (scan_type === "check_in" && status !== "checked_in") {
            await serverFromTable(sb, "credential_assignments")
                .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
                .eq("id", rec.id as string);
        } else if (scan_type === "check_out") {
            await serverFromTable(sb, "credential_assignments")
                .update({ status: "checked_out", checked_out_at: new Date().toISOString() })
                .eq("id", rec.id as string);
        }
    }

    return NextResponse.json({
        result: scanResult,
        assignment,
        credential_type: rec.credential_types ?? null,
        message,
    });
}
