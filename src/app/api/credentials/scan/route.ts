import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import type { IdentifierType, ScanMethodType } from "@/types/credentialing";

const CREDENTIAL_SELECT =
    "*, credential_types:credential_type_id(id, name, category, color_hex, default_zone_access)";

/**
 * Multi-identifier credential lookup.
 * Tries barcode_value → rfid_tag → nfc_serial based on identifier_type.
 * Returns { data, matched_by } or { data: null } if not found.
 */
async function lookupCredential(
    sb: Awaited<ReturnType<typeof createClient>> & object,
    identifier: string,
    identifierType: IdentifierType
) {
    const tryLookup = async (column: string, matchType: IdentifierType) => {
        const { data, error } = await serverFromTable(sb, "credential_assignments")
            .select(CREDENTIAL_SELECT)
            .eq(column, identifier)
            .maybeSingle();
        if (error) {
            logger.error(`[credentials/scan] lookup by ${column} failed`, { error });
            return null;
        }
        return data ? { data, matched_by: matchType } : null;
    };

    if (identifierType === "barcode") {
        return (
            (await tryLookup("barcode_value", "barcode")) ?? {
                data: null,
                matched_by: "barcode" as IdentifierType,
            }
        );
    }
    if (identifierType === "rfid") {
        return (
            (await tryLookup("rfid_tag", "rfid")) ?? {
                data: null,
                matched_by: "rfid" as IdentifierType,
            }
        );
    }
    if (identifierType === "nfc") {
        return (
            (await tryLookup("nfc_serial", "nfc")) ?? {
                data: null,
                matched_by: "nfc" as IdentifierType,
            }
        );
    }

    // Auto-detect: try barcode → rfid → nfc
    const byBarcode = await tryLookup("barcode_value", "barcode");
    if (byBarcode) return byBarcode;

    const byRfid = await tryLookup("rfid_tag", "rfid");
    if (byRfid) return byRfid;

    const byNfc = await tryLookup("nfc_serial", "nfc");
    if (byNfc) return byNfc;

    return { data: null, matched_by: "auto" as IdentifierType };
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const body = await request.json();

    // Support both new (identifier) and legacy (barcode_value) field names
    const identifier: string = body.identifier ?? body.barcode_value ?? "";
    const identifierType: IdentifierType = body.identifier_type ?? "auto";
    const scanMethod: ScanMethodType = body.scan_method ?? "keyboard";
    const { scan_type, zone_id, device_id, latitude, longitude, notes } = body;

    if (!identifier || !scan_type) {
        return ApiErrors.badRequest("identifier (or barcode_value) and scan_type are required");
    }

    const sb = supabase!;

    // Multi-identifier lookup
    const lookup = await lookupCredential(sb, identifier, identifierType);

    if (!lookup.data) {
        // Log a denied scan for unknown identifier
        await serverFromTable(sb, "credential_scan_log").insert({
            assignment_id: "00000000-0000-0000-0000-000000000000",
            scan_type,
            scan_result: "denied",
            scan_method: scanMethod,
            scanned_identifier: identifier,
            zone_id: zone_id ?? null,
            device_id: device_id ?? null,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            scanned_by: user.id,
            scanned_at: new Date().toISOString(),
            notes: `Unknown identifier: ${identifier}`,
        } as Record<string, unknown>);

        return NextResponse.json({
            result: "denied",
            assignment: null,
            credential_type: null,
            message: "Credential not found",
            matched_by: lookup.matched_by,
            scan_method: scanMethod,
        });
    }

    const rec = lookup.data as Record<string, unknown>;
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
    const { error: scanError } = await serverFromTable(sb, "credential_scan_log").insert({
        organization_id: rec.organization_id,
        assignment_id: rec.id,
        scan_type,
        scan_result: scanResult,
        scan_method: scanMethod,
        scanned_identifier: identifier,
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
        assignment: lookup.data,
        credential_type: rec.credential_types ?? null,
        message,
        matched_by: lookup.matched_by,
        scan_method: scanMethod,
    });
}
