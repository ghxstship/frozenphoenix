"use client";

/* ═══════════════════════════════════════════════════════════════
   DETAIL PAGE SHELL — Universal composable detail page container

   Composes DetailLayout, FieldGrid, RelatedEntities, and tabs
   from a pure-data DetailPageConfig. Handles data fetching,
   loading/error states, RBAC, and tab routing.

   Supports two modes:
   1. Self-fetching: pass `id` and shell fetches via apiGet
   2. External data: pass `record`/`isLoading` from your own hooks

   Replaces: hand-built detail/[id] pages using DetailLayout.
   ═══════════════════════════════════════════════════════════════ */

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { LoadingState } from "@/components/layouts/loading-state";
import { SkeletonCrossfade } from "@/components/ui/skeleton-crossfade";
import { DetailLayout } from "@/components/layouts/detail-layout";
import type { DetailLayoutProps } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { PermissionGate } from "@/components/app/permission-guard";
import { FieldGrid } from "@/components/shells/field-grid";
import { RelatedEntitiesSection } from "@/components/shells/related-entities";
import { RecordChatter } from "@/components/activity";
import { LayoutList } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";
import type { TabBarItem } from "@/components/ui/tab-bar";
import { computeStatValue, getNestedValue } from "@/lib/formatters/record-utils";
import { useEntityMeta } from "@/hooks/use-entity-meta";
import type { EntityRecord } from "@/types/entity";

// ─── Main Component ─────────────────────────────────────────

interface DetailPageShellProps {
    config: DetailPageConfig;
    id: string;
    /** External record — bypasses internal apiGet fetch when provided */
    record?:
        | EntityRecord
        | null
        | undefined; /** External loading state — used with `record` prop */
    isLoading?:
        | boolean
        | undefined; /** Menu items passed through to DetailLayout (e.g. from useDetailCrud) */
    menuItems?:
        | DetailLayoutProps["menuItems"]
        | undefined; /** Custom action buttons (Approve, Start Work, etc.) */
    actions?: React.ReactNode | undefined; /** Custom avatar element */
    avatar?: React.ReactNode | undefined;
}

