import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import type { IdentifierType, ScanMethodType } from "@/types/credentialing";
import { type HandlerContext, withApiHandler } from "@/lib/api/with-api-handler";
import { credentialScanSchema, validate } from "@/lib/validation/schemas";

const CREDENTIAL_SELECT =
    "*, credential_types:credential_type_id(id, name, category, color_hex, default_zone_access)";

/**
 * Multi-identifier credential lookup.
 * Tries barcode_value → rfid_tag → nfc_serial based on identifier_type.
 * Returns { data, matched_by } or { data: null } if not found.
 */
async function lookupCredential(
    sb: HandlerContext["supabase"],
    identifier: string,
    identifierType: IdentifierType,
    log: HandlerContext["log"]
) {
    const tryLookup = async (column: string, matchType: IdentifierType) => {
        const { data, error } = await serverFromTable(sb, "credential_assignments")
            .select(CREDENTIAL_SELECT)
            .eq(column, identifier)
            .maybeSingle();
        if (error) {
            log.error(`[credentials/scan] lookup by ${column} failed`, { error });
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

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/credentials/scan",
        mutation: true,
        rbac: { resource: "credentials", action: "write" },
    },
    async (request, { supabase, user, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(credentialScanSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        // Support both new (identifier) and legacy (barcode_value) field names
        const identifier: string = result.data.identifier ?? result.data.barcode_value ?? "";
        const identifierType: IdentifierType = result.data.identifier_type as IdentifierType;
        const scanMethod: ScanMethodType = result.data.scan_method as ScanMethodType;
        const { scan_type, zone_id, device_id, latitude, longitude, notes } = result.data;

        const sb = supabase;

        // Multi-identifier lookup
        const lookup = await lookupCredential(sb, identifier, identifierType, log);

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
            log.error("[POST /api/credentials/scan] scan log insert failed", { error: scanError });
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
);
