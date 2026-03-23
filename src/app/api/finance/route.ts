/* ═══════════════════════════════════════════════════════════════
   FINANCE BFF (Backend For Frontend) ENDPOINT
   
   Consolidates 2 independent queries (invoices, purchase orders)
   into a single server-side request for the finance dashboard.
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, generateRequestId } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import { resolveRoleAndOrg } from "@/lib/api/auth-resolver";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const requestId = generateRequestId();
    const log = logger.child({ requestId, method: "GET", route: "/finance" });

    try {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = request.cookies.get("fp-user-role")?.value;
        const cachedOrgId = request.cookies.get("fp-org-id")?.value;
        const { role, orgId } = await resolveRoleAndOrg(supabase, user.id, cachedRole, cachedOrgId);

        if (!hasPermission(role, "finance", "read")) {
            return ApiErrors.forbidden(`Role "${role}" cannot read finance`);
        }

        const [purchaseOrdersResult, invoicesResult] = await Promise.all([
            serverFromTable(supabase, "purchase_orders")
                .select(
                    "id, project_id, vendor_id, total_amount, status, issued_date, vendors:vendor_id(name), purchase_order_items(description, quantity, unit_price, total)"
                )
                .eq("organization_id", orgId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(100),

            serverFromTable(supabase, "invoices")
                .select(
                    "id, vendor_id, purchase_order_id, amount, status, invoice_date, due_date, variance, vendors:vendor_id(name)"
                )
                .eq("organization_id", orgId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(100),
        ]);

        const errors: string[] = [];
        if (purchaseOrdersResult.error)
            errors.push(`purchase_orders: ${purchaseOrdersResult.error.message}`);
        if (invoicesResult.error) errors.push(`invoices: ${invoicesResult.error.message}`);

        if (errors.length > 0) {
            log.warn("Finance BFF partial failures", { errors });
        }

        const response = NextResponse.json({
            purchaseOrders: purchaseOrdersResult.data ?? [],
            invoices: invoicesResult.data ?? [],
        });

        response.headers.set("X-Request-Id", requestId);
        response.headers.set("Cache-Control", "private, max-age=0, stale-while-revalidate=30");
        return response;
    } catch (err) {
        log.error("Unhandled error in Finance BFF", {
            error: err instanceof Error ? err.message : String(err),
        });
        return ApiErrors.internalError();
    }
}
