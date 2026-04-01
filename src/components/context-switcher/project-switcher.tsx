"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/auth-context";
import { useWorkspaceContext } from "@/hooks/use-workspace-context";
import { useProjectsForSwitcher } from "@/lib/supabase/hooks-switcher";
import { ContextSwitcherPopover } from "./popover";
import { CONTEXT_SWITCHER_STRINGS } from "@/lib/i18n/context-switcher-strings";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

interface ProjectSwitcherProps {
    /** Override the active project name displayed in the trigger */
    activeName?:
        | string
        | undefined; /** When true, selecting a project navigates to /projects/[id] */
    navigateOnSelect?:
        | boolean
        | undefined; /** Sub-path to append after project id (e.g., "tasks") */
    subPath?: string | undefined;
}

export function ProjectSwitcher({
    activeName,
    navigateOnSelect = false,
    subPath,
}: ProjectSwitcherProps) {
    const router = useRouter();
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = (activeOrg?.role ?? undefined) as PermissionLevel | undefined;

    const activeTeamId = useWorkspaceContext(orgId, (s) => s.activeTeamId);
    const activeClientId = useWorkspaceContext(orgId, (s) => s.activeClientId);
    const activeProjectId = useWorkspaceContext(orgId, (s) => s.activeProjectId);
    const setActiveProject = useWorkspaceContext(orgId, (s) => s.setActiveProject);

    const { data: projects = [], isLoading } = useProjectsForSwitcher(orgId, {
        teamId: activeTeamId,
        clientId: activeClientId,
    });

    const activeProject = projects.find((p) => p.id === activeProjectId);
    const displayName =
        activeName || activeProject?.name || CONTEXT_SWITCHER_STRINGS.project.clearLabel;

    const canCreate = userRole ? hasPermission(userRole, "projects", "write") : false;

    const handleSelect = (id: string) => {
        setActiveProject(id);
        if (navigateOnSelect) {
            const path = subPath ? `/projects/${id}/${subPath}` : `/projects/${id}`;
            router.push(path);
        }
    };

    const trigger = (
        <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-1 h-auto text-muted-foreground hover:text-foreground"
        >
            <span className="truncate max-w-[160px]">{displayName}</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
        </Button>
    );

    return (
        <ContextSwitcherPopover
            items={projects}
            activeId={activeProjectId}
            onSelect={handleSelect}
            onClear={() => setActiveProject(null)}
            clearLabel={CONTEXT_SWITCHER_STRINGS.project.clearLabel}
            searchPlaceholder={CONTEXT_SWITCHER_STRINGS.project.searchPlaceholder}
            createLabel={CONTEXT_SWITCHER_STRINGS.project.createLabel}
            canCreate={canCreate}
            viewAllLabel={CONTEXT_SWITCHER_STRINGS.project.viewAllLabel}
            viewAllHref={CONTEXT_SWITCHER_STRINGS.project.viewAllHref}
            emptyMessage={CONTEXT_SWITCHER_STRINGS.project.emptyMessage}
            isLoading={isLoading}
            trigger={trigger}
            label={CONTEXT_SWITCHER_STRINGS.project.switchLabel}
            width={280}
        />
    );
}
