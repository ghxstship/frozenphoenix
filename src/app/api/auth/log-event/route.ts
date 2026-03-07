import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { logEventSchema } from "@/lib/validation/api-schemas";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const validated = await parseAndValidate(request, logEventSchema);
    if (!validated.success) return validated.response;

    const { event_type, metadata } = validated.data;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Attempt to insert into login_audit_log
    const { error } = await serverFromTable(supabase!, "login_audit_log")
        .insert({
            user_id: user.id,
            event_type,
            ip_address: ip,
            user_agent: userAgent,
            metadata: (metadata || {}) as Record<string, string | number | boolean | null>,
        });

    if (error) {
        // Table may not exist yet — fail silently but return 200
        // so the client doesn't treat this as an error
        return NextResponse.json({ logged: false, reason: "audit_table_unavailable" });
    }

    return NextResponse.json({ logged: true });
}
