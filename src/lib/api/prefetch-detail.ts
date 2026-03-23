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
 * Prefetch a single record by ID for a detail page.
 * Returns null if the record is not found or if an error occurs.
 * This is a best-effort prefetch — the client will re-fetch independently.
 */
export async function prefetchDetailRecord(
    slug: string,
    id: string
): Promise<Record<string, unknown> | null> {
    try {
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
