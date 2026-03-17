import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/integrations/oauth-config";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/integrations/oauth/callback/[providerType]
 *
 * Handles the OAuth 2.0 callback from a provider.
 * Exchanges the authorization code for tokens and activates the connection.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ providerType: string }> }
) {
    const { providerType } = await params;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Handle OAuth errors from provider
    if (error) {
        logger.warn("[OAuth Callback] Provider returned error", {
            providerType,
            error,
            errorDescription,
        });
        return NextResponse.redirect(
            `${baseUrl}/integrations?error=${encodeURIComponent("Authorization failed. Please try again.")}`
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `${baseUrl}/integrations?error=${encodeURIComponent("Missing authorization code or state")}`
        );
    }

    const admin = createAdminClient();
    if (!admin) {
        return NextResponse.redirect(
            `${baseUrl}/integrations?error=${encodeURIComponent("Server configuration error")}`
        );
    }

    // Verify state matches a pending connection
    const { data: connection, error: lookupErr } = await admin
        .from("provider_connections")
        .select("id, organization_id, provider_type")
        .eq("oauth_state", state)
        .eq("provider_type", providerType)
        .eq("is_active", false)
        .single();

    if (lookupErr || !connection) {
        logger.warn("[OAuth Callback] Invalid state token", { providerType, state });
        return NextResponse.redirect(
            `${baseUrl}/integrations?error=${encodeURIComponent("Invalid or expired OAuth state. Please try again.")}`
        );
    }

    // Exchange code for tokens
    const tokenResult = await exchangeCodeForTokens(providerType, code);

    if (!tokenResult.success) {
        logger.error("[OAuth Callback] Token exchange failed", {
            providerType,
            error: tokenResult.error,
        });
        // Clean up the pending connection
        await admin.from("provider_connections").delete().eq("id", connection.id);
        return NextResponse.redirect(
            `${baseUrl}/integrations?error=${encodeURIComponent("Token exchange failed. Please try again.")}`
        );
    }

    // Activate the connection with tokens
    const { error: updateErr } = await admin
        .from("provider_connections")
        .update({
            access_token: tokenResult.accessToken || null,
            refresh_token: tokenResult.refreshToken || null,
            token_expires_at: tokenResult.expiresAt || null,
            scopes: tokenResult.scopes || [],
            oauth_state: null,
            is_active: true,
            metadata: tokenResult.rawResponse || {},
            last_sync_at: new Date().toISOString(),
        })
        .eq("id", connection.id);

    if (updateErr) {
        logger.error("[OAuth Callback] Failed to activate connection", {
            connectionId: connection.id,
            error: updateErr.message,
        });
        return NextResponse.redirect(
            `${baseUrl}/integrations?error=${encodeURIComponent("Failed to save connection credentials")}`
        );
    }

    logger.info("[OAuth Callback] Connection activated", {
        connectionId: connection.id,
        providerType,
    });

    return NextResponse.redirect(`${baseUrl}/integrations/${connection.id}?connected=true`);
}