export function DetailPageShell({
    config,
    id,
    record: externalRecord,
    isLoading: externalLoading,
    menuItems,
    actions,
    avatar,
}: DetailPageShellProps) {
    const {
        entityConfig,
        resource: metaResource,
        basePath: metaBasePath,
        slug: metaSlug,
        displayNamePlural,
    } = useEntityMeta(config.entityKey);
    const [activeTab, setActiveTab] = useState("overview");

    // Resolve entity metadata
    const resource = entityConfig?.resource ?? metaResource;
    const basePath = entityConfig?.basePath ?? metaBasePath;
    const slug = entityConfig?.slug ?? metaSlug;
    const backHref = config.backHref ?? `/${slug}`;
    const backLabel = config.backLabel ?? displayNamePlural ?? "Back";
    const Icon = config.icon ?? LayoutList;

    // Determine if we use external data or self-fetch
    const useExternalData = externalRecord !== undefined;

    // Self-fetch single record (skipped when external data provided)
    const {
        data: rawData,
        isLoading: selfLoading,
        isError: selfError,
    } = useQuery({
        queryKey: [config.entityKey, "detail", id],
        queryFn: async () => {
            return apiGet<EntityRecord>(basePath, id);
        },
        enabled: !!id && !useExternalData,
    });

    const record: EntityRecord | null = useExternalData
        ? (externalRecord as EntityRecord | null)
        : ((rawData as EntityRecord | undefined) ?? null);
    const isLoading = useExternalData ? (externalLoading ?? false) : selfLoading;
    const isError = useExternalData ? false : selfError;

    // Chatter state (auto-managed when config.chatter is true)
    const [chatterComments, setChatterComments] = useState<
        { id: string; authorId: string; authorName: string; content: string; createdAt: string }[]
    >([]);
    const handleAddComment = useMemo(
        () =>
            config.chatter !== false
                ? async (content: string) => {
                      setChatterComments((prev) => [
                          ...prev,
                          {
                              id: `c-${Date.now()}`,
                              authorId: "u1",
                              authorName: "You",
                              content,
                              createdAt: new Date().toISOString(),
                          },
                      ]);
                  }
                : undefined,
        [config.chatter]
    );

    // Build tabs
    const tabs = useMemo((): TabBarItem[] => {
        const items: TabBarItem[] = [{ id: "overview", label: "Overview" }];

        // Related entity tabs
        if (config.relatedEntities) {
            for (const rel of config.relatedEntities) {
                items.push({
                    id: `related-${rel.entityKey}`,
                    label: rel.title,
                    icon: rel.icon
                        ? React.createElement(rel.icon, { className: "h-4 w-4" })
                        : undefined,
                });
            }
        }

        // Custom tabs
        if (config.tabs) {
            for (const tab of config.tabs) {
                items.push({
                    id: tab.id,
                    label: tab.label,
                    icon: tab.icon
                        ? React.createElement(tab.icon, { className: "h-4 w-4" })
                        : undefined,
                    count: tab.count,
                });
            }
        }

        // Auto chatter tab
        if (config.chatter !== false) {
            items.push({ id: "chatter", label: "Activity" });
        }

        return items;
    }, [config.relatedEntities, config.tabs, config.chatter]);

    // Stat values
    const statValues = useMemo(() => {
        if (!config.stats || !record) return null;
        return config.stats.map((s) => ({
            label: s.label,
            icon: s.icon,
            value: computeStatValue(s, record),
            fieldType: s.fieldType,
            fieldConfig: s.fieldConfig,
        }));
    }, [config.stats, record]);

    if (isLoading) {
        return (
            <SkeletonCrossfade isLoading skeleton={<LoadingState />}>
                {null}
            </SkeletonCrossfade>
        );
    }

    if (isError) {
        return (
            <div className="py-16 text-center text-muted-foreground">
                <Icon className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
                <p className="text-lg font-medium">Failed to load record</p>
                <p className="text-sm mt-1">
                    Something went wrong loading this{" "}
                    {entityConfig?.displayName?.toLowerCase() ?? "record"}. Please try again or
                    contact support if the problem persists.
                </p>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="py-16 text-center text-muted-foreground">
                <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Record not found</p>
                <p className="text-sm mt-1">
                    The requested {entityConfig?.displayName ?? "record"} could not be loaded.
                </p>
            </div>
        );
    }

    // Resolve header fields
    const pageTitle = config.titleFn
        ? config.titleFn(record)
        : (String(
              getNestedValue(record, config.titleKey ?? "name") ?? record.id ?? "Untitled"
          ) as string);
    const pageSubtitle = config.subtitleFn
        ? config.subtitleFn(record)
        : config.subtitleKey
          ? String(getNestedValue(record, config.subtitleKey) ?? "")
          : undefined;
    const pageStatus = config.statusFn
        ? config.statusFn(record)
        : config.statusKey
          ? String(getNestedValue(record, config.statusKey) ?? "")
          : undefined;

    // Sidebar
    const sidebar =
        config.sidebarSlot ??
        (config.sidebarFields && config.sidebarFields.length > 0 ? (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <FieldGrid fields={config.sidebarFields} record={record} singleColumn />
                </CardContent>
            </Card>
        ) : undefined);

    // Resolve chatter record type
    const chatterRecordType = config.chatterRecordType ?? config.entityKey.replace(/-/g, "_");

    // Render active tab content
    const renderTabContent = () => {
        if (activeTab === "overview") {
            return (
                config.overviewSlot ?? (
                    <div className="density-gap-page">
                        {/* Stats */}
                        {statValues && statValues.length > 0 && (
                            <StatsGrid>
                                {statValues.map((s) => (
                                    <StatCard
                                        key={s.label}
                                        title={s.label}
                                        value={
                                            s.fieldType
                                                ? String(s.value)
                                                : typeof s.value === "number"
                                                  ? s.value
                                                  : String(s.value)
                                        }
                                        icon={s.icon}
                                    />
                                ))}
                            </StatsGrid>
                        )}

                        {/* Field Grid */}
                        {config.fields.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FieldGrid fields={config.fields} record={record} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )
            );
        }

        // Auto chatter tab
        if (activeTab === "chatter" && config.chatter !== false && handleAddComment) {
            return (
                <RecordChatter
                    recordType={chatterRecordType}
                    recordId={String(record.id)}
                    comments={chatterComments}
                    onAddComment={handleAddComment}
                />
            );
        }

        // Related entity tabs
        if (activeTab.startsWith("related-")) {
            const relKey = activeTab.replace("related-", "");
            const relDef = config.relatedEntities?.find((r) => r.entityKey === relKey);
            if (relDef) {
                return <RelatedEntitiesSection def={relDef} parentId={String(record.id)} />;
            }
        }

        // Custom tabs
        const customTab = config.tabs?.find((t) => t.id === activeTab);
        if (customTab?.content) {
            return customTab.content;
        }

        return null;
    };

    return (
        <PermissionGate resource={resource} action="read">
            <DetailLayout
                backHref={backHref}
                backLabel={backLabel}
                title={pageTitle}
                subtitle={pageSubtitle || undefined}
                status={pageStatus || undefined}
                avatar={avatar}
                actions={actions}
                menuItems={menuItems}
                tabs={tabs.length > 1 ? tabs : undefined}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sidebar={sidebar}
                entityType={config.messagingEntityType ?? config.entityKey.replace(/_/g, "-")}
                entityId={String(record.id)}
            >
                {renderTabContent()}
            </DetailLayout>
        </PermissionGate>
    );
}

DetailPageShell.displayName = "DetailPageShell";
