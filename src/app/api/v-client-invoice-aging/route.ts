import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/v-client-invoice-aging",
        rbac: { resource: "invoices", action: "read" },
    },
    async (_request, { supabase, log }) => {
        const { data, error } = await serverFromTable(supabase, "v_client_invoice_aging").select(
            "*"
        );

        if (error) {
            log.error("[GET /api/v-client-invoice-aging] failed", { error: error.message });
            return ApiErrors.internalError("Failed to fetch client invoice aging");
        }

        return NextResponse.json({ data });
    }
);
