import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

export { isSupabaseConfigured };

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
 * Server-side dynamic table accessor. Scopes the `never` cast to one place
 * so API routes with runtime table names don't need `(supabase as any)`.
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
