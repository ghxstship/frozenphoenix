import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { buildAuthorizationUrl, OAUTH_PROVIDERS } from "@/lib/integrations/oauth-config";
import crypto from "crypto";

const authorizeSchema = z.object({
    provider_type: z.string().min(1),
    display_name: z.string().optional(),
    event_id: z.string().uuid().optional(),
});

/**
 * POST /api/integrations/oauth/authorize
 *
 * Initiates an OAuth 2.0 flow for a provider.
 * Returns the authorization URL to redirect the user to.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/integrations/oauth/authorize",
        mutation: true,
        rbac: { resource: "provider_connections", action: "write" },
    },
    async (request, { supabase, user }) => {
        const parsed = await parseAndValidate(request, authorizeSchema);
        if (!parsed.success) return parsed.response;

        const { provider_type, display_name, event_id } = parsed.data;

        // Verify provider supports OAuth
        if (!OAUTH_PROVIDERS[provider_type]) {
            return ApiErrors.badRequest(`Provider "${provider_type}" does not support OAuth`);
        }

        // Get user's org
        const { data: org } = await supabase
            .from("org_memberships")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("is_default_org", true)
            .single();

        if (!org) return ApiErrors.badRequest("No organization found for user");

        // Generate state token for CSRF protection
        const state = crypto.randomUUID();

        // Store state + context in provider_connections as a pending connection
        const { data: connection, error: insertErr } = await supabase
            .from("provider_connections")
            .insert({
                organization_id: org.organization_id,
                provider_type,
                display_name: display_name || OAUTH_PROVIDERS[provider_type]!.displayName,
                event_id: event_id || null,
                is_active: false,
                oauth_state: state,
                sync_direction: "bidirectional",
                created_by: user.id,
            })
            .select("id")
            .single();

        if (insertErr || !connection) {
            return ApiErrors.internalError("Failed to create pending connection");
        }

        // Build authorization URL
        const authUrl = buildAuthorizationUrl(provider_type, state);
        if (!authUrl) {
            return ApiErrors.badRequest(
                `OAuth not configured for ${provider_type}. Check environment variables.`
            );
        }

        return NextResponse.json({
            authorization_url: authUrl,
            connection_id: connection.id,
            state,
        });
    }
);
