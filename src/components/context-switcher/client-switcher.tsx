"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/auth-context";
import { useWorkspaceContext } from "@/hooks/use-workspace-context";
import { useClientsForSwitcher } from "@/lib/supabase/hooks-switcher";
import { ContextSwitcherPopover } from "./popover";
import { useTranslation } from "@/lib/i18n/locale-provider";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

interface ClientSwitcherProps {
    /** Override the active client name displayed in the trigger */
    activeName?: string | undefined;
}

export function ClientSwitcher({ activeName }: ClientSwitcherProps) {
    const { t } = useTranslation("contextSwitcher");
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = (activeOrg?.role ?? undefined) as PermissionLevel | undefined;

    const activeTeamId = useWorkspaceContext(orgId, (s) => s.activeTeamId);
    const activeClientId = useWorkspaceContext(orgId, (s) => s.activeClientId);
    const setActiveClient = useWorkspaceContext(orgId, (s) => s.setActiveClient);

    const { data: clients = [], isLoading } = useClientsForSwitcher(orgId, activeTeamId);

    const activeClient = clients.find((c) => c.id === activeClientId);
    const displayName = activeName || activeClient?.name || t("client.clearLabel");

    const canCreate = userRole ? hasPermission(userRole, "companies", "write") : false;

    const trigger = (
        <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-1 h-auto text-muted-foreground hover:text-foreground"
        >
            <span className="truncate max-w-[140px]">{displayName}</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
        </Button>
    );

    return (
        <ContextSwitcherPopover
            items={clients}
            activeId={activeClientId}
            onSelect={setActiveClient}
            onClear={() => setActiveClient(null)}
            clearLabel={t("client.clearLabel")}
            searchPlaceholder={t("client.searchPlaceholder")}
            createLabel={t("client.createLabel")}
            canCreate={canCreate}
            viewAllLabel={t("client.viewAllLabel")}
            viewAllHref={t("client.viewAllHref")}
            emptyMessage={t("client.emptyMessage")}
            isLoading={isLoading}
            trigger={trigger}
            label={t("client.switchLabel")}
            width={260}
        />
    );
}
