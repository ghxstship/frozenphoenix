import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createClient();

    if (supabase) {
        await supabase.auth.signOut();
    }

    // Redirect to login — this runs server-side so cookies are properly cleared
    // before the redirect response reaches the browser.
    return NextResponse.json({ success: true });
}
