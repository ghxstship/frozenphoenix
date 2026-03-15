"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatCurrency } from "@/lib/utils";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    PieChart,
    TrendingUp,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { LoadingState } from "@/components/layouts/loading-state";
import {
    useRevenueRecognitionEntries,
    useRevenueRecognitionSummary,
} from "@/lib/supabase/hooks-v2-features";

type RevRecTab = "entries" | "summary" | "schedules";

interface RevenueEntry {
    id: string;
    projectName: string;
    invoiceNumber: string;
    totalAmount: number;
    recognizedAmount: number;
    deferredAmount: number;
    recognitionMethod:
        | "completed_contract"
        | "percentage_of_completion"
        | "milestone"
        | "time_and_materials";
    period: string;
    status: "recognized" | "deferred" | "partial" | "pending_review";
}

interface RevenueSummary {
    period: string;
    totalRevenue: number;
    recognizedRevenue: number;
    deferredRevenue: number;
    unbilledRevenue: number;
}

const STATUS_BADGE: Record<string, "default" | "success" | "warning" | "info" | "destructive"> = {
    recognized: "success",
    deferred: "warning",
    partial: "info",
    pending_review: "default",
};

const METHOD_LABELS: Record<string, string> = {
    completed_contract: "Completed Contract",
    percentage_of_completion: "% of Completion",
    milestone: "Milestone",
    time_and_materials: "T&M",
};

