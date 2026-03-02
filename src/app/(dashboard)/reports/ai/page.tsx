"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";
import {
    BarChart3,
    BookOpen,
    Clock,
    Download,
    LineChart,
    PieChart,
    RefreshCw,
    Send,
    Sparkles,
    Table2,
    TrendingUp,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

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

const MOCK_QUERIES: AiReportQuery[] = [
    {
        id: "aq1",
        query: "Show me project profitability by client for Q1 2026",
        generatedTitle: "Q1 2026 Project Profitability by Client",
        chartType: "bar",
        status: "completed",
        createdAt: "2026-03-12T14:30:00Z",
        executionTimeMs: 1250,
        dataPoints: 8,
    },
    {
        id: "aq2",
        query: "What is the utilization trend for the last 6 months?",
        generatedTitle: "Crew Utilization Trend — Oct 2025 to Mar 2026",
        chartType: "line",
        status: "completed",
        createdAt: "2026-03-12T14:15:00Z",
        executionTimeMs: 890,
        dataPoints: 24,
    },
    {
        id: "aq3",
        query: "Revenue breakdown by project category",
        generatedTitle: "Revenue Distribution by Category",
        chartType: "pie",
        status: "completed",
        createdAt: "2026-03-12T13:45:00Z",
        executionTimeMs: 650,
        dataPoints: 6,
    },
    {
        id: "aq4",
        query: "Top 10 overbudget projects this quarter",
        generatedTitle: "Top 10 Over-Budget Projects — Q1 2026",
        chartType: "table",
        status: "completed",
        createdAt: "2026-03-11T16:00:00Z",
        executionTimeMs: 1100,
        dataPoints: 10,
    },
    {
        id: "aq5",
        query: "Average time to close deals by stage",
        generatedTitle: "Deal Cycle Time by Pipeline Stage",
        chartType: "bar",
        status: "completed",
        createdAt: "2026-03-11T11:30:00Z",
        executionTimeMs: 780,
        dataPoints: 7,
    },
];

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

const MOCK_BAR_DATA = [
    { label: "Nike", value: 82 },
    { label: "Red Bull", value: 65 },
    { label: "Adidas", value: 45 },
    { label: "Samsung", value: 71 },
    { label: "Glossier", value: 58 },
    { label: "Apple", value: 90 },
];

export default function AiReportsPage() {
    const [queryInput, setQueryInput] = useState("");
    const [selectedQuery, setSelectedQuery] = useState<AiReportQuery | null>(
        MOCK_QUERIES[0] || null
    );

    return (
        <PermissionGate resource="reports" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="AI Report Generation"
                    description="Ask questions in natural language and get instant charts and data visualizations"
                >
                    <Badge variant="info" className="text-sm px-3 py-1">
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        AI-Powered
                    </Badge>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Reports Generated"
                        value={MOCK_QUERIES.length}
                        icon={BarChart3}
                    />
                    <StatCard
                        title="Avg Response"
                        value={`${Math.round(MOCK_QUERIES.reduce((s, q) => s + q.executionTimeMs, 0) / MOCK_QUERIES.length)}ms`}
                        icon={Clock}
                    />
                    <StatCard
                        title="Data Points"
                        value={MOCK_QUERIES.reduce((s, q) => s + q.dataPoints, 0)}
                        icon={Table2}
                    />
                    <StatCard
                        title="Suggestions"
                        value={SUGGESTED_QUERIES.length}
                        icon={BookOpen}
                    />
                </div>

                {/* Query Input */}
                <Card className="border-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-primary shrink-0" />
                            <input
                                type="text"
                                value={queryInput}
                                onChange={(e) => setQueryInput(e.target.value)}
                                placeholder="Ask a question... e.g., 'Show me revenue by project for Q1'"
                                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && queryInput.trim()) setQueryInput("");
                                }}
                            />
                            <Button size="sm" disabled={!queryInput.trim()}>
                                <Send className="h-3.5 w-3.5" /> Generate
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
                            <button
                                key={sq.label}
                                onClick={() => setQueryInput(sq.query)}
                                className="text-xs px-3 py-1.5 rounded-full border bg-secondary/30 hover:bg-secondary/60 transition-colors flex items-center gap-1.5"
                            >
                                <Badge variant="ghost" className="text-[9px] px-1">
                                    {sq.category}
                                </Badge>
                                {sq.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Query History */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Recent Queries
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {MOCK_QUERIES.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => setSelectedQuery(q)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedQuery?.id === q.id ? "bg-primary/10 border border-primary/30" : "bg-secondary/30 hover:bg-secondary/50"}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {CHART_ICONS[q.chartType]}
                                        <span className="text-[10px] text-muted-foreground">
                                            {q.executionTimeMs}ms
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium line-clamp-2">{q.query}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {formatDate(q.createdAt)}
                                    </p>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Chart Preview */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    {selectedQuery?.generatedTitle || "Select a query"}
                                </CardTitle>
                                {selectedQuery && (
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
                            {selectedQuery ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {CHART_ICONS[selectedQuery.chartType]}
                                        <span className="capitalize">
                                            {selectedQuery.chartType} chart
                                        </span>
                                        <span>·</span>
                                        <span>{selectedQuery.dataPoints} data points</span>
                                        <span>·</span>
                                        <span>{selectedQuery.executionTimeMs}ms</span>
                                    </div>

                                    {/* Mock Chart Visualization */}
                                    {selectedQuery.chartType === "bar" && (
                                        <div className="space-y-3">
                                            {MOCK_BAR_DATA.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="text-xs w-16 text-right text-muted-foreground">
                                                        {item.label}
                                                    </span>
                                                    <div className="flex-1 h-6 bg-secondary/30 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary/60 rounded-full transition-all"
                                                            style={{ width: `${item.value}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold w-10">
                                                        {item.value}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedQuery.chartType === "line" && (
                                        <div className="h-48 flex items-end gap-1 px-4">
                                            {[
                                                35, 42, 38, 55, 48, 62, 58, 70, 65, 72, 78, 75, 82,
                                                88, 80, 85, 90, 87, 92, 88, 95, 91, 88, 93,
                                            ].map((val, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-primary/40 rounded-t transition-all hover:bg-primary/60"
                                                    style={{ height: `${val}%` }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {selectedQuery.chartType === "pie" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                {
                                                    label: "Activations",
                                                    pct: 35,
                                                    color: "bg-primary",
                                                },
                                                { label: "Pop-Ups", pct: 22, color: "bg-info" },
                                                {
                                                    label: "Festivals",
                                                    pct: 18,
                                                    color: "bg-warning",
                                                },
                                                {
                                                    label: "Corporate",
                                                    pct: 15,
                                                    color: "bg-success",
                                                },
                                                {
                                                    label: "Launches",
                                                    pct: 7,
                                                    color: "bg-destructive",
                                                },
                                                {
                                                    label: "Other",
                                                    pct: 3,
                                                    color: "bg-muted-foreground",
                                                },
                                            ].map((seg) => (
                                                <div
                                                    key={seg.label}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30"
                                                >
                                                    <span
                                                        className={`h-3 w-3 rounded-full ${seg.color}`}
                                                    />
                                                    <span className="text-xs">{seg.label}</span>
                                                    <span className="text-xs font-bold ml-auto">
                                                        {seg.pct}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedQuery.chartType === "table" && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b text-left text-muted-foreground">
                                                        <th className="py-2 pr-4">Project</th>
                                                        <th className="py-2 pr-4">Budget</th>
                                                        <th className="py-2 pr-4">Actual</th>
                                                        <th className="py-2">Variance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        {
                                                            project: "Coachella Main Stage",
                                                            budget: "$450K",
                                                            actual: "$520K",
                                                            variance: "+$70K",
                                                        },
                                                        {
                                                            project: "Nike Air Max Launch",
                                                            budget: "$125K",
                                                            actual: "$138K",
                                                            variance: "+$13K",
                                                        },
                                                        {
                                                            project: "Samsung Galaxy Pop-Up",
                                                            budget: "$88K",
                                                            actual: "$95K",
                                                            variance: "+$7K",
                                                        },
                                                    ].map((row) => (
                                                        <tr
                                                            key={row.project}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="py-2 pr-4 font-medium">
                                                                {row.project}
                                                            </td>
                                                            <td className="py-2 pr-4">
                                                                {row.budget}
                                                            </td>
                                                            <td className="py-2 pr-4">
                                                                {row.actual}
                                                            </td>
                                                            <td className="py-2 text-destructive font-bold">
                                                                {row.variance}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground italic mt-2">
                                        &ldquo;{selectedQuery.query}&rdquo;
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Sparkles className="h-8 w-8 mb-2 opacity-30" />
                                    <p className="text-sm">Ask a question to generate a report</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PermissionGate>
    );
}
