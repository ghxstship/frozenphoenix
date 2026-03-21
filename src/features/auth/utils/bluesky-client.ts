import {
    NodeOAuthClient,
    type NodeSavedSession,
    type NodeSavedState,
} from "@atproto/oauth-client-node";
import { createClient } from "@supabase/supabase-js";

// ─── Environment ─────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getPublicUrl(): string {
    return (
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://atlvs.one")
    );
}

// Service-role client for state/session store operations (bypasses RLS)
function getAdminSupabase() {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false },
    });
}

// ─── Supabase-backed State Store ─────────────────────────────
// Ephemeral storage used during the OAuth authorization flow.
const stateStore = {
    async get(key: string): Promise<NodeSavedState | undefined> {
        const sb = getAdminSupabase();
        const { data } = await sb
            .from("bluesky_oauth_states")
            .select("state")
            .eq("key", key)
            .single();
        return data?.state as NodeSavedState | undefined;
    },
    async set(key: string, value: NodeSavedState): Promise<void> {
        const sb = getAdminSupabase();
        await sb.from("bluesky_oauth_states").upsert({
            key,
            state: value as unknown as Record<string, unknown>,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
    },
    async del(key: string): Promise<void> {
        const sb = getAdminSupabase();
        await sb.from("bluesky_oauth_states").delete().eq("key", key);
    },
};

// ─── Supabase-backed Session Store ───────────────────────────
// Persistent storage keyed by DID for active AT Protocol sessions.
const sessionStore = {
    async get(key: string): Promise<NodeSavedSession | undefined> {
        const sb = getAdminSupabase();
        const { data } = await sb
            .from("bluesky_oauth_sessions")
            .select("session")
            .eq("key", key)
            .single();
        return data?.session as NodeSavedSession | undefined;
    },
    async set(key: string, value: NodeSavedSession): Promise<void> {
        const sb = getAdminSupabase();
        await sb.from("bluesky_oauth_sessions").upsert({
            key,
            session: value as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
        });
    },
    async del(key: string): Promise<void> {
        const sb = getAdminSupabase();
        await sb.from("bluesky_oauth_sessions").delete().eq("key", key);
    },
};

// ─── Singleton OAuth Client ──────────────────────────────────
// Use globalThis to persist across Next.js hot reloads in development.
const globalBluesky = globalThis as unknown as {
    oauthClient: NodeOAuthClient | null;
};
globalBluesky.oauthClient ??= null;

export const BLUESKY_SCOPE = "atproto transition:generic";

export async function getBlueskyOAuthClient(): Promise<NodeOAuthClient> {
    if (globalBluesky.oauthClient) return globalBluesky.oauthClient;

    const publicUrl = getPublicUrl();
    const isLocalhost = publicUrl.includes("127.0.0.1") || publicUrl.includes("localhost");
    const callbackUrl = `${publicUrl}/api/auth/bluesky/callback`;

    if (isLocalhost) {
        const { buildAtprotoLoopbackClientMetadata } = await import("@atproto/oauth-client-node");
        globalBluesky.oauthClient = new NodeOAuthClient({
            clientMetadata: buildAtprotoLoopbackClientMetadata({
                scope: BLUESKY_SCOPE,
                redirect_uris: [callbackUrl],
            }),
            stateStore,
            sessionStore,
        });
    } else {
        globalBluesky.oauthClient = new NodeOAuthClient({
            clientMetadata: {
                client_id: `${publicUrl}/api/auth/bluesky/client-metadata`,
                application_type: "web" as const,
                client_name: "ATLVS",
                client_uri: publicUrl,
                dpop_bound_access_tokens: true,
                grant_types: ["authorization_code", "refresh_token"] as const,
                redirect_uris: [callbackUrl] as [string],
                response_types: ["code"] as const,
                scope: BLUESKY_SCOPE,
                token_endpoint_auth_method: "none" as const,
            },
            stateStore,
            sessionStore,
        });
    }

    return globalBluesky.oauthClient;
}
