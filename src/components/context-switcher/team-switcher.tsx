"use client";

import React from "react";
import { ChevronDown, Users } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useWorkspaceContext } from "@/hooks/use-workspace-context";
import { useTeamsForSwitcher } from "@/lib/supabase/hooks-switcher";
import { ContextSwitcherPopover } from "./popover";
import { CONTEXT_SWITCHER_STRINGS } from "@/lib/i18n/context-switcher-strings";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";
import type { SwitcherItem } from "@/types/workspace-context";

interface TeamSwitcherProps {
    collapsed?: boolean;
    isMobile?: boolean;
}

export function TeamSwitcher({ collapsed = false, isMobile = false }: TeamSwitcherProps) {
    const { activeOrg, profile } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = profile?.role as PermissionLevel | undefined;

    const activeTeamId = useWorkspaceContext(orgId, (s) => s.activeTeamId);
    const setActiveTeam = useWorkspaceContext(orgId, (s) => s.setActiveTeam);

    const { data: teams = [], isLoading } = useTeamsForSwitcher(orgId);

    const teamItems: SwitcherItem[] = teams.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        avatar_url: t.avatar_url,
        is_default: t.is_default,
    }));

    const activeTeam = teams.find((t) => t.id === activeTeamId);
    const teamName = activeTeam?.name || CONTEXT_SWITCHER_STRINGS.team.clearLabel;

    const canCreate = userRole ? hasPermission(userRole, "teams", "write") : false;
    const showLabel = !collapsed || isMobile;

    if (collapsed && !isMobile) return null;

    const trigger = (
        <div className="flex items-center gap-2 px-2 py-1 w-full rounded-lg transition-colors hover:bg-sidebar-accent/60">
            <Users className="h-3.5 w-3.5 text-sidebar-foreground/40 shrink-0" />
            {showLabel && (
                <>
                    <span className="flex-1 text-xs text-sidebar-foreground/70 truncate">
                        {teamName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-sidebar-foreground/30 shrink-0" />
                </>
            )}
        </div>
    );

    return (
        <ContextSwitcherPopover
            items={teamItems}
            activeId={activeTeamId}
            onSelect={setActiveTeam}
            onClear={() => setActiveTeam(null)}
            clearLabel={CONTEXT_SWITCHER_STRINGS.team.clearLabel}
            searchPlaceholder={CONTEXT_SWITCHER_STRINGS.team.searchPlaceholder}
            createLabel={CONTEXT_SWITCHER_STRINGS.team.createLabel}
            canCreate={canCreate}
            viewAllLabel={CONTEXT_SWITCHER_STRINGS.team.viewAllLabel}
            viewAllHref={CONTEXT_SWITCHER_STRINGS.team.viewAllHref}
            emptyMessage={CONTEXT_SWITCHER_STRINGS.team.emptyMessage}
            isLoading={isLoading}
            trigger={trigger}
            label={CONTEXT_SWITCHER_STRINGS.team.switchLabel}
            width={260}
        />
    );
}
