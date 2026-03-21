/* ═══════════════════════════════════════════════════════════════
   AUTH RESOLVER — Single Source of Truth for API auth resolution
   
   Resolves user role + orgId from middleware cookies (fast path)
   or falls back to a single combined Supabase query (slow path).
   
   Used by both crud-factory.ts and with-api-handler.ts.
   ═══════════════════════════════════════════════════════════════ */

import type { createClient } from "@/lib/supabase/server";
import type { PermissionLevel } from "@/types";

export const VALID_ROLES = new Set<string>(["exec", "director", "pm", "member", "client", "collaborator"]);

export async function resolveRoleAndOrg(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    cachedRole?: string | null,
    cachedOrgId?: string | null
): Promise<{ role: PermissionLevel; orgId: string }> {
    const roleFromCookie =
        cachedRole && VALID_ROLES.has(cachedRole) ? (cachedRole as PermissionLevel) : null;
    const orgIdFromCookie = cachedOrgId || null;

    // Fast path: both cached
    if (roleFromCookie && orgIdFromCookie) {
        return { role: roleFromCookie, orgId: orgIdFromCookie };
    }

    if (!supabase) return { role: "member", orgId: "" };

    // Slow path: single query for both role + orgId
    const { data } = await supabase
        .from("org_memberships")
        .select("role, organization_id")
        .eq("user_id", userId)
        .eq("is_default_org", true)
        .single();

    return {
        role: roleFromCookie ?? (data?.role as PermissionLevel) ?? "member",
        orgId: orgIdFromCookie ?? data?.organization_id ?? "",
    };
}
