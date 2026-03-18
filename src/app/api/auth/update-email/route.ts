/* ═══════════════════════════════════════════════════════════════
   POST /api/auth/update-email — Sync email to user_profiles
   
   Called after supabase.auth.updateUser({ email }) on the client.
   Updates the user_profiles.email column to match.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { serverFromTable } from "@/lib/supabase/server";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/update-email",
        mutation: true,
    },
    async (request, { supabase, user, log }) => {
        const body = await request.json().catch(() => null);
        const email = body?.email;

        if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
        }

        const { error } = await serverFromTable(supabase, "user_profiles")
            .update({ email })
            .eq("id", user.id);

        if (error) {
            log.warn("Failed to update profile email", { error: error.message });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ updated: true });
    }
);
