"use client";

import React from "react";
import { cn, getInitials } from "@/lib/utils";
import { Building2, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { Tooltip } from "@/components/ui/tooltip";
import { ContextSwitcherPopover } from "./popover";
import { CONTEXT_SWITCHER_STRINGS } from "@/lib/i18n/context-switcher-strings";
import { hasPermission } from "@/config/rbac";
import { useHydrated } from "@/hooks/use-hydrated";
import type { PermissionLevel } from "@/types";
import type { SwitcherItem } from "@/types/workspace-context";

interface OrgSwitcherProps {
    collapsed?: boolean | undefined;
    isMobile?: boolean | undefined;
}

export function OrgSwitcher({ collapsed = false, isMobile = false }: OrgSwitcherProps) {
    const { memberships, activeOrg, switchOrg, loading } = useAuth();
    const hydrated = useHydrated();
    const userRole = (activeOrg?.role ?? undefined) as PermissionLevel | undefined;

    // During SSR + auth hydration, memberships is [] and activeOrg is null, causing
    // "Select Organization" to flash. Show shimmer instead.
    const orgLoading = !hydrated || loading || (memberships.length === 0 && !activeOrg);

    const orgItems: SwitcherItem[] = memberships.map((m) => ({
        id: m.organization_id,
        name: m.organizations?.name || m.organization_id,
        slug: m.organizations?.slug,
    }));

    const activeOrgId = activeOrg?.organization_id ?? null;
    const orgName = activeOrg?.organizations?.name || "Select Organization";
    const orgInitials = getInitials(orgName);

    const canCreate = userRole ? hasPermission(userRole, "organizations", "write") : false;

    const showLabel = !collapsed || isMobile;

    if (orgLoading) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2",
                    showLabel ? "px-2 py-1.5" : "justify-center p-1.5"
                )}
            >
                <div className="h-7 w-7 rounded-md bg-muted animate-shimmer shrink-0" />
                {showLabel && <div className="h-3.5 w-24 bg-muted animate-shimmer rounded" />}
            </div>
        );
    }

    const trigger = (
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg transition-colors hover:bg-sidebar-accent/60",
                showLabel ? "px-2 py-1.5 w-full" : "justify-center p-1.5"
            )}
        >
            <div className="h-7 w-7 rounded-md bg-primary/10 text-primary density-caption font-bold flex items-center justify-center shrink-0">
                {orgInitials !== "??" ? orgInitials : <Building2 className="h-3.5 w-3.5" />}
            </div>
            {showLabel && (
                <>
                    <span className="flex-1 text-sm font-semibold truncate text-sidebar-foreground">
                        {orgName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-sidebar-foreground/40 shrink-0" />
                </>
            )}
        </div>
    );

    if (memberships.length <= 1 && !canCreate) {
        return (
            <Tooltip content={orgName} side="right">
                <div
                    className={cn(
                        "flex items-center gap-2",
                        showLabel ? "px-2 py-1.5" : "justify-center p-1.5"
                    )}
                    aria-label={orgName}
                >
                    <div className="h-7 w-7 rounded-md bg-primary/10 text-primary density-caption font-bold flex items-center justify-center shrink-0">
                        {orgInitials !== "??" ? orgInitials : <Building2 className="h-3.5 w-3.5" />}
                    </div>
                    {showLabel && (
                        <span className="flex-1 text-sm font-semibold truncate text-sidebar-foreground">
                            {orgName}
                        </span>
                    )}
                </div>
            </Tooltip>
        );
    }

    return (
        <ContextSwitcherPopover
            items={orgItems}
            activeId={activeOrgId}
            onSelect={switchOrg}
            searchPlaceholder={CONTEXT_SWITCHER_STRINGS.org.searchPlaceholder}
            createLabel={CONTEXT_SWITCHER_STRINGS.org.createLabel}
            createHref="/onboarding/org-setup"
            canCreate={canCreate}
            emptyMessage={CONTEXT_SWITCHER_STRINGS.org.emptyMessage}
            trigger={trigger}
            label={CONTEXT_SWITCHER_STRINGS.org.switchLabel}
            width={280}
        />
    );
}
