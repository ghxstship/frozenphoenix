import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./config";
import { logger } from "@/lib/logger";

// ─── No-op query builder (returned when Supabase is not configured) ───

/**
 * A chainable no-op that mimics the Supabase PostgREST query builder.
 * Every method call returns `this`; awaiting resolves to `{ data: null, error: null }`.
 * This allows every hook across every file to call the full chain
 * (.select, .eq, .order, .limit, .single, etc.) without throwing.
 *
 * Read queries get `{ data: null, error: null }` — hooks return `undefined`
 * and pages use `data ?? []`.
 *
 * Write mutations get a descriptive error so callers know writes are no-ops.
 */
const NO_OP_READ_RESULT = { data: null, error: null, count: null, status: 200, statusText: "OK" };
const NO_OP_WRITE_RESULT = {
    data: null,
    error: { message: "Supabase not configured", details: "", hint: "", code: "NOT_CONFIGURED" },
    count: null,
    status: 503,
    statusText: "Service Unavailable",
};

function createNoOpQueryBuilder(isWrite: boolean) {
    const result = isWrite ? NO_OP_WRITE_RESULT : NO_OP_READ_RESULT;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler: ProxyHandler<any> = {
        get(_target, prop) {
            if (prop === "then") {
                return (resolve: (v: typeof result) => void) => resolve(result);
            }
            // Every chained method (.select, .eq, .order, etc.) returns the proxy
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (..._args: any[]) => new Proxy(() => {}, handler);
        },
    };

    return new Proxy(() => {}, handler);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createNoOpClient(): any {
    let warnedOnce = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler: ProxyHandler<any> = {
        get(_target, prop) {
            if (prop === "from") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (_table: any) => {
                    if (!warnedOnce) {
                        logger.warn("Supabase not configured — queries return empty results.", {
                            hint: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
                        });
                        warnedOnce = true;
                    }

                    // Return an object whose .select() is a read, .insert/.update/.delete/.upsert are writes
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const tableHandler: ProxyHandler<any> = {
                        get(_t, method) {
                            const isWrite =
                                method === "insert" ||
                                method === "update" ||
                                method === "delete" ||
                                method === "upsert";
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            return (..._a: any[]) => createNoOpQueryBuilder(isWrite);
                        },
                    };
                    return new Proxy(() => {}, tableHandler);
                };
            }

            if (prop === "rpc") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (..._args: any[]) => createNoOpQueryBuilder(false);
            }

            if (
                prop === "auth" ||
                prop === "storage" ||
                prop === "realtime" ||
                prop === "channel"
            ) {
                return new Proxy(() => {}, handler);
            }

            // Fallback: return a no-op function for any unknown property
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (..._args: any[]) => new Proxy(() => {}, handler);
        },
    };

    return new Proxy(() => {}, handler);
}

// ─── Singleton no-op client (created once, reused) ───
let noOpClient: ReturnType<typeof createNoOpClient> | null = null;

function getNoOpClient() {
    if (!noOpClient) noOpClient = createNoOpClient();
    return noOpClient;
}

// ─── Public API ───

// Performance: Module-level singleton — avoids recreating the client on every hook call.
let _browserClient: ReturnType<typeof createBrowserClient<Database>> | null | undefined;

export function createClient() {
    if (_browserClient !== undefined) return _browserClient;
    if (!supabaseUrl || !supabaseAnonKey) {
        _browserClient = null;
        return null;
    }
    _browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
    return _browserClient;
}

/**
 * Client accessor. Returns a real Supabase client when configured,
 * or a no-op proxy when not. Never throws.
 *
 * Read queries resolve to `{ data: null, error: null }` (hooks return undefined).
 * Write mutations resolve to `{ data: null, error: { message: "..." } }`.
 */
export function getSupabase() {
    const client = createClient();
    if (client) return client;
    return getNoOpClient();
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
