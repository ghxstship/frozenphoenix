"use client";

import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { ClientSwitcher } from "./client-switcher";
import { ProjectSwitcher } from "./project-switcher";
import { ActivationSwitcher } from "./activation-switcher";
import type { EntityContext } from "@/types/workspace-context";

// ─── Route → Entity Context Detection ────────────────────────

const ENTITY_PATTERNS: Array<{ pattern: RegExp; type: EntityContext["type"] }> = [
    { pattern: /^\/activations\/([^/]+)/, type: "activation" },
    { pattern: /^\/projects\/([^/]+)/, type: "project" },
    { pattern: /^\/companies\/([^/]+)/, type: "client" },
];

export function detectEntityContext(pathname: string): EntityContext | null {
    for (const { pattern, type } of ENTITY_PATTERNS) {
        const match = pathname.match(pattern);
        if (match?.[1]) {
            return { type, id: match[1] };
        }
    }
    return null;
}

// ─── Extract sub-path after /entity/[id]/ ────────────────────

function extractSubPath(pathname: string, entityPrefix: string): string | undefined {
    const pattern = new RegExp(`^${entityPrefix}/[^/]+/(.+)$`);
    const match = pathname.match(pattern);
    return match?.[1];
}

// ─── Entity-Aware Breadcrumb Segments ────────────────────────

interface EntityBreadcrumbProps {
    pathname: string;
    /** Optional override names from fetched data */
    clientName?: string | undefined;
    projectName?: string | undefined;
    activationName?: string | undefined;
}

export function EntityBreadcrumb({
    pathname,
    clientName,
    projectName,
    activationName,
}: EntityBreadcrumbProps) {
    const entityContext = useMemo(() => detectEntityContext(pathname), [pathname]);

    if (!entityContext) return null;

    const subPath = (() => {
        switch (entityContext.type) {
            case "project":
                return extractSubPath(pathname, "/projects");
            case "activation":
                return extractSubPath(pathname, "/activations");
            case "client":
                return extractSubPath(pathname, "/companies");
            default:
                return undefined;
        }
    })();

    const segments: React.ReactNode[] = [];

    // Client segment — shown for client, project, and activation pages
    if (
        entityContext.type === "client" ||
        entityContext.type === "project" ||
        entityContext.type === "activation"
    ) {
        segments.push(<ClientSwitcher key="client" activeName={clientName} />);
    }

    // Project segment — shown for project and activation pages
    if (entityContext.type === "project" || entityContext.type === "activation") {
        segments.push(
            <ProjectSwitcher
                key="project"
                activeName={projectName}
                navigateOnSelect={entityContext.type === "project"}
                subPath={entityContext.type === "project" ? subPath : undefined}
            />
        );
    }

    // Activation segment — shown for activation pages only
    if (entityContext.type === "activation") {
        segments.push(
            <ActivationSwitcher
                key="activation"
                activeName={activationName}
                navigateOnSelect
                subPath={subPath}
            />
        );
    }

    if (segments.length === 0) return null;

    return (
        <>
            {segments.map((segment, i) => (
                <React.Fragment key={i}>
                    {i > 0 && (
                        <ChevronRight
                            className="h-3 w-3 text-muted-foreground/40 shrink-0"
                            aria-hidden="true"
                        />
                    )}
                    {segment}
                </React.Fragment>
            ))}
        </>
    );
}
