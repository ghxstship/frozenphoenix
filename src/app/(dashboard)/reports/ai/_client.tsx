"use client";

import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
    BarChart3,
    BookOpen,
    Clock,
    Download,
    LineChart,
    Loader2,
    PieChart,
    RefreshCw,
    Send,
    Sparkles,
    Table2,
    TrendingUp,
} from "lucide-react";
import { useAiReportQueries, useCreateAiReportQuery } from "@/lib/supabase";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

interface AiReportQuery {
    id: string;
    query: string;
    generatedTitle: string;
    chartType: "bar" | "line" | "pie" | "table" | "metric";
    status: "completed" | "generating" | "failed";
    createdAt: string;
    executionTimeMs: number;
    dataPoints: number;
}

interface SuggestedQuery {
    label: string;
    query: string;
    category: string;
}

const SUGGESTED_QUERIES: SuggestedQuery[] = [
    {
        label: "Monthly burn rate vs budget",
        query: "Show monthly burn rate compared to budget for all active projects",
        category: "Finance",
    },
    {
        label: "Crew availability next 2 weeks",
        query: "Show crew availability and booking status for the next 14 days",
        category: "Resources",
    },
    {
        label: "Invoice aging summary",
        query: "Show invoice aging breakdown by 30/60/90 day buckets",
        category: "Finance",
    },
    {
        label: "Project completion forecast",
        query: "Forecast completion dates for all in-progress projects based on current velocity",
        category: "Projects",
    },
    {
        label: "Vendor spend this quarter",
        query: "Top vendors by spend amount for Q1 2026",
        category: "Vendors",
    },
    {
        label: "Event ROI comparison",
        query: "Compare ROI across all completed events this year",
        category: "Events",
    },
];

const CHART_ICONS: Record<string, React.ReactNode> = {
    bar: <BarChart3 className="h-4 w-4" />,
    line: <LineChart className="h-4 w-4" />,
    pie: <PieChart className="h-4 w-4" />,
    table: <Table2 className="h-4 w-4" />,
    metric: <TrendingUp className="h-4 w-4" />,
};

