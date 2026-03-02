/* ═══════════════════════════════════════════════════════════════
   PLAYBOOK — Server-Side Permission Check Middleware
   Validates RBAC at the API route level before processing requests
   ═══════════════════════════════════════════════════════════════ */

import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { cachedPermissionCheck } from "@/lib/permission-cache";
import type { CachedPermission } from "@/lib/permission-cache";
import { hasPermission as hasStaticPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

export interface PermissionCheckResult {
    authorized: boolean;
    userId: string | null;
    role: string | null;
    orgId: string | null;
    error?: string;
}

/**
 * Check if the authenticated user has the required permission.
 * Uses org_memberships to resolve role, then checks permission_grants.
 *
 * @param resource - The resource being accessed (e.g., 'projects', 'budgets')
 * @param action - The action being performed ('read' | 'write' | 'delete' | 'manage')
 * @param scopeId - Optional scope ID for project/activation-scoped checks
 */
export async function checkPermission(
    resource: string,
    action: "read" | "write" | "delete" | "manage",
    scopeId?: string
): Promise<PermissionCheckResult> {
    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            authorized: false,
            userId: null,
            role: null,
            orgId: null,
            error: "Supabase not configured",
        };
    }

    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll() {
                // Server components can't set cookies
            },
        },
    });

    // Get authenticated user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        return {
            authorized: false,
            userId: null,
            role: null,
            orgId: null,
            error: "Not authenticated",
        };
    }

    // Resolve role + grants from cache (or DB on miss)

    let cached: CachedPermission;
    try {
        // First fetch membership to get orgId (needed as cache key)
        const { data: membership } = await supabase
            .from("org_memberships")
            .select("organization_id, role")
            .eq("user_id", user.id)
            .eq("status", "active")
            .eq("is_default_org", true)
            .single();

        if (!membership) {
            return {
                authorized: false,
                userId: user.id,
                role: null,
                orgId: null,
                error: "No active org membership",
            };
        }

        const userOrgId = membership.organization_id as string;
        const userRole = membership.role as string;

        cached = await cachedPermissionCheck(user.id, userOrgId, async () => {
            const { data: grants } = await supabase
                .from("permission_grants")
                .select(
                    "id, resource, action, scope_id, role_definition_id, role_definitions!inner(key, is_active)"
                )
                .eq("role_definitions.key", userRole)
                .eq("role_definitions.is_active", true)
                .eq("is_active", true);

            return {
                role: userRole,
                orgId: userOrgId,
                grants: (grants || []).map((g: Record<string, unknown>) => ({
                    resource: g.resource as string,
                    action: g.action as string,
                    scope_id: (g.scope_id as string) || null,
                    effect: "allow",
                })),
                cachedAt: Date.now(),
            };
        });
    } catch {
        return {
            authorized: false,
            userId: user.id,
            role: null,
            orgId: null,
            error: "Permission resolution failed",
        };
    }

    const { role: userRole, orgId, grants } = cached;

    if (!grants || grants.length === 0) {
        // No DB grants found — fall back to the static PERMISSION_MATRIX
        // This is deterministic and auditable, unlike the previous exec wildcard bypass
        const validRoles: PermissionLevel[] = ["exec", "pm", "client", "vendor"];
        if (validRoles.includes(userRole as PermissionLevel)) {
            const allowed = hasStaticPermission(userRole as PermissionLevel, resource, action);
            if (allowed) {
                return { authorized: true, userId: user.id, role: userRole, orgId };
            }
        }
        return {
            authorized: false,
            userId: user.id,
            role: userRole,
            orgId,
            error: "No permissions found",
        };
    }

    // Check if any grant matches the requested resource + action
    const hasPermission = grants.some((g) => {
        const resourceMatch = g.resource === "*" || g.resource === resource;
        const actionMatch = g.action === action;
        const scopeMatch = !scopeId || !g.scope_id || g.scope_id === scopeId;
        return resourceMatch && actionMatch && scopeMatch;
    });

    if (!hasPermission) {
        // Log denied access (non-blocking)
        try {
            await supabase.from("access_audit_log").insert({
                user_id: user.id,
                resource,
                action,
                scope_type: scopeId ? "project" : "global",
                scope_id: scopeId || null,
                granted: false,
                role_key: userRole,
                metadata: {},
            });
        } catch {
            // Audit log failure is non-blocking
        }

        return {
            authorized: false,
            userId: user.id,
            role: userRole,
            orgId,
            error: "Permission denied",
        };
    }

    return { authorized: true, userId: user.id, role: userRole, orgId };
}

/**
 * Higher-order function that wraps an API route handler with permission checks.
 */
export function withPermission(
    resource: string,
    action: "read" | "write" | "delete" | "manage",
    handler: (
        request: Request,
        context: { userId: string; role: string; orgId: string }
    ) => Promise<NextResponse>
) {
    return async (request: Request): Promise<NextResponse> => {
        const result = await checkPermission(resource, action);

        if (!result.authorized) {
            return NextResponse.json(
                { error: result.error || "Forbidden" },
                { status: result.error === "Not authenticated" ? 401 : 403 }
            );
        }

        return handler(request, {
            userId: result.userId!,
            role: result.role!,
            orgId: result.orgId!,
        });
    };
}
