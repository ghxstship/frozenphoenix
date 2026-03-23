"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useWorkspaceContext } from "@/hooks/use-workspace-context";
import { useClientsForSwitcher } from "@/lib/supabase/hooks-switcher";
import { ContextSwitcherPopover } from "./popover";
import { CONTEXT_SWITCHER_STRINGS } from "@/lib/i18n/context-switcher-strings";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

interface ClientSwitcherProps {
    /** Override the active client name displayed in the trigger */
    activeName?: string | undefined;
}

export function ClientSwitcher({ activeName }: ClientSwitcherProps) {
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = (activeOrg?.role ?? undefined) as PermissionLevel | undefined;

    const activeTeamId = useWorkspaceContext(orgId, (s) => s.activeTeamId);
    const activeClientId = useWorkspaceContext(orgId, (s) => s.activeClientId);
    const setActiveClient = useWorkspaceContext(orgId, (s) => s.setActiveClient);

    const { data: clients = [], isLoading } = useClientsForSwitcher(orgId, activeTeamId);

    const activeClient = clients.find((c) => c.id === activeClientId);
    const displayName =
        activeName || activeClient?.name || CONTEXT_SWITCHER_STRINGS.client.clearLabel;

    const canCreate = userRole ? hasPermission(userRole, "companies", "write") : false;

    const trigger = (
        <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="truncate max-w-[140px]">{displayName}</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
        </button>
    );

    return (
        <ContextSwitcherPopover
            items={clients}
            activeId={activeClientId}
            onSelect={setActiveClient}
            onClear={() => setActiveClient(null)}
            clearLabel={CONTEXT_SWITCHER_STRINGS.client.clearLabel}
            searchPlaceholder={CONTEXT_SWITCHER_STRINGS.client.searchPlaceholder}
            createLabel={CONTEXT_SWITCHER_STRINGS.client.createLabel}
            canCreate={canCreate}
            viewAllLabel={CONTEXT_SWITCHER_STRINGS.client.viewAllLabel}
            viewAllHref={CONTEXT_SWITCHER_STRINGS.client.viewAllHref}
            emptyMessage={CONTEXT_SWITCHER_STRINGS.client.emptyMessage}
            isLoading={isLoading}
            trigger={trigger}
            label={CONTEXT_SWITCHER_STRINGS.client.switchLabel}
            width={260}
        />
    );
}
