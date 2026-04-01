"use client";

/* ═══════════════════════════════════════════════════════════════
   QUICK VIEW PANEL — Slide-panel record preview for list pages

   Renders inside SlidePanel with:
   - Header: title, status badge, entity icon
   - Compact stat cards
   - Key fields via FieldGrid (previewFields from QuickViewConfig)
   - Action strip: Open Full Page, Edit, Delete
   - Keyboard: Escape closes, ↑/↓ navigates prev/next record

   Triggered from ListPageShell when quickViewConfig is present.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FieldGrid } from "@/components/shells/field-grid";
import { LoadingState } from "@/components/layouts/loading-state";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { ChevronDown, ChevronUp, ExternalLink, Pencil } from "lucide-react";
import type { QuickViewConfig } from "@/types/detail-page-config";
import type { ListRowActionDef } from "@/types/list-page-config";
import { computeStatValue, getNestedValue } from "@/lib/formatters/record-utils";
import { useEntityMeta } from "@/hooks/use-entity-meta";
import type { EntityRecord } from "@/types/entity";

export interface QuickViewPanelProps {
    /** Whether the panel is open */
    open: boolean;
    /** Close handler */
    onClose: () => void;
    /** Quick view config (previewFields, stats, width) */
    config: QuickViewConfig;
    /** Entity key (snake_case) for API resolution */
    entityKey: string;
    /** Currently selected record ID */
    recordId: string | null;
    /** Record key used as title (default: "name") */
    titleKey?: string | undefined; /** Record key for subtitle */
    subtitleKey?: string | undefined; /** Record key for status badge */
    statusKey?: string | undefined; /** Custom title resolver */
    titleFn?: ((record: EntityRecord) => string) | undefined; /** Custom subtitle resolver */
    subtitleFn?: ((record: EntityRecord) => string) | undefined; /** Custom status resolver */
    statusFn?:
        | ((record: EntityRecord) => string)
        | undefined; /** Row actions to render in the action strip */
    rowActions?:
        | ListRowActionDef[]
        | undefined; /** All record IDs in current filtered list (for prev/next navigation) */
    recordIds?: string[] | undefined; /** Navigate to a different record */
    onNavigate?: ((recordId: string) => void) | undefined; /** Page icon */
    icon?: React.ComponentType<{ className?: string }> | undefined;
}

// ─── Component ───────────────────────────────────────────────

