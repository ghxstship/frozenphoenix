"use client";

/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE SHELL — Universal composable settings container

   Composes PermissionGate, PageHeader, TabBar (URL-synced),
   and settings sections from a pure-data SettingsPageConfig.
   Handles tab routing, section rendering, and consistent layout.

   Pattern B from NON_LIST_PAGE_INFRASTRUCTURE_AUDIT.md:
   PermissionGate → PageHeader → TabBar → Settings sections

   Target: ~10 settings-pattern pages
   ═══════════════════════════════════════════════════════════════ */

import React, { useMemo } from "react";
import { PermissionGate } from "@/components/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
    SettingsPageConfig,
    SettingsRowDef,
    SettingsSectionDef,
} from "@/types/settings-page-config";

// ─── Types ───────────────────────────────────────────────────

export interface SettingsPageShellProps {
    config: SettingsPageConfig;
    /** Children override — when provided, replaces all tab content */
    children?: React.ReactNode;
}

// ─── Row Renderer ────────────────────────────────────────────

function SettingsRowRenderer({ row }: { row: SettingsRowDef }) {
    if (row.render) return <>{row.render()}</>;

    const RowIcon = row.icon;

    return (
        <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
                {RowIcon && (
                    <div className="mt-0.5 shrink-0">
                        <RowIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">{row.label}</p>
                    {row.description && (
                        <p className="text-xs text-muted-foreground mt-1">{row.description}</p>
                    )}
                </div>
            </div>
            <div className="shrink-0">
                {row.type === "toggle" && (
                    <Button
                        variant={row.value ? "default" : "outline"}
                        size="sm"
                        disabled={row.disabled}
                        onClick={() => row.onChange?.(!row.value)}
                        aria-pressed={Boolean(row.value)}
                    >
                        {row.value ? "On" : "Off"}
                    </Button>
                )}
                {row.type === "select" && row.options && (
                    <select
                        value={String(row.value ?? "")}
                        onChange={(e) => row.onChange?.(e.target.value)}
                        disabled={row.disabled}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={row.label}
                    >
                        {row.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                )}
                {row.type === "input" && (
                    <Input
                        value={String(row.value ?? "")}
                        onChange={(e) => row.onChange?.(e.target.value)}
                        placeholder={row.placeholder}
                        disabled={row.disabled}
                        className="max-w-xs"
                        aria-label={row.label}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Section Renderer ────────────────────────────────────────

function SettingsSectionRenderer({ section }: { section: SettingsSectionDef }) {
    if (section.content) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    {section.description && (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}
                </CardHeader>
                <CardContent>{section.content}</CardContent>
            </Card>
        );
    }

    if (!section.rows || section.rows.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-0">
                {section.rows.map((row) => (
                    <SettingsRowRenderer key={row.key} row={row} />
                ))}
            </CardContent>
        </Card>
    );
}

// ─── Main Component ─────────────────────────────────────────

export function SettingsPageShell({ config, children }: SettingsPageShellProps) {
    const tabIds = useMemo(() => config.tabs.map((t) => t.id), [config.tabs]);
    const [activeTab, setActiveTab] = useQueryTabState({
        key: config.tabParamKey ?? "tab",
        defaultValue: config.tabs[0]?.id ?? "default",
        validValues: tabIds,
    });

    const tabItems = useMemo(
        () =>
            config.tabs.map((t) => ({
                id: t.id,
                label: t.label,
                icon: t.icon ? React.createElement(t.icon, { className: "h-4 w-4" }) : undefined,
            })),
        [config.tabs]
    );

    const isVertical = config.orientation === "vertical";

    const tabContent = children
        ? children
        : config.tabs.map((tab) => (
              <TabPanel key={tab.id} value={tab.id} activeValue={activeTab}>
                  {tab.content ? (
                      tab.content
                  ) : tab.sections ? (
                      <div className="space-y-6">
                          {tab.sections.map((section) => (
                              <SettingsSectionRenderer key={section.id} section={section} />
                          ))}
                      </div>
                  ) : null}
              </TabPanel>
          ));

    return (
        <PermissionGate
            resource={config.resource}
            action={config.action as "read" | "write" | "delete" | "manage" | undefined}
        >
            <div className="space-y-6 motion-safe:animate-fade-in">
                <PageHeader title={config.title} description={config.description}>
                    {config.headerActions}
                </PageHeader>

                {isVertical ? (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <Card className="lg:w-64 shrink-0">
                            <CardContent className="p-2">
                                <TabBar
                                    items={tabItems}
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    ariaLabel={`${config.title} tabs`}
                                    orientation="vertical"
                                    variant="pill"
                                    className="w-full"
                                />
                            </CardContent>
                        </Card>
                        <div className="flex-1 space-y-6">
                            <div
                                role="tabpanel"
                                id={`settings-tabs-tabpanel-${activeTab}`}
                                aria-labelledby={`settings-tabs-tab-${activeTab}`}
                            >
                                {tabContent}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <TabBar
                            items={tabItems}
                            value={activeTab}
                            onValueChange={setActiveTab}
                            ariaLabel={`${config.title} tabs`}
                            className="overflow-x-auto scrollbar-hide"
                        />
                        {tabContent}
                    </>
                )}
            </div>
        </PermissionGate>
    );
}

SettingsPageShell.displayName = "SettingsPageShell";
