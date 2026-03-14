"use client";

/* ═══════════════════════════════════════════════════════════════
   ROW ACTIONS MENU — Reusable per-row action dropdown

   Renders a ListRowActionDef[] array as a DropdownMenu anchored
   to a MoreHorizontal icon button. Consumed by ListPageShell
   and any component that needs declarative per-row actions.

   Accessibility: full keyboard nav, ARIA labelling, focus trap
   via DropdownMenu primitive. Destructive actions are visually
   distinguished.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ListRowActionDef } from "@/types/list-page-config";

// ─── Types ───────────────────────────────────────────────────

export interface RowActionsMenuProps {
    /** The record this menu acts on */
    record: Record<string, unknown>;
    /** Declarative action definitions */
    actions: ListRowActionDef[];
    /** Optional aria-label override */
    ariaLabel?: string;
}

// ─── Component ───────────────────────────────────────────────

export function RowActionsMenu({ record, actions, ariaLabel }: RowActionsMenuProps) {
    if (actions.length === 0) return null;

    // Split actions into default and destructive groups
    const defaultActions = actions.filter((a) => a.variant !== "destructive");
    const destructiveActions = actions.filter((a) => a.variant === "destructive");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity"
                    aria-label={ariaLabel ?? "Row actions"}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {defaultActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <DropdownMenuItem key={action.id} onClick={() => action.onExecute(record)}>
                            {Icon && <Icon className="h-4 w-4 mr-2" />}
                            {action.label}
                        </DropdownMenuItem>
                    );
                })}
                {defaultActions.length > 0 && destructiveActions.length > 0 && (
                    <DropdownMenuSeparator />
                )}
                {destructiveActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <DropdownMenuItem
                            key={action.id}
                            className="text-destructive"
                            onClick={() => action.onExecute(record)}
                        >
                            {Icon && <Icon className="h-4 w-4 mr-2" />}
                            {action.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

RowActionsMenu.displayName = "RowActionsMenu";
