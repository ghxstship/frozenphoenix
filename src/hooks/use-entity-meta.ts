/* ═══════════════════════════════════════════════════════════════
   USE ENTITY META — SSOT hook for resolving entity metadata

   Encapsulates the repeated pattern of:
     const entityConfig = getEntityConfig(entityKey);
     const basePath = entityConfig?.basePath ?? `/api/${entityKey.replace(/_/g, "-")}`;
     const slug = entityConfig?.slug ?? entityKey.replace(/_/g, "-");
     ...etc

   Used by all shells that need entity metadata resolution.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from "react";
import { getEntityConfig } from "@/lib/api/entity-config";

export interface EntityMeta {
    /** The resolved EntityConfig (may be undefined for unregistered entities) */
    entityConfig: ReturnType<typeof getEntityConfig>;
    /** RBAC resource key */
    resource: string;
    /** API base path (e.g. "/api/projects") */
    basePath: string;
    /** URL slug (e.g. "projects") */
    slug: string;
    /** Human-readable singular name */
    displayName: string;
    /** Human-readable plural name */
    displayNamePlural: string;
    /** Searchable columns */
    searchColumns: string[];
}

/** Resolve entity metadata from entityKey. Memoized for render stability. */
export function useEntityMeta(entityKey: string): EntityMeta {
    return useMemo(() => resolveEntityMeta(entityKey), [entityKey]);
}

/** Pure function variant (for use outside React components). */
export function resolveEntityMeta(entityKey: string): EntityMeta {
    const entityConfig = getEntityConfig(entityKey);
    const kebab = entityKey.replace(/_/g, "-");
    return {
        entityConfig,
        resource: entityConfig?.resource ?? entityKey,
        basePath: entityConfig?.basePath ?? `/api/${kebab}`,
        slug: entityConfig?.slug ?? kebab,
        displayName: entityConfig?.displayName ?? entityKey,
        displayNamePlural: entityConfig?.displayNamePlural ?? entityKey,
        searchColumns: entityConfig?.searchColumns ?? ["name", "title"],
    };
}
