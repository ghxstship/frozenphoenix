import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";
import { logger } from "@/lib/logger";

export { isSupabaseConfigured };

export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        logger.warn("Supabase credentials not configured. Running in mock data mode.", {
            hint: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
        });
        return null;
    }
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ─── Shared helpers (SSOT — previously duplicated across 12+ hook files) ───

/** Guarded client accessor. Throws when Supabase is not configured. */
export function getSupabase() {
    const client = createClient();
    if (!client) {
        throw new Error(
            "Supabase client not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
        );
    }
    return client;
}

/**
 * Dynamic table accessor for hooks that accept runtime table names.
 * The `any` cast is scoped to this single helper; all call-sites stay
 * type-safe via return-type annotations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromTable(table: string): any {
    return getSupabase().from(table as never);
}

/**
 * Supabase generated types require exact union literals for .eq() filters.
 * Runtime filter params (from UI) are strings; this helper narrows safely.
 */
export function filterValue<T>(value: string): T {
    return value as unknown as T;
}
