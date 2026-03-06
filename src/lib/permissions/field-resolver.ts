/* ═══════════════════════════════════════════════════════════════
   FIELD-LEVEL PERMISSION RESOLVER
   
   Resolves field visibility, write access, and export permissions
   based on the RBAC Field Access Matrix, pricing tier, and
   contextual overrides (project role, scope grants).
   
   Integration points:
   - src/config/rbac.ts (role model, FIELD_VISIBILITY_MASKS)
   - src/app/api/middleware/permissions.ts (request-level auth)
   - src/lib/permission-cache.ts (caching layer)
   - src/lib/supabase/database.types.ts (DB types)
   ═══════════════════════════════════════════════════════════════ */

import type { PermissionLevel } from "@/types";

// ─── Types ───────────────────────────────────────────────────

export type Visibility = "VISIBLE" | "MASKED" | "REDACTED" | "HIDDEN";
export type FieldWriteAccess = "none" | "write" | "manage";
export type PricingTier = "core" | "pro" | "enterprise";

export interface FieldAccessRule {
    fieldTypeId: string;
    category: string;
    pricingTier: PricingTier;
    safetyCritical: boolean;
    roleAccess: Record<
        PermissionLevel,
        {
            visibility: Visibility;
            write: FieldWriteAccess;
            exportable: boolean;
            apiAccessible: boolean;
        }
    >;
    auditLogged: boolean;
    rlsEnforced: boolean;
    overrideAllowed: boolean;
}

export interface FieldResolutionContext {
    userRole: PermissionLevel;
    orgPricingTier: PricingTier;
    projectId?: string;
    projectRole?: PermissionLevel;
    fieldOverrides?: FieldOverride[];
}

export interface FieldOverride {
    fieldTypeId: string;
    grantedVisibility: Visibility;
    grantedWrite: FieldWriteAccess;
    scopeType: "global" | "org" | "project";
    scopeId: string | null;
    expiresAt: string | null;
}

export interface ResolvedFieldAccess {
    fieldTypeId: string;
    visibility: Visibility;
    write: FieldWriteAccess;
    exportable: boolean;
    apiAccessible: boolean;
    auditLogged: boolean;
    reason: string;
}

// ─── Tier Hierarchy ──────────────────────────────────────────

const TIER_HIERARCHY: Record<PricingTier, number> = {
    core: 0,
    pro: 1,
    enterprise: 2,
};

function tierSatisfies(orgTier: PricingTier, requiredTier: PricingTier): boolean {
    return TIER_HIERARCHY[orgTier] >= TIER_HIERARCHY[requiredTier];
}

// ─── Role Hierarchy ──────────────────────────────────────────

export const ROLE_HIERARCHY: Record<PermissionLevel, number> = {
    exec: 5,
    director: 4,
    pm: 3,
    member: 2,
    client: 1,
    collaborator: 0,
};

function effectiveRole(orgRole: PermissionLevel, projectRole?: PermissionLevel): PermissionLevel {
    if (!projectRole) return orgRole;
    return ROLE_HIERARCHY[projectRole] > ROLE_HIERARCHY[orgRole] ? projectRole : orgRole;
}

// ─── Safety-Critical Field IDs ───────────────────────────────
// These fields are NEVER paywalled and NEVER hidden from any
// authenticated role, regardless of pricing tier or RBAC config.

const SAFETY_CRITICAL_CATEGORIES = new Set([
    "PII Emergency/Safety",
    "Boolean Safety",
    "Compliance",
]);

// ─── Core Resolution Engine ──────────────────────────────────

export function resolveFieldAccess(
    rule: FieldAccessRule,
    context: FieldResolutionContext
): ResolvedFieldAccess {
    const { userRole, orgPricingTier, projectRole, fieldOverrides } = context;
    const role = effectiveRole(userRole, projectRole);

    // Safety-critical fields bypass all tier and visibility restrictions
    if (rule.safetyCritical) {
        const baseAccess = rule.roleAccess[role];
        return {
            fieldTypeId: rule.fieldTypeId,
            visibility: "VISIBLE",
            write: baseAccess.write,
            exportable: true,
            apiAccessible: true,
            auditLogged: rule.auditLogged,
            reason: "safety_critical_override",
        };
    }

    // Tier gate: if org tier doesn't satisfy required tier, hide field
    if (!tierSatisfies(orgPricingTier, rule.pricingTier)) {
        return {
            fieldTypeId: rule.fieldTypeId,
            visibility: "HIDDEN",
            write: "none",
            exportable: false,
            apiAccessible: false,
            auditLogged: false,
            reason: `tier_insufficient:requires_${rule.pricingTier}`,
        };
    }

    // Base access from the role matrix
    const baseAccess = rule.roleAccess[role];
    let resolvedVisibility = baseAccess.visibility;
    let resolvedWrite = baseAccess.write;
    let resolvedExportable = baseAccess.exportable;
    let resolvedApiAccessible = baseAccess.apiAccessible;
    let reason = "role_matrix_default";

    // Apply field-level overrides if allowed and present
    if (rule.overrideAllowed && fieldOverrides?.length) {
        const override = findBestOverride(rule.fieldTypeId, fieldOverrides, context.projectId);

        if (override) {
            // Overrides can only ELEVATE access, never restrict it
            if (visibilityRank(override.grantedVisibility) > visibilityRank(resolvedVisibility)) {
                resolvedVisibility = override.grantedVisibility;
                reason = `override:${override.scopeType}`;
            }
            if (writeRank(override.grantedWrite) > writeRank(resolvedWrite)) {
                resolvedWrite = override.grantedWrite;
                reason = `override:${override.scopeType}`;
            }
            resolvedExportable = resolvedExportable || override.grantedVisibility === "VISIBLE";
            resolvedApiAccessible = true;
        }
    }

    return {
        fieldTypeId: rule.fieldTypeId,
        visibility: resolvedVisibility,
        write: resolvedWrite,
        exportable: resolvedExportable,
        apiAccessible: resolvedApiAccessible,
        auditLogged: rule.auditLogged,
        reason,
    };
}

