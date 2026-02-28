import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_type, metadata } = body;

    const validEvents = [
        "login",
        "logout",
        "signup",
        "password_reset",
        "password_change",
        "mfa_enroll",
        "mfa_verify",
        "mfa_unenroll",
        "invite_accepted",
        "org_created",
        "org_switched",
        "profile_updated",
        "failed_login",
    ];

    if (!event_type || !validEvents.includes(event_type)) {
        return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Attempt to insert into login_audit_log
    const { error } = await fromTable(supabase, "login_audit_log")
        .insert({
            user_id: user.id,
            event_type,
            ip_address: ip,
            user_agent: userAgent,
            metadata: metadata || {},
        });

    if (error) {
        // Table may not exist yet — fail silently but return 200
        // so the client doesn't treat this as an error
        return NextResponse.json({ logged: false, reason: "audit_table_unavailable" });
    }

    return NextResponse.json({ logged: true });
}