export default function RevenueRecognitionPage() {
    const [activeTab, setActiveTab] = useQueryTabState<RevRecTab>({
        key: "tab",
        defaultValue: "entries",
        validValues: ["entries", "summary", "schedules"],
    });

    const { data: sbEntries, isLoading: loadingEntries } = useRevenueRecognitionEntries();
    const { data: sbSummary, isLoading: loadingSummary } = useRevenueRecognitionSummary();

    const entries: RevenueEntry[] = useMemo(
        () =>
            (sbEntries ?? []).map((e: Record<string, unknown>) => {
                const proj = e.projects as Record<string, unknown> | null;
                return {
                    id: String(e.id),
                    projectName: String(proj?.name ?? e.project_id ?? ""),
                    invoiceNumber: String(e.invoice_number ?? ""),
                    totalAmount: Number(e.total_amount ?? 0),
                    recognizedAmount: Number(e.recognized_amount ?? 0),
                    deferredAmount: Number(e.deferred_amount ?? 0),
                    recognitionMethod:
                        (e.recognition_method as RevenueEntry["recognitionMethod"]) ??
                        "completed_contract",
                    period: String(e.period ?? ""),
                    status: (e.status as RevenueEntry["status"]) ?? "pending_review",
                };
            }),
        [sbEntries]
    );

    const summaries: RevenueSummary[] = useMemo(
        () =>
            (sbSummary ?? []).map((s: Record<string, unknown>) => ({
                period: String(s.period ?? ""),
                totalRevenue: Number(s.total_revenue ?? 0),
                recognizedRevenue: Number(s.recognized_revenue ?? 0),
                deferredRevenue: Number(s.deferred_revenue ?? 0),
                unbilledRevenue: Number(s.unbilled_revenue ?? 0),
            })),
        [sbSummary]
    );

    const isLoading = loadingEntries || loadingSummary;
    if (isLoading) return <LoadingState />;

    const totalRecognized = entries.reduce((s, e) => s + e.recognizedAmount, 0);
    const totalDeferred = entries.reduce((s, e) => s + e.deferredAmount, 0);
    const totalRevenue = entries.reduce((s, e) => s + e.totalAmount, 0);
    const pendingReview = entries.filter((e) => e.status === "pending_review").length;

    const tabs = [
        {
            id: "entries" as const,
            label: "Entries",
            count: entries.length,
            icon: <FileText className="h-4 w-4" />,
        },
        {
            id: "summary" as const,
            label: "Period Summary",
            count: summaries.length,
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            id: "schedules" as const,
            label: "Recognition Schedules",
            icon: <Calendar className="h-4 w-4" />,
        },
    ];

    return (
        <PermissionGate resource="finance" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Revenue Recognition"
                    description="ASC 606 / IFRS 15 compliant revenue recognition tracking across projects"
                >
                    <Button size="sm">
                        <TrendingUp className="h-4 w-4" /> Run Recognition
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Recognized Revenue"
                        value={formatCurrency(totalRecognized)}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        title="Deferred Revenue"
                        value={formatCurrency(totalDeferred)}
                        icon={Clock}
                    />
                    <StatCard
                        title="Total Billed"
                        value={formatCurrency(totalRevenue)}
                        icon={DollarSign}
                    />
                    <StatCard title="Pending Review" value={pendingReview} icon={AlertTriangle} />
                </div>

                <TabBar
                    items={tabs}
                    value={activeTab}
                    onValueChange={(id) => setActiveTab(id as RevRecTab)}
                />

                <TabPanel value="entries" activeValue={activeTab}>
                    <div className="space-y-3">
                        {entries.map((entry) => {
                            const pct = Math.round(
                                (entry.recognizedAmount / entry.totalAmount) * 100
                            );
                            return (
                                <Card key={entry.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    {entry.projectName}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-mono text-muted-foreground">
                                                        {entry.invoiceNumber}
                                                    </span>
                                                    <Badge
                                                        variant={STATUS_BADGE[entry.status]}
                                                        className="text-[10px]"
                                                    >
                                                        {entry.status.replace("_", " ")}
                                                    </Badge>
                                                    <Badge variant="ghost" className="text-[10px]">
                                                        {METHOD_LABELS[entry.recognitionMethod]}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(entry.totalAmount)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {entry.period}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <ArrowUpRight className="h-3 w-3 text-success" />
                                                    Recognized
                                                </p>
                                                <p className="text-sm font-semibold text-success">
                                                    {formatCurrency(entry.recognizedAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <ArrowDownRight className="h-3 w-3 text-warning" />
                                                    Deferred
                                                </p>
                                                <p className="text-sm font-semibold text-warning">
                                                    {formatCurrency(entry.deferredAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Recognition
                                                </p>
                                                <p className="text-sm font-semibold">{pct}%</p>
                                            </div>
                                        </div>
                                        <ProgressBar value={pct} size="sm" />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabPanel>

                <TabPanel value="summary" activeValue={activeTab}>
                    <div className="space-y-4">
                        {summaries.map((period) => {
                            const recognizedPct = Math.round(
                                (period.recognizedRevenue / period.totalRevenue) * 100
                            );
                            return (
                                <Card key={period.period}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-sm font-semibold">
                                                    {period.period}
                                                </h3>
                                            </div>
                                            <p className="text-sm font-bold">
                                                {formatCurrency(period.totalRevenue)}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                            <div className="p-3 rounded-lg bg-success/10">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Recognized
                                                </p>
                                                <p className="text-sm font-bold text-success">
                                                    {formatCurrency(period.recognizedRevenue)}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-warning/10">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Deferred
                                                </p>
                                                <p className="text-sm font-bold text-warning">
                                                    {formatCurrency(period.deferredRevenue)}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-info/10">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Unbilled
                                                </p>
                                                <p className="text-sm font-bold text-info">
                                                    {formatCurrency(period.unbilledRevenue)}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-secondary/30">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Recognition Rate
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {recognizedPct}%
                                                </p>
                                            </div>
                                        </div>
                                        <ProgressBar value={recognizedPct} size="sm" />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabPanel>

                <TabPanel value="schedules" activeValue={activeTab}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChart className="h-4 w-4" />
                                Recognition Schedule — Q1 2026
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summaries.map((s) => {
                                const pct =
                                    s.totalRevenue > 0
                                        ? Math.round((s.recognizedRevenue / s.totalRevenue) * 100)
                                        : 0;
                                return (
                                    <div key={s.period} className="p-4 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{s.period}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">
                                                    {formatCurrency(s.recognizedRevenue)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    / {formatCurrency(s.totalRevenue)}
                                                </span>
                                            </div>
                                        </div>
                                        <ProgressBar value={pct} size="sm" />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {pct}% of total recognized
                                        </p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabPanel>
            </div>
        </PermissionGate>
    );
}
