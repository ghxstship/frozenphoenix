import { NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function GET() {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { data, error } = await serverFromTable(supabase, "v_client_invoice_aging").select("*");

    if (error) {
        logger.error("[GET /api/v-client-invoice-aging] failed", { error: error.message });
        return ApiErrors.internalError("Failed to fetch client invoice aging");
    }

    return NextResponse.json({ data });
}
