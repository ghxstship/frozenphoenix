"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/auth-context";
import { useWorkspaceContext } from "@/hooks/use-workspace-context";
import { useActivationsForSwitcher } from "@/lib/supabase/hooks-switcher";
import { ContextSwitcherPopover } from "./popover";
import { useTranslation } from "@/lib/i18n/locale-provider";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

interface ActivationSwitcherProps {
    /** Override the active activation name displayed in the trigger */
    activeName?:
        | string
        | undefined; /** When true, selecting an activation navigates to /activations/[id] */
    navigateOnSelect?: boolean | undefined; /** Sub-path to append after activation id */
    subPath?: string | undefined;
}

export function ActivationSwitcher({
    activeName,
    navigateOnSelect = false,
    subPath,
}: ActivationSwitcherProps) {
    const { t } = useTranslation("contextSwitcher");
    const router = useRouter();
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = (activeOrg?.role ?? undefined) as PermissionLevel | undefined;

    const activeProjectId = useWorkspaceContext(orgId, (s) => s.activeProjectId);
    const activeActivationId = useWorkspaceContext(orgId, (s) => s.activeActivationId);
    const setActiveActivation = useWorkspaceContext(orgId, (s) => s.setActiveActivation);

    const { data: activations = [], isLoading } = useActivationsForSwitcher(activeProjectId);

    const activeActivation = activations.find((a) => a.id === activeActivationId);
    const displayName = activeName || activeActivation?.name || t("activation.clearLabel");

    const canCreate = userRole ? hasPermission(userRole, "activations", "write") : false;

    const handleSelect = (id: string) => {
        setActiveActivation(id);
        if (navigateOnSelect) {
            const path = subPath ? `/activations/${id}/${subPath}` : `/activations/${id}`;
            router.push(path);
        }
    };

    if (!activeProjectId) return null;

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
            items={activations}
            activeId={activeActivationId}
            onSelect={handleSelect}
            onClear={() => setActiveActivation(null)}
            clearLabel={t("activation.clearLabel")}
            searchPlaceholder={t("activation.searchPlaceholder")}
            createLabel={t("activation.createLabel")}
            canCreate={canCreate}
            viewAllLabel={t("activation.viewAllLabel")}
            viewAllHref={t("activation.viewAllHref")}
            emptyMessage={t("activation.emptyMessage")}
            isLoading={isLoading}
            trigger={trigger}
            label={t("activation.switchLabel")}
            width={260}
        />
    );
}
