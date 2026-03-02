"use client";

import { useAuth } from "./auth-context";
import { isSupabaseConfigured } from "./client";

/**
 * Multi-tenant organization hook.
 * Returns the current user's active organization ID for query filtering.
 * When Supabase is not configured (demo mode), returns null (no filtering).
 *
 * Usage: pass org_id to Supabase queries to enforce tenant isolation.
 */
export function useOrgId(): string | null {
    const { activeOrg } = useAuth();
    if (!isSupabaseConfigured) return null;

    // activeOrg is derived from org_memberships — the canonical tenant boundary.
    // Returns null when no membership exists; RLS policies are the last line of defense.
    return activeOrg?.organization_id ?? null;
}