// ─── Batch Resolution ────────────────────────────────────────

export function resolveFieldAccessBatch(
    rules: FieldAccessRule[],
    context: FieldResolutionContext
): Map<string, ResolvedFieldAccess> {
    const results = new Map<string, ResolvedFieldAccess>();
    for (const rule of rules) {
        results.set(rule.fieldTypeId, resolveFieldAccess(rule, context));
    }
    return results;
}

// ─── Data Masking ────────────────────────────────────────────

export function applyFieldMasking(
    data: Record<string, unknown>,
    fieldMap: Map<string, string>,
    resolvedAccess: Map<string, ResolvedFieldAccess>
): Record<string, unknown> {
    const masked: Record<string, unknown> = { ...data };

    for (const [columnName, fieldTypeId] of fieldMap) {
        const access = resolvedAccess.get(fieldTypeId);
        if (!access) continue;

        switch (access.visibility) {
            case "HIDDEN":
                delete masked[columnName];
                break;
            case "REDACTED":
                masked[columnName] = maskRedacted(columnName, data[columnName]);
                break;
            case "MASKED":
                masked[columnName] = maskPartial(columnName, data[columnName]);
                break;
            case "VISIBLE":
                break;
        }
    }

    return masked;
}

// ─── Export Filtering ────────────────────────────────────────

export function filterExportableFields(
    columns: string[],
    fieldMap: Map<string, string>,
    resolvedAccess: Map<string, ResolvedFieldAccess>
): string[] {
    return columns.filter((col) => {
        const fieldTypeId = fieldMap.get(col);
        if (!fieldTypeId) return true;
        const access = resolvedAccess.get(fieldTypeId);
        return access ? access.exportable : false;
    });
}

// ─── Write Access Check ──────────────────────────────────────

export function canWriteField(
    fieldTypeId: string,
    resolvedAccess: Map<string, ResolvedFieldAccess>
): boolean {
    const access = resolvedAccess.get(fieldTypeId);
    return access ? access.write !== "none" : false;
}

export function filterWritableFields(
    payload: Record<string, unknown>,
    fieldMap: Map<string, string>,
    resolvedAccess: Map<string, ResolvedFieldAccess>
): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload)) {
        const fieldTypeId = fieldMap.get(key);
        if (!fieldTypeId) {
            filtered[key] = value;
            continue;
        }
        if (canWriteField(fieldTypeId, resolvedAccess)) {
            filtered[key] = value;
        }
    }

    return filtered;
}

// ─── Helpers ─────────────────────────────────────────────────

function visibilityRank(v: Visibility): number {
    const ranks: Record<Visibility, number> = {
        HIDDEN: 0,
        REDACTED: 1,
        MASKED: 2,
        VISIBLE: 3,
    };
    return ranks[v];
}

function writeRank(w: FieldWriteAccess): number {
    const ranks: Record<FieldWriteAccess, number> = {
        none: 0,
        write: 1,
        manage: 2,
    };
    return ranks[w];
}

function findBestOverride(
    fieldTypeId: string,
    overrides: FieldOverride[],
    projectId?: string
): FieldOverride | null {
    const now = new Date().toISOString();
    const applicable = overrides
        .filter((o) => {
            if (o.fieldTypeId !== fieldTypeId) return false;
            if (o.expiresAt && o.expiresAt < now) return false;
            if (o.scopeType === "project" && o.scopeId !== projectId) return false;
            return true;
        })
        .sort((a, b) => {
            const scopePriority: Record<string, number> = {
                project: 3,
                org: 2,
                global: 1,
            };
            return (scopePriority[b.scopeType] || 0) - (scopePriority[a.scopeType] || 0);
        });

    return applicable[0] ?? null;
}

function maskRedacted(_columnName: string, value: unknown): string {
    if (value === null || value === undefined) return "[REDACTED]";
    const str = String(value);

    if (str.includes("@")) return "[REDACTED EMAIL]";
    if (/^\+?\d[\d\s\-()]+$/.test(str)) return "[REDACTED PHONE]";
    if (/^\d{3}-\d{2}-\d{4}$/.test(str)) return `XXX-XX-${str.slice(-4)}`;
    if (/^\d+(\.\d+)?$/.test(str)) return "[REDACTED]";

    return "[REDACTED]";
}

function maskPartial(_columnName: string, value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = String(value);

    if (str.includes("@")) {
        const [local, domain] = str.split("@");
        return `${local?.[0] ?? ""}***@${domain}`;
    }

    if (/^\+?\d[\d\s\-()]+$/.test(str)) {
        const digits = str.replace(/\D/g, "");
        return `+${digits.slice(0, 2)}***${digits.slice(-3)}`;
    }

    if (str.length > 4) {
        return `${str.slice(0, 2)}${"*".repeat(str.length - 4)}${str.slice(-2)}`;
    }

    return "****";
}

// ─── Category Helper ─────────────────────────────────────────

export function isSafetyCriticalCategory(category: string): boolean {
    return SAFETY_CRITICAL_CATEGORIES.has(category);
}
