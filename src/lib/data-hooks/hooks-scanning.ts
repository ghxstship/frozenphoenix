/* ═══════════════════════════════════════════════════════════════
   HOOKS — SCANNING
   React Query hooks for asset scanning: lookup, scan actions,
   and scan history.
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { csrfHeaders } from "@/lib/security/csrf";

// ─── Types ───────────────────────────────────────────────────

export type AssetScanAction =
    | "check_in"
    | "check_out"
    | "transfer"
    | "verify"
    | "count"
    | "damage"
    | "audit"
    | "receive"
    | "ship";

export type ScanIdentifierType = "barcode" | "rfid" | "nfc" | "auto";

export type ApiScanMethod = "keyboard" | "camera" | "rfid" | "nfc" | "file" | "api";

export interface AssetLookupResult {
    asset: Record<string, unknown> | null;
    matched_by: string;
    message?: string | undefined;
}

export interface AssetScanPayload {
    identifier: string;
    identifier_type?: ScanIdentifierType | undefined;
    scan_action: AssetScanAction;
    scan_method?: ApiScanMethod | undefined;
    location_id?: string | undefined;
    notes?: string | undefined;
}

export interface AssetScanResult {
    success: boolean;
    asset: Record<string, unknown> | null;
    matched_by: string;
    scan_action: string;
    scan_method: string;
    message: string;
    /** Client-side timestamp added by hook */
    timestamp: string;
}

// ─── Asset Lookup (GET) ──────────────────────────────────────

export function useAssetLookup(identifier: string | null, type: ScanIdentifierType = "auto") {
    return useQuery({
        queryKey: ["asset_lookup", identifier, type],
        queryFn: async (): Promise<AssetLookupResult> => {
            const params = new URLSearchParams({
                identifier: identifier!,
                type,
            });
            const res = await fetch(`/api/assets/lookup?${params}`);
            return res.json() as Promise<AssetLookupResult>;
        },
        enabled: !!identifier,
        staleTime: 30_000,
    });
}

// ─── Asset Scan (POST mutation) ──────────────────────────────

export function useAssetScan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: AssetScanPayload): Promise<AssetScanResult> => {
            const res = await fetch("/api/assets/scan", {
                method: "POST",
                headers: csrfHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Scan failed" }));
                throw new Error((err as Record<string, string>).message ?? "Scan failed");
            }
            const data = await res.json();
            return {
                ...(data as Omit<AssetScanResult, "timestamp">),
                timestamp: new Date().toISOString(),
            };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["assets"] });
            qc.invalidateQueries({ queryKey: ["asset_lookup"] });
            qc.invalidateQueries({ queryKey: ["asset_scan_history"] });
        },
    });
}

// ─── Asset Scan History ──────────────────────────────────────

/**
 * Fetch recent scan history for a specific asset or all assets.
 * Uses the /api/assets endpoint with scan log join when available,
 * falling back to a simple query.
 */
export function useAssetScanHistory(assetId?: string, limit = 50) {
    return useQuery({
        queryKey: ["asset_scan_history", assetId, limit],
        queryFn: async () => {
            const params = new URLSearchParams({ limit: String(limit) });
            if (assetId) params.set("asset_id", assetId);
            const res = await fetch(`/api/assets/scan?${params}`);
            if (!res.ok) return [];
            const data = await res.json();
            return (data as { history: Record<string, unknown>[] }).history ?? [];
        },
        staleTime: 10_000,
    });
}
