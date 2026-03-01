/* ═══════════════════════════════════════════════════════════════
   FIELD ACCESS API — Resolves field-level visibility for a resource
   
   GET /api/fields/access?resource=projects
   Returns resolved field access rules for the authenticated user's
   role and org pricing tier.
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import {
    resolveFieldAccess,
    type FieldAccessRule,
    type FieldResolutionContext,
    type PricingTier,
    type Visibility,
    type FieldWriteAccess,
    type FieldOverride,
} from "@/lib/permissions/field-resolver";
import type { PermissionLevel } from "@/types";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const resource = request.nextUrl.searchParams.get("resource");
    const projectId = request.nextUrl.searchParams.get("project_id") ?? undefined;

    if (!resource) {
        return ApiErrors.validationError({ resource: ["resource query param is required"] });
    }

    // Resolve user's org and role
    const { data: membership } = await supabase
        .from("org_memberships")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return ApiErrors.forbidden("No org membership found");
    }

    const orgId = membership.organization_id;
    const userRole = (membership.role ?? "vendor") as PermissionLevel;

    // Resolve org pricing tier
    const { data: subscription } = await supabase
        .from("org_subscriptions")
        .select("pricing_tier")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .limit(1)
        .single();

    const orgTier = (subscription?.pricing_tier ?? "core") as PricingTier;

    // Load field tier assignments
    const { data: fieldAssignments } = await supabase
        .from("field_tier_assignments")
        .select("field_type_id, category, pricing_tier, safety_critical");

    if (!fieldAssignments?.length) {
        return ApiErrors.internalError("No field assignments configured");
    }

    // Load role access rules for user's role
    const { data: roleAccess } = await supabase
        .from("field_role_access")
        .select("field_type_id, role_key, visibility, write_access, exportable, api_accessible, audit_logged, override_allowed")
        .eq("role_key", userRole);

    const roleAccessMap = new Map(
        (roleAccess ?? []).map((r) => [r.field_type_id, r] as const)
    );

    // Load overrides for this org
    const { data: overrides } = await supabase
        .from("field_access_overrides")
        .select("field_type_id, granted_visibility, granted_write, scope_type, scope_id, expires_at")
        .eq("organization_id", orgId)
        .eq("role_key", userRole)
        .eq("is_active", true);

    const fieldOverrides: FieldOverride[] = (overrides ?? []).map((o) => ({
        fieldTypeId: o.field_type_id,
        grantedVisibility: o.granted_visibility as Visibility,
        grantedWrite: (o.granted_write ?? "none") as FieldWriteAccess,
        scopeType: o.scope_type as "global" | "org" | "project",
        scopeId: o.scope_id,
        expiresAt: o.expires_at,
    }));

    // Build context
    const context: FieldResolutionContext = {
        userRole,
        orgPricingTier: orgTier,
        projectId,
        fieldOverrides,
    };

    // Resolve access for each field type
    const results = fieldAssignments.map((fa) => {
        const ra = roleAccessMap.get(fa.field_type_id);

        const rule: FieldAccessRule = {
            fieldTypeId: fa.field_type_id,
            category: fa.category,
            pricingTier: fa.pricing_tier as PricingTier,
            safetyCritical: fa.safety_critical,
            roleAccess: {
                exec: { visibility: "VISIBLE" as Visibility, write: "manage" as FieldWriteAccess, exportable: true, apiAccessible: true },
                pm: { visibility: "VISIBLE" as Visibility, write: "write" as FieldWriteAccess, exportable: true, apiAccessible: true },
                client: { visibility: "VISIBLE" as Visibility, write: "none" as FieldWriteAccess, exportable: false, apiAccessible: true },
                vendor: { visibility: "HIDDEN" as Visibility, write: "none" as FieldWriteAccess, exportable: false, apiAccessible: false },
                ...(ra ? {
                    [userRole]: {
                        visibility: ra.visibility as Visibility,
                        write: (ra.write_access ?? "none") as FieldWriteAccess,
                        exportable: ra.exportable,
                        apiAccessible: ra.api_accessible,
                    }
                } : {}),
            },
            auditLogged: ra?.audit_logged ?? false,
            rlsEnforced: true,
            overrideAllowed: ra?.override_allowed ?? false,
        };

        return resolveFieldAccess(rule, context);
    });

    return NextResponse.json({
        resource,
        userRole,
        orgTier,
        projectId: projectId ?? null,
        fieldCount: results.length,
        fields: results,
    });
}
