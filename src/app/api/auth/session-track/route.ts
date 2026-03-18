/* ═══════════════════════════════════════════════════════════════
   POST /api/auth/session-track — Upsert user_sessions record
   
   Called on login (creates row) and heartbeat (updates last_active_at).
   DELETE revokes the session (sets revoked_at).
   
   Requires authentication. Uses the Supabase access token hash
   as the session_token_hash for tracking.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { createClient, serverFromTable } from "@/lib/supabase/server";

function parseUserAgent(ua: string): { browser: string; os: string; deviceType: string } {
    let browser = "unknown";
    let os = "unknown";
    let deviceType: string = "desktop";

    // OS detection
    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/android/i.test(ua)) {
        os = "Android";
        deviceType = "mobile";
    } else if (/iphone/i.test(ua)) {
        os = "iOS";
        deviceType = "mobile";
    } else if (/ipad/i.test(ua)) {
        os = "iPadOS";
        deviceType = "tablet";
    }

    // Browser detection
    if (/edg\//i.test(ua)) browser = "Edge";
    else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
    else if (/firefox\//i.test(ua)) browser = "Firefox";
    else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

    return { browser, os, deviceType };
}

async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/session-track",
    },
    async (request, { supabase: _ctx, user, log }) => {
        const serverSupabase = await createClient();
        if (!serverSupabase) {
            return NextResponse.json({ tracked: false, reason: "service_unavailable" });
        }

        const {
            data: { session },
        } = await serverSupabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ tracked: false, reason: "no_session" });
        }

        const tokenHash = await hashToken(session.access_token);
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "0.0.0.0";
        const ua = request.headers.get("user-agent") || "unknown";
        const { browser, os, deviceType } = parseUserAgent(ua);

        const expiresAt = session.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Upsert: if session_token_hash already exists for this user, update last_active_at
        const { error } = await serverFromTable(serverSupabase, "user_sessions").upsert(
            {
                user_id: user.id,
                session_token_hash: tokenHash,
                ip_address: ip,
                user_agent: ua,
                device_type: deviceType,
                browser,
                os,
                is_current: true,
                last_active_at: new Date().toISOString(),
                expires_at: expiresAt,
            },
            { onConflict: "user_id,session_token_hash", ignoreDuplicates: false }
        );

        if (error) {
            log.warn("Failed to track session", { error: error.message });
            return NextResponse.json({ tracked: false, reason: error.message });
        }

        return NextResponse.json({ tracked: true });
    }
);

export const DELETE = withApiHandler(
    {
        method: "DELETE",
        route: "/api/auth/session-track",
    },
    async (_request, { supabase: _ctx, user, log }) => {
        const serverSupabase = await createClient();
        if (!serverSupabase) {
            return NextResponse.json({ revoked: false });
        }

        // Revoke all active sessions for this user (they're logging out)
        const { error } = await serverFromTable(serverSupabase, "user_sessions")
            .update({ revoked_at: new Date().toISOString(), is_current: false })
            .eq("user_id", user.id)
            .is("revoked_at", null);

        if (error) {
            log.warn("Failed to revoke sessions", { error: error.message });
        }

        return NextResponse.json({ revoked: !error });
    }
);
