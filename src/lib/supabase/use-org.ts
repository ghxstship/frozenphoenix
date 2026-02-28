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
    const { profile } = useAuth();
    if (!isSupabaseConfigured) return null;

    // The profile row should carry an org_id from the org_memberships table.
    // If the profile doesn't have one yet (legacy), return null to avoid
    // breaking queries — RLS policies are the last line of defense.
    const raw = profile as Record<string, unknown> | null;
    return (raw?.org_id as string) ?? null;
}
