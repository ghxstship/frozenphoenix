import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/signout",
        authRoute: true,
    },
    async (_request, { supabase }) => {
        await supabase.auth.signOut();

        // Redirect to login — this runs server-side so cookies are properly cleared
        // before the redirect response reaches the browser.
        return NextResponse.json({ success: true });
    }
);
