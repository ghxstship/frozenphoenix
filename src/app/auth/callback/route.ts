import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Inline redirect validation to avoid importing client-side module in server route
const ALLOWED_PREFIXES = ["/dashboard", "/onboarding", "/settings", "/projects", "/invite"];

function safeRedirect(url: string | null): string {
    const fallback = "/dashboard";
    if (!url) return fallback;
    if (
        url.startsWith("http:") ||
        url.startsWith("https:") ||
        url.startsWith("//") ||
        url.startsWith("javascript:") ||
        url.includes("\\")
    ) {
        return fallback;
    }
    if (!url.startsWith("/")) return fallback;
    return ALLOWED_PREFIXES.some((p) => url.startsWith(p)) ? url : fallback;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = safeRedirect(searchParams.get("next"));

    if (code) {
        const supabase = await createClient();
        if (supabase) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
