"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA HEALTH DASHBOARD — Entity Data Completeness (GAP-CRW-01)

   Surfaces missing/incomplete data across crew, vendors, contacts,
   and assets using configurable completeness rules with weighted
   scoring. Built on OperationalDashboardShell pattern.

   Key features:
   - Per-entity-type tabs with completeness bars
   - Aggregate stat cards (avg %, complete, needs attention, critical)
   - "Show incomplete only" filter
   - Sortable by completeness score
   ═══════════════════════════════════════════════════════════════ */

import React, { useMemo, useState } from "react";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import {
    DATA_COMPLETENESS_RULES,
    useDataCompleteness,
    useDataCompletenessSummary,
} from "@/lib/data-hooks/hooks-feature-gaps";
import type { DataCompletenessResult } from "@/lib/data-hooks/hooks-feature-gaps";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Contact,
    Filter,
    HeartPulse,
    Package,
    TrendingUp,
    Users,
    XCircle,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────

const TAB_CONFIG = [
    { id: "crew", label: "Crew", icon: Users },
    { id: "vendors", label: "Vendors", icon: Building2 },
    { id: "contacts", label: "Contacts", icon: Contact },
    { id: "assets", label: "Assets", icon: Package },
] as const;

const TAB_IDS = TAB_CONFIG.map((t) => t.id);

// ─── Entity Table Component ─────────────────────────────────

function CompletenessTable({ entityType }: { entityType: string }) {
    const { data: results, isLoading } = useDataCompleteness(entityType);
    const [search, setSearch] = useState("");
    const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

    const filtered = useMemo(() => {
        if (!results) return [];
        let list = results;

        if (showIncompleteOnly) {
            list = list.filter((r: DataCompletenessResult) => r.completenessPercent < 100);
        }

        if (search) {
            const q = search.toLowerCase();
            list = list.filter((r: DataCompletenessResult) => r.name.toLowerCase().includes(q));
        }

        return [...list].sort(
            (a: DataCompletenessResult, b: DataCompletenessResult) =>
                a.completenessPercent - b.completenessPercent
        );
    }, [results, search, showIncompleteOnly]);

    const rule = DATA_COMPLETENESS_RULES.find((r) => r.entityType === entityType);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-muted/50 rounded-lg motion-safe:animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder={`Search ${entityType}...`}
                    className="max-w-sm"
                />
                <Button
                    variant={showIncompleteOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
                    className="shrink-0"
                >
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    {showIncompleteOnly ? "Showing Incomplete" : "Show Incomplete Only"}
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                    {filtered.length} of {results?.length ?? 0} records
                </span>
            </div>

            {/* Records */}
            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">All records are complete!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            No missing data found for {entityType}.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-1.5">
                    {filtered.map((record: DataCompletenessResult) => (
                        <Card key={record.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center gap-4">
                                    {/* Name + score */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium truncate">
                                                {record.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    record.completenessPercent === 100
                                                        ? "success"
                                                        : record.completenessPercent >= 75
                                                          ? "info"
                                                          : record.completenessPercent >= 50
                                                            ? "warning"
                                                            : "destructive"
                                                }
                                                className="text-[10px] px-1.5"
                                            >
                                                {record.completenessPercent}%
                                            </Badge>
                                        </div>
                                        {record.missingFields.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {record.missingFields.map((f) => (
                                                    <span
                                                        key={f.field}
                                                        className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded"
                                                    >
                                                        {f.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-32 shrink-0">
                                        <ProgressBar value={record.completenessPercent} size="sm" />
                                        <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                                            {record.filledCount}/{record.totalCount} fields
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Field legend */}
            {rule && (
                <Card className="mt-4">
                    <CardHeader className="py-2 px-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Tracked Fields
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                        <div className="flex flex-wrap gap-2">
                            {rule.requiredFields.map((f) => (
                                <span
                                    key={f.field}
                                    className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1"
                                >
                                    {f.label}
                                    <span className="text-[9px] text-muted-foreground">
                                        w{f.weight}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────

export default function DataHealthPage() {
    const [activeTab, setActiveTab] = useQueryTabState({
        defaultValue: "crew",
        validValues: TAB_IDS as unknown as string[],
    });

    // Get summaries for all entity types (for stat cards)
    const { summary: crewSummary } = useDataCompletenessSummary("crew");
    const { summary: vendorsSummary } = useDataCompletenessSummary("vendors");
    const { summary: contactsSummary } = useDataCompletenessSummary("contacts");
    const { summary: assetsSummary } = useDataCompletenessSummary("assets");

    const allSummaries = useMemo(
        () => [crewSummary, vendorsSummary, contactsSummary, assetsSummary].filter(Boolean),
        [crewSummary, vendorsSummary, contactsSummary, assetsSummary]
    );

    const overallAvg = useMemo(() => {
        if (allSummaries.length === 0) return 0;
        const total = allSummaries.reduce((s, summary) => s + (summary?.avgCompleteness ?? 0), 0);
        return Math.round(total / allSummaries.length);
    }, [allSummaries]);

    const totalNeedsAttention = allSummaries.reduce(
        (s, summary) => s + (summary?.needsAttention ?? 0),
        0
    );
    const totalComplete = allSummaries.reduce((s, summary) => s + (summary?.fullyComplete ?? 0), 0);
    const totalCritical = allSummaries.reduce((s, summary) => s + (summary?.criticalGaps ?? 0), 0);

    const config: DashboardPageConfig = useMemo(
        () => ({
            configKey: "DATA_HEALTH",
            title: "Data Health",
            description:
                "Monitor data completeness across your organization. Identify missing fields and ensure records meet quality standards.",
            resource: "dashboard",
            action: "read",
            stats: [
                {
                    label: "Overall Completeness",
                    icon: TrendingUp,
                    compute: () => `${overallAvg}%`,
                },
                {
                    label: "Fully Complete",
                    icon: CheckCircle2,
                    compute: () => String(totalComplete),
                },
                {
                    label: "Needs Attention",
                    icon: AlertTriangle,
                    compute: () => String(totalNeedsAttention),
                },
                {
                    label: "Critical Gaps",
                    icon: XCircle,
                    compute: () => String(totalCritical),
                },
            ],
            emptyState: {
                title: "No Entity Data Found",
                description:
                    "Add crew members, vendors, contacts, or assets to begin tracking data completeness.",
                icon: HeartPulse,
            },
            contentSlot: (
                <>
                    <TabBar
                        items={TAB_CONFIG.map((t) => ({
                            id: t.id,
                            label: t.label,
                            icon: <t.icon className="h-4 w-4" />,
                        }))}
                        value={activeTab}
                        onValueChange={setActiveTab}
                        ariaLabel="Entity type tabs"
                    />
                    {TAB_CONFIG.map((tab) => (
                        <TabPanel key={tab.id} value={tab.id} activeValue={activeTab}>
                            <CompletenessTable entityType={tab.id} />
                        </TabPanel>
                    ))}
                </>
            ),
        }),
        [activeTab, setActiveTab, overallAvg, totalComplete, totalNeedsAttention, totalCritical]
    );

    return <OperationalDashboardShell config={config} />;
}
