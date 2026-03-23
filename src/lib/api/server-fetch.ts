/* ═══════════════════════════════════════════════════════════════
   SERVER-SIDE DATA FETCHING — RSC Foundation (F-10/F-12)

   Provides server-side data fetching for React Server Components.
   Pages call these functions directly — no API route round-trip,
   no client-side waterfall, no redundant auth validation.

   The Supabase server client reads cookies set by middleware,
   inheriting the user's session and RLS context automatically.

   Usage (in a Server Component page.tsx — NO "use client"):
     import { fetchEntityList } from "@/lib/api/server-fetch";
     import { LEADS_PAGE } from "@/config/list-page-configs";

     export default async function LeadsPage() {
         const data = await fetchEntityList("lead");
         return <ListPageShellClient config={LEADS_PAGE} data={data} />;
     }
   ═══════════════════════════════════════════════════════════════ */

import { createClient, serverFromTable } from "@/lib/supabase/server";
import { getEntityConfig } from "@/lib/api/entity-config";
import { logger } from "@/lib/logger";

type EntityRecord = Record<string, unknown>;

/**
 * Fetch a list of entities server-side for RSC pages.
 * Uses the Supabase server client (inherits session from cookies).
 * Returns an empty array if Supabase is not configured or query fails.
 */
export async function fetchEntityList(
    entityKey: string,
    options?: {
        /** Override the select clause */
        select?: string | undefined; /** Maximum rows (default: 500) */
        limit?: number | undefined; /** Sort column (default: "created_at") */
        sortBy?: string | undefined; /** Sort direction (default: descending) */
        ascending?: boolean | undefined; /** Additional filters as column→value pairs */
        filters?: Record<string, string | number | boolean> | undefined;
    }
): Promise<EntityRecord[]> {
    const config = getEntityConfig(entityKey);
    if (!config) return [];

    const supabase = await createClient();
    if (!supabase) return [];

    const selectClause = options?.select ?? config.selectList ?? "*";
    const limit = options?.limit ?? 500;
    const sortBy = options?.sortBy ?? "created_at";
    const ascending = options?.ascending ?? false;

    let query = serverFromTable(supabase, config.table)
        .select(selectClause)
        .order(sortBy, { ascending })
        .limit(limit);

    // Soft-delete filter
    if (config.softDelete) {
        query = query.is("deleted_at", null);
    }

    // Additional filters
    if (options?.filters) {
        for (const [column, value] of Object.entries(options.filters)) {
            query = query.eq(column, value);
        }
    }

    const { data, error } = await query;

    if (error) {
        logger.error(`[server-fetch] fetchEntityList(${entityKey}) failed`, {
            error: error.message,
        });
        return [];
    }

    return (data ?? []) as EntityRecord[];
}

/**
 * Fetch a single entity by ID server-side for RSC detail pages.
 */
export async function fetchEntityDetail(
    entityKey: string,
    id: string,
    options?: {
        /** Override the select clause */
        select?: string | undefined;
    }
): Promise<EntityRecord | null> {
    const config = getEntityConfig(entityKey);
    if (!config) return null;

    const supabase = await createClient();
    if (!supabase) return null;

    const selectClause = options?.select ?? config.selectDetail ?? "*";

    let query = serverFromTable(supabase, config.table).select(selectClause).eq("id", id);

    if (config.softDelete) {
        query = query.is("deleted_at", null);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === "PGRST116") return null; // Not found
        logger.error(`[server-fetch] fetchEntityDetail(${entityKey}, ${id}) failed`, {
            error: error.message,
        });
        return null;
    }

    return (data ?? null) as EntityRecord | null;
}
