import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { assetScanSchema, validate } from "@/lib/validation/schemas";

const ASSET_SELECT =
    "id, name, barcode, category, condition, location, owned_or_rental, rfid_tag, nfc_serial, qr_code_url, notes, organization_id";

/**
 * POST /api/assets/scan
 *
 * Scan an asset by barcode/RFID/NFC and perform an action (check-in, check-out, etc.).
 * Logs the scan to asset_scan_log and optionally updates the asset record.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/assets/scan",
        mutation: true,
        rbac: { resource: "assets", action: "write" },
    },
    async (request, { supabase, user, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(assetScanSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { identifier, identifier_type, scan_action, scan_method, location_id, notes } =
            result.data;

        // Multi-identifier lookup
        const tryLookup = async (column: string, matchType: string) => {
            const { data, error } = await serverFromTable(supabase, "assets")
                .select(ASSET_SELECT)
                .eq(column, identifier)
                .maybeSingle();
            if (error) {
                log.error(`[assets/scan] lookup by ${column} failed`, { error });
                return null;
            }
            return data ? { asset: data as Record<string, unknown>, matched_by: matchType } : null;
        };

        let lookup: { asset: Record<string, unknown>; matched_by: string } | null = null;

        if (identifier_type === "barcode") {
            lookup = await tryLookup("barcode", "barcode");
        } else if (identifier_type === "rfid") {
            lookup = await tryLookup("rfid_tag", "rfid");
        } else if (identifier_type === "nfc") {
            lookup = await tryLookup("nfc_serial", "nfc");
        } else {
            lookup =
                (await tryLookup("barcode", "barcode")) ??
                (await tryLookup("rfid_tag", "rfid")) ??
                (await tryLookup("nfc_serial", "nfc"));
        }

        if (!lookup) {
            return NextResponse.json(
                {
                    success: false,
                    asset: null,
                    matched_by: identifier_type,
                    scan_action,
                    message: "Asset not found",
                },
                { status: 404 }
            );
        }

        const asset = lookup.asset;
        let message = "Scan recorded";
        const updates: Record<string, unknown> = {};

        // Determine side-effects based on scan_action
        switch (scan_action) {
            case "check_in":
                updates.condition =
                    asset.condition === "needs_repair" ? "needs_repair" : asset.condition;
                message = "Asset checked in";
                break;
            case "check_out":
                message = "Asset checked out";
                break;
            case "transfer":
                if (location_id) {
                    updates.location = location_id;
                    message = `Asset transferred to ${location_id}`;
                } else {
                    message = "Transfer recorded (no destination specified)";
                }
                break;
            case "verify":
                message = "Asset verified";
                break;
            case "count":
                message = "Asset counted";
                break;
            case "damage":
                updates.condition = "needs_repair";
                message = "Damage reported";
                break;
            case "audit":
                message = "Audit scan recorded";
                break;
            case "receive":
                message = "Asset received";
                break;
            case "ship":
                message = "Asset shipped";
                break;
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await serverFromTable(supabase, "assets")
                .update(updates)
                .eq("id", asset.id as string);
            if (updateError) {
                log.error("[assets/scan] asset update failed", { error: updateError });
            }
        }

        // Log the scan (best-effort — does not block response)
        const logPayload = {
            organization_id: asset.organization_id,
            asset_id: asset.id,
            scan_action,
            scan_method,
            scanned_identifier: identifier,
            matched_by: lookup.matched_by,
            location_id: location_id ?? null,
            scanned_by: user.id,
            scanned_at: new Date().toISOString(),
            notes: notes ?? null,
        };

        serverFromTable(supabase, "asset_scan_log")
            .insert(logPayload as Record<string, unknown>)
            .then(({ error }: { error: unknown }) => {
                if (error) log.error("[assets/scan] scan log insert failed", { error });
            });

        return NextResponse.json({
            success: true,
            asset: lookup.asset,
            matched_by: lookup.matched_by,
            scan_action,
            scan_method,
            message,
        });
    }
);
