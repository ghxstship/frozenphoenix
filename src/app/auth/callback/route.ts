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
                // Auto-accept invitation if the user signed up with an invite token
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const inviteToken = user?.user_metadata?.invite_token;

                    if (inviteToken && typeof inviteToken === "string") {
                        // Accept the invitation server-side
                        const acceptUrl = `${origin}/api/invitations/${inviteToken}/accept`;
                        await fetch(acceptUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                        });

                        // Clear the invite_token from user metadata so it's not re-processed
                        await supabase.auth.updateUser({
                            data: { invite_token: null },
                        });

                        // Redirect to dashboard instead of the default next URL
                        return NextResponse.redirect(`${origin}/dashboard`);
                    }
                } catch {
                    // Auto-accept failed — continue with normal redirect
                }

                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