export function QuickViewPanel({
    open,
    onClose,
    config,
    entityKey,
    recordId,
    titleKey = "name",
    subtitleKey,
    statusKey,
    titleFn,
    subtitleFn,
    statusFn,
    rowActions,
    recordIds,
    onNavigate,
    icon: Icon,
}: QuickViewPanelProps) {
    const router = useRouter();
    const { basePath, slug } = useEntityMeta(entityKey);

    // Fetch the record
    const { data: rawData, isLoading } = useQuery({
        queryKey: [entityKey, "quick-view", recordId],
        queryFn: async () => apiGet<EntityRecord>(basePath, recordId!),
        enabled: open && !!recordId,
        placeholderData: keepPreviousData,
    });

    const record = (rawData as EntityRecord | undefined) ?? null;

    // Resolve header values
    const pageTitle = useMemo(() => {
        if (!record) return "";
        if (titleFn) return titleFn(record);
        return String(getNestedValue(record, titleKey) ?? record.id ?? "Untitled");
    }, [record, titleFn, titleKey]);

    const pageSubtitle = useMemo(() => {
        if (!record) return undefined;
        if (subtitleFn) return subtitleFn(record);
        if (subtitleKey) return String(getNestedValue(record, subtitleKey) ?? "");
        return undefined;
    }, [record, subtitleFn, subtitleKey]);

    const pageStatus = useMemo(() => {
        if (!record) return undefined;
        if (statusFn) return statusFn(record);
        if (statusKey) return String(getNestedValue(record, statusKey) ?? "");
        return undefined;
    }, [record, statusFn, statusKey]);

    // Stat values
    const statValues = useMemo(() => {
        if (!config.previewStats || !record) return null;
        return config.previewStats.map((s) => ({
            label: s.label,
            icon: s.icon,
            value: computeStatValue(s, record),
        }));
    }, [config.previewStats, record]);

    // Prev/next navigation
    const currentIndex = useMemo(() => {
        if (!recordIds || !recordId) return -1;
        return recordIds.indexOf(recordId);
    }, [recordIds, recordId]);

    const hasPrev = currentIndex > 0;
    const hasNext = recordIds ? currentIndex < recordIds.length - 1 : false;

    const goToPrev = useCallback(() => {
        if (hasPrev && recordIds && onNavigate) {
            onNavigate(recordIds[currentIndex - 1]!);
        }
    }, [hasPrev, recordIds, currentIndex, onNavigate]);

    const goToNext = useCallback(() => {
        if (hasNext && recordIds && onNavigate) {
            onNavigate(recordIds[currentIndex + 1]!);
        }
    }, [hasNext, recordIds, currentIndex, onNavigate]);

    // Keyboard navigation (↑/↓ for prev/next)
    useEffect(() => {
        if (!open || !config.navigable) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" && hasPrev) {
                e.preventDefault();
                goToPrev();
            } else if (e.key === "ArrowDown" && hasNext) {
                e.preventDefault();
                goToNext();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, config.navigable, hasPrev, hasNext, goToPrev, goToNext]);

    // Action handlers
    const handleOpenFullPage = useCallback(() => {
        if (recordId) {
            onClose();
            router.push(`/${slug}/${recordId}`);
        }
    }, [recordId, slug, router, onClose]);

    const handleEdit = useCallback(() => {
        if (recordId) {
            onClose();
            router.push(`/${slug}/${recordId}/edit`);
        }
    }, [recordId, slug, router, onClose]);

    // Filter out view/edit from rowActions (we have dedicated buttons for those)
    const extraActions = useMemo(() => {
        if (!rowActions) return [];
        return rowActions.filter((a) => a.id !== "view" && a.id !== "edit");
    }, [rowActions]);

    return (
        <SlidePanel open={open} onClose={onClose} width={config.width ?? "max-w-lg"}>
            {isLoading || !record ? (
                <LoadingState variant="card" />
            ) : (
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="shrink-0 pb-4">
                        <div className="flex items-start gap-3">
                            {Icon && (
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-semibold truncate">{pageTitle}</h2>
                                    {pageStatus && (
                                        <Badge variant={getStatusVariant(pageStatus)}>
                                            {getStatusLabel(pageStatus)}
                                        </Badge>
                                    )}
                                </div>
                                {pageSubtitle && (
                                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                        {pageSubtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Prev/Next navigation */}
                        {config.navigable && recordIds && recordIds.length > 1 && (
                            <div className="flex items-center gap-1 mt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToPrev}
                                    disabled={!hasPrev}
                                    className="h-7 px-2 text-xs"
                                    aria-label="Previous record"
                                >
                                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                                    Prev
                                </Button>
                                <span className="density-caption text-muted-foreground tabular-nums">
                                    {currentIndex + 1} / {recordIds.length}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToNext}
                                    disabled={!hasNext}
                                    className="h-7 px-2 text-xs"
                                    aria-label="Next record"
                                >
                                    Next
                                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto py-4 density-gap-section">
                        {/* Compact Stats */}
                        {statValues && statValues.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {statValues.map((s) => {
                                    const StatIcon = s.icon;
                                    return (
                                        <div
                                            key={s.label}
                                            className="rounded-lg border border-border/50 p-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                {StatIcon && (
                                                    <StatIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                )}
                                                <span className="density-caption font-medium text-muted-foreground uppercase tracking-wider">
                                                    {s.label}
                                                </span>
                                            </div>
                                            <p className="text-lg font-semibold mt-1 tabular-nums">
                                                {s.value}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Preview Fields */}
                        {config.previewFields.length > 0 && (
                            <FieldGrid fields={config.previewFields} record={record} singleColumn />
                        )}

                        {/* Extra actions (e.g. Delete) */}
                        {extraActions.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-1">
                                    {extraActions.map((action) => {
                                        const ActionIcon = action.icon;
                                        return (
                                            <Button
                                                key={action.id}
                                                variant={
                                                    action.variant === "destructive"
                                                        ? "destructive"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                className="w-full justify-start gap-2"
                                                onClick={() => action.onExecute(record)}
                                            >
                                                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                                                {action.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sticky action bar */}
                    <Separator />
                    <div className="shrink-0 flex items-center gap-2 pt-4">
                        <Button size="sm" onClick={handleOpenFullPage} className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            Open Full Page
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Pencil className="h-4 w-4 mr-1.5" />
                            Edit
                        </Button>
                    </div>
                </div>
            )}
        </SlidePanel>
    );
}

QuickViewPanel.displayName = "QuickViewPanel";