export function AiReportsPageClient() {
    const [queryInput, setQueryInput] = useState("");

    const { data: sbQueries, isLoading } = useAiReportQueries();
    const createQuery = useCreateAiReportQuery();

    const handleGenerateReport = useCallback(() => {
        const trimmed = queryInput.trim();
        if (!trimmed || createQuery.isPending) return;
        createQuery.mutate(
            {
                query: trimmed,
                status: "generating",
                chart_type: "bar",
                generated_title: trimmed.length > 60 ? trimmed.slice(0, 57) + "..." : trimmed,
                data_points: 0,
                execution_time_ms: 0,
            },
            { onSuccess: () => setQueryInput("") }
        );
    }, [queryInput, createQuery]);

    const queries: AiReportQuery[] = useMemo(
        () =>
            (sbQueries ?? []).map((q: Record<string, unknown>) => ({
                id: String(q.id),
                query: String(q.query ?? ""),
                generatedTitle: String(q.generated_title ?? q.title ?? ""),
                chartType: (q.chart_type as AiReportQuery["chartType"]) ?? "bar",
                status: (q.status as AiReportQuery["status"]) ?? "completed",
                createdAt: String(q.created_at ?? ""),
                executionTimeMs: Number(q.execution_time_ms ?? 0),
                dataPoints: Number(q.data_points ?? 0),
            })),
        [sbQueries]
    );

    const [selectedQuery, setSelectedQuery] = useState<AiReportQuery | null>(null);

    const activeQuery = selectedQuery ?? queries[0] ?? null;

    const config: ListPageConfig = useMemo(
        () => ({
            entityKey: "reports",
            resource: "reports",
            action: "read",
            title: "AI Report Generation",
            description:
                "Ask questions in natural language and get instant charts and data visualizations",
            headerActions: (
                <Badge variant="info" className="text-sm px-3 py-1">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    AI-Powered
                </Badge>
            ),
            stats: [
                {
                    label: "Reports Generated",
                    icon: BarChart3,
                    compute: (d) => d.length,
                },
                {
                    label: "Avg Response",
                    icon: Clock,
                    compute: (d) =>
                        d.length > 0
                            ? `${Math.round(d.reduce((s, q) => s + Number(q.executionTimeMs ?? 0), 0) / d.length)}ms`
                            : "—",
                },
                {
                    label: "Data Points",
                    icon: Table2,
                    compute: (d) => d.reduce((s, q) => s + Number(q.dataPoints ?? 0), 0),
                },
                { label: "Suggestions", icon: BookOpen, value: SUGGESTED_QUERIES.length },
            ],
            contentSlot: (
                <>
                    {/* Query Input */}
                    <Card className="border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                                <Input
                                    type="text"
                                    value={queryInput}
                                    onChange={(e) => setQueryInput(e.target.value)}
                                    placeholder="Ask a question... e.g., 'Show me revenue by project for Q1'"
                                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleGenerateReport();
                                    }}
                                />
                                <Button
                                    size="sm"
                                    disabled={!queryInput.trim() || createQuery.isPending}
                                    onClick={handleGenerateReport}
                                >
                                    {createQuery.isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" />
                                    ) : (
                                        <Send className="h-3.5 w-3.5" />
                                    )}
                                    {createQuery.isPending ? "Generating..." : "Generate"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suggested Queries */}
                    <div>
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                            Suggested Questions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_QUERIES.map((sq) => (
                                <Button
                                    key={sq.label}
                                    variant="outline"
                                    onClick={() => setQueryInput(sq.query)}
                                    className="text-xs h-auto px-3 py-1.5 rounded-full gap-1.5"
                                >
                                    <Badge variant="ghost" className="density-caption px-1">
                                        {sq.category}
                                    </Badge>
                                    {sq.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 density-gap-card">
                        {/* Query History */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Recent Queries
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {queries.map((q) => (
                                    <Button
                                        key={q.id}
                                        variant="ghost"
                                        onClick={() => setSelectedQuery(q)}
                                        className={`w-full justify-start h-auto p-3 rounded-lg ${activeQuery?.id === q.id ? "bg-primary/10 border border-primary/30" : "bg-secondary/30 hover:bg-secondary/50"}`}
                                    >
                                        <div className="w-full text-left">
                                            <div className="flex items-center gap-2 mb-1">
                                                {CHART_ICONS[q.chartType]}
                                                <span className="density-caption text-muted-foreground">
                                                    {q.executionTimeMs}ms
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium line-clamp-2">
                                                {q.query}
                                            </p>
                                            <p className="density-caption text-muted-foreground mt-1">
                                                {formatDate(q.createdAt)}
                                            </p>
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Chart Preview */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {activeQuery?.generatedTitle || "Select a query"}
                                    </CardTitle>
                                    {activeQuery && (
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline">
                                                <RefreshCw className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Download className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {activeQuery ? (
                                    <div className="density-gap-section">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {CHART_ICONS[activeQuery.chartType]}
                                            <span className="capitalize">
                                                {activeQuery.chartType} chart
                                            </span>
                                            <span>·</span>
                                            <span>{activeQuery.dataPoints} data points</span>
                                            <span>·</span>
                                            <span>{activeQuery.executionTimeMs}ms</span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                            {CHART_ICONS[activeQuery.chartType]}
                                            <p className="text-sm mt-2">
                                                Chart visualization requires result data
                                            </p>
                                        </div>

                                        <p className="density-caption text-muted-foreground italic mt-2">
                                            &ldquo;{activeQuery.query}&rdquo;
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <Sparkles className="h-8 w-8 mb-2 opacity-30" />
                                        <p className="text-sm">
                                            Ask a question to generate a report
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            ),
        }),
        [queries, activeQuery, queryInput, createQuery.isPending, handleGenerateReport]
    );

    return (
        <ListPageShell
            config={config}
            data={queries as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
