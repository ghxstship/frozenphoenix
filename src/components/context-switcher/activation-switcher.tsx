"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useWorkspaceContext } from "@/hooks/use-workspace-context";
import { useActivationsForSwitcher } from "@/lib/supabase/hooks-switcher";
import { ContextSwitcherPopover } from "./popover";
import { CONTEXT_SWITCHER_STRINGS } from "@/lib/i18n/context-switcher-strings";
import { hasPermission } from "@/config/rbac";
import type { PermissionLevel } from "@/types";

interface ActivationSwitcherProps {
    /** Override the active activation name displayed in the trigger */
    activeName?: string;
    /** When true, selecting an activation navigates to /activations/[id] */
    navigateOnSelect?: boolean;
    /** Sub-path to append after activation id */
    subPath?: string;
}

export function ActivationSwitcher({
    activeName,
    navigateOnSelect = false,
    subPath,
}: ActivationSwitcherProps) {
    const router = useRouter();
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id ?? null;
    const userRole = (activeOrg?.role ?? undefined) as PermissionLevel | undefined;

    const activeProjectId = useWorkspaceContext(orgId, (s) => s.activeProjectId);
    const activeActivationId = useWorkspaceContext(orgId, (s) => s.activeActivationId);
    const setActiveActivation = useWorkspaceContext(orgId, (s) => s.setActiveActivation);

    const { data: activations = [], isLoading } = useActivationsForSwitcher(activeProjectId);

    const activeActivation = activations.find((a) => a.id === activeActivationId);
    const displayName =
        activeName || activeActivation?.name || CONTEXT_SWITCHER_STRINGS.activation.clearLabel;

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
        <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="truncate max-w-[140px]">{displayName}</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
        </button>
    );

    return (
        <ContextSwitcherPopover
            items={activations}
            activeId={activeActivationId}
            onSelect={handleSelect}
            onClear={() => setActiveActivation(null)}
            clearLabel={CONTEXT_SWITCHER_STRINGS.activation.clearLabel}
            searchPlaceholder={CONTEXT_SWITCHER_STRINGS.activation.searchPlaceholder}
            createLabel={CONTEXT_SWITCHER_STRINGS.activation.createLabel}
            canCreate={canCreate}
            viewAllLabel={CONTEXT_SWITCHER_STRINGS.activation.viewAllLabel}
            viewAllHref={CONTEXT_SWITCHER_STRINGS.activation.viewAllHref}
            emptyMessage={CONTEXT_SWITCHER_STRINGS.activation.emptyMessage}
            isLoading={isLoading}
            trigger={trigger}
            label={CONTEXT_SWITCHER_STRINGS.activation.switchLabel}
            width={260}
        />
    );
}
