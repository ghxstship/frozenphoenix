"use client";

/* ═══════════════════════════════════════════════════════════════
   AI Copilot — Platform Context Awareness Hook
   
   Detects the user's current page/entity context and injects it
   into the Copilot store so the context builder can shape system
   prompts, tool availability, and RAG retrieval accordingly.
   
   Call this hook once in the dashboard layout — it will reactively
   update the copilot's pageContext when the route changes.
   ═══════════════════════════════════════════════════════════════ */

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useCopilot } from "./use-copilot";

/**
 * Maps URL path segments to entity types for copilot context.
 */
const PATH_ENTITY_MAP: Record<string, string> = {
    projects: "project",
    tasks: "task",
    events: "event",
    leads: "lead",
    deals: "deal",
    invoices: "invoice",
    vendors: "vendor",
    assets: "asset",
    crew: "crew_member",
    budgets: "budget",
    reports: "report",
    documents: "document",
    timesheets: "timesheet",
    expenses: "expense",
    contacts: "contact",
    milestones: "milestone",
    activations: "activation",
};

export function useCopilotContext() {
    const pathname = usePathname();
    const params = useParams();
    const setPageContext = useCopilot((s) => s.setPageContext);

    useEffect(() => {
        if (!pathname) {
            setPageContext(null);
            return;
        }

        const segments = pathname.split("/").filter(Boolean);

        // Try to find an entity match from path segments
        let entityType: string | null = null;
        let entityId: string | undefined;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (segment && PATH_ENTITY_MAP[segment]) {
                entityType = PATH_ENTITY_MAP[segment];
                // Next segment might be an ID (UUID pattern)
                const nextSegment = segments[i + 1];
                if (nextSegment && isUuid(nextSegment)) {
                    entityId = nextSegment;
                }
                break;
            }
        }

        // Also check route params for dynamic segments
        if (!entityId && params) {
            const paramId = params.id ?? params.projectId ?? params.eventId ?? params.taskId;
            if (typeof paramId === "string" && isUuid(paramId)) {
                entityId = paramId;
            }
        }

        // Detect special pages
        if (!entityType) {
            if (pathname.includes("/dashboard") || pathname.includes("/home")) {
                entityType = "dashboard";
            } else if (pathname.includes("/settings")) {
                entityType = "settings";
            } else if (pathname.includes("/analytics") || pathname.includes("/reports")) {
                entityType = "analytics";
            }
        }

        if (entityType) {
            setPageContext({ entityType, entityId });
        } else {
            setPageContext(null);
        }
    }, [pathname, params, setPageContext]);
}

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
