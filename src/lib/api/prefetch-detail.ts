/* ═══════════════════════════════════════════════════════════════
   SSR Detail Prefetch — Server-side data prefetching for detail pages
   
   Used by [id]/page.tsx server components to prefetch the record
   before passing to the client component as initialRecord. This
   eliminates the blank loading state on initial navigation.
   
   Usage:
     const record = await prefetchDetailRecord("deals", id);
     return <DealDetailClient id={id} initialRecord={record} />;
   ═══════════════════════════════════════════════════════════════ */

import { createClient, serverFromTable } from "@/lib/supabase/server";
import { getEntityConfigBySlug } from "@/lib/api/entity-config";

/**
 * UUID v4 format validation — prevents sending invalid IDs to Supabase
 * which would block SSR for 4-6 seconds waiting for a DB error response.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Prefetch a single record by ID for a detail page.
 * Returns null if the record is not found or if an error occurs.
 * This is a best-effort prefetch — the client will re-fetch independently.
 */
export async function prefetchDetailRecord(
    slug: string,
    id: string
): Promise<Record<string, unknown> | null> {
    try {
        // Performance: Skip Supabase query entirely for invalid UUIDs.
        // This eliminates 4-6s SSR blocking on broken/test links.
        if (!UUID_REGEX.test(id)) return null;

        const config = getEntityConfigBySlug(slug);
        if (!config) return null;

        const supabase = await createClient();
        if (!supabase) return null;

        const { data, error } = await serverFromTable(supabase, config.table)
            .select(config.selectDetail)
            .eq("id", id)
            .maybeSingle();

        if (error || !data) return null;

        return data as Record<string, unknown>;
    } catch {
        // Best-effort — don't crash the page if prefetch fails
        return null;
    }
}
