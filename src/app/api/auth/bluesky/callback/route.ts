import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBlueskyOAuthClient } from "@/lib/auth/bluesky-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getPublicUrl(): string {
    return (
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://127.0.0.1:3000")
    );
}

export async function GET(request: NextRequest) {
    const publicUrl = getPublicUrl();

    try {
        const params = request.nextUrl.searchParams;
        const client = await getBlueskyOAuthClient();

        // Exchange the authorization code for an AT Protocol session
        const { session: atpSession } = await client.callback(params);
        const did = atpSession.did;

        // The DID is the primary identifier. Handle resolution is best-effort
        // via the AT Protocol handle resolution endpoint.
        let blueskyHandle: string | null = null;
        try {
            const resolveUrl = `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=`;
            // Reverse lookup: resolve DID → handle via the PLC directory
            const plcRes = await fetch(`https://plc.directory/${encodeURIComponent(did)}`);
            if (plcRes.ok) {
                const plcDoc = await plcRes.json();
                if (Array.isArray(plcDoc.alsoKnownAs)) {
                    const handleUri = plcDoc.alsoKnownAs.find((aka: string) =>
                        aka.startsWith("at://")
                    );
                    if (handleUri) {
                        blueskyHandle = handleUri.replace("at://", "");
                    }
                }
            }
            void resolveUrl;
        } catch {
            // Handle resolution failed — non-critical, continue without it
        }

        // ─── Bridge into Supabase Auth ──────────────────────────
        // Use service role to find or create a Supabase user linked to this DID.
        const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: { persistSession: false },
        });

        // Check if a user_profiles row already exists for this DID
        const { data: existingProfile } = await adminSupabase
            .from("user_profiles")
            .select("id, email")
            .eq("atproto_did", did)
            .single();

        let userId: string;

        if (existingProfile) {
            // Existing user — just update the handle if it changed
            userId = existingProfile.id;
            if (blueskyHandle) {
                await adminSupabase
                    .from("user_profiles")
                    .update({ bluesky_handle: blueskyHandle })
                    .eq("id", userId);
            }
        } else {
            // New user — create a Supabase auth user + profile via admin API.
            // AT Protocol doesn't give us an email, so we generate a placeholder
            // using the DID as a unique identifier.
            const placeholderEmail = `${did.replace(/[^a-zA-Z0-9]/g, "_")}@atproto.local`;
            const displayName = blueskyHandle || did.slice(0, 20);

            const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser(
                {
                    email: placeholderEmail,
                    email_confirm: true,
                    user_metadata: {
                        name: displayName,
                        atproto_did: did,
                        bluesky_handle: blueskyHandle,
                        auth_provider: "bluesky",
                    },
                }
            );

            if (createError || !newUser.user) {
                void createError;
                return NextResponse.redirect(
                    new URL("/login?error=bluesky_account_creation_failed", publicUrl)
                );
            }

            userId = newUser.user.id;

            // Ensure user_profiles row exists with DID + handle
            // (the handle_new_user trigger should create it, but we ensure the DID is set)
            await adminSupabase.from("user_profiles").upsert(
                {
                    id: userId,
                    email: placeholderEmail,
                    display_name: displayName,
                    atproto_did: did,
                    bluesky_handle: blueskyHandle,
                },
                { onConflict: "id" }
            );
        }

        // Generate a Supabase magic link token for this user so they get a real session.
        // We use generateLink to create a one-time sign-in URL server-side.
        const userEmail =
            existingProfile?.email || `${did.replace(/[^a-zA-Z0-9]/g, "_")}@atproto.local`;

        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
            type: "magiclink",
            email: userEmail,
            options: {
                redirectTo: `${publicUrl}/auth/callback?next=/dashboard`,
            },
        });

        if (linkError || !linkData) {
            void linkError;
            return NextResponse.redirect(new URL("/login?error=bluesky_session_failed", publicUrl));
        }

        // Extract the token_hash and redirect through Supabase's verify endpoint
        // to establish the session with proper cookies.
        const hashed_token = linkData.properties?.hashed_token;
        if (hashed_token) {
            const verifyUrl = new URL(`${SUPABASE_URL}/auth/v1/verify`);
            verifyUrl.searchParams.set("token", hashed_token);
            verifyUrl.searchParams.set("type", "magiclink");
            verifyUrl.searchParams.set("redirect_to", `${publicUrl}/auth/callback?next=/dashboard`);
            return NextResponse.redirect(verifyUrl.toString());
        }

        // Fallback: redirect to login with success indication
        return NextResponse.redirect(new URL("/login?bluesky=linked", publicUrl));
    } catch (error) {
        void error;
        return NextResponse.redirect(new URL("/login?error=bluesky_callback_failed", publicUrl));
    }
}
