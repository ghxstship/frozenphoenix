import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Service-role admin client that bypasses RLS.
 * Use ONLY in server-side API routes for privileged operations
 * (org creation, invitation acceptance, audit logging, admin invites).
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
        return null;
    }
    return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/** Server-side typed client type (non-null). */
export type ServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/** Guarded server client accessor. Throws when Supabase is not configured. */
export async function getServerSupabase(): Promise<ServerClient> {
    const client = await createClient();
    if (!client) {
        throw new Error(
            "Supabase client not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
        );
    }
    return client;
}

/**
 * @internal Server-side dynamic table accessor. Returns `any` intentionally —
 * Supabase's generated types require exact table-name literals, but runtime
 * table names are strings. This single boundary keeps all call-sites type-safe.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serverFromTable(client: ServerClient, table: string): any {
    return client.from(table as never);
}

export async function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    const cookieStore = await cookies();

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing sessions.
                }
            },
        },
    });
}
