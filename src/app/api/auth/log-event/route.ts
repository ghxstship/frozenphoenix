import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { parseAndValidate } from "@/lib/api-utils";
import { logEventSchema } from "@/lib/validation/api-schemas";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/log-event",
        authRoute: true,
    },
    async (request, { supabase, user }) => {
        const validated = await parseAndValidate(request, logEventSchema);
        if (!validated.success) return validated.response;

        const { event_type, metadata, error_code, organization_id } = validated.data;

        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";

        const userAgent = request.headers.get("user-agent") || "unknown";

        // Attempt to insert into login_audit_log
        const { error } = await serverFromTable(supabase, "login_audit_log").insert({
            user_id: user.id,
            event_type,
            ip_address: ip,
            user_agent: userAgent,
            metadata: (metadata || {}) as Record<string, string | number | boolean | null>,
            ...(error_code ? { error_code } : {}),
            ...(organization_id ? { organization_id } : {}),
        });

        if (error) {
            // Table may not exist yet — fail silently but return 200
            // so the client doesn't treat this as an error
            return NextResponse.json({ logged: false, reason: "audit_table_unavailable" });
        }

        return NextResponse.json({ logged: true });
    }
);
