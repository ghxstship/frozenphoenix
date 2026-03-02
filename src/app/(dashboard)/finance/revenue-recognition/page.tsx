"use client";

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

const MOCK_ENTRIES: RevenueEntry[] = [
    {
        id: "re1",
        projectName: "Nike Air Max Launch",
        invoiceNumber: "INV-2026-0001",
        totalAmount: 125000,
        recognizedAmount: 81250,
        deferredAmount: 43750,
        recognitionMethod: "percentage_of_completion",
        period: "2026-03",
        status: "partial",
    },
    {
        id: "re2",
        projectName: "Red Bull Festival Activation",
        invoiceNumber: "INV-2026-0003",
        totalAmount: 195000,
        recognizedAmount: 195000,
        deferredAmount: 0,
        recognitionMethod: "completed_contract",
        period: "2026-02",
        status: "recognized",
    },
    {
        id: "re3",
        projectName: "Adidas Originals Pop-Up",
        invoiceNumber: "INV-2026-0005",
        totalAmount: 62500,
        recognizedAmount: 0,
        deferredAmount: 62500,
        recognitionMethod: "milestone",
        period: "2026-03",
        status: "deferred",
    },
    {
        id: "re4",
        projectName: "Samsung Galaxy Pop-Up",
        invoiceNumber: "INV-2026-0008",
        totalAmount: 88000,
        recognizedAmount: 44000,
        deferredAmount: 44000,
        recognitionMethod: "time_and_materials",
        period: "2026-03",
        status: "partial",
    },
    {
        id: "re5",
        projectName: "Coachella Main Stage 2026",
        invoiceNumber: "INV-2026-0012",
        totalAmount: 450000,
        recognizedAmount: 0,
        deferredAmount: 450000,
        recognitionMethod: "milestone",
        period: "2026-04",
        status: "pending_review",
    },
];

const MOCK_SUMMARY: RevenueSummary[] = [
    {
        period: "2026-01",
        totalRevenue: 380000,
        recognizedRevenue: 310000,
        deferredRevenue: 70000,
        unbilledRevenue: 45000,
    },
    {
        period: "2026-02",
        totalRevenue: 520000,
        recognizedRevenue: 435000,
        deferredRevenue: 85000,
        unbilledRevenue: 62000,
    },
    {
        period: "2026-03",
        totalRevenue: 720500,
        recognizedRevenue: 320250,
        deferredRevenue: 400250,
        unbilledRevenue: 95000,
    },
];

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

    const totalRecognized = MOCK_ENTRIES.reduce((s, e) => s + e.recognizedAmount, 0);
    const totalDeferred = MOCK_ENTRIES.reduce((s, e) => s + e.deferredAmount, 0);
    const totalRevenue = MOCK_ENTRIES.reduce((s, e) => s + e.totalAmount, 0);
    const pendingReview = MOCK_ENTRIES.filter((e) => e.status === "pending_review").length;

    const tabs = [
        {
            id: "entries" as const,
            label: "Entries",
            count: MOCK_ENTRIES.length,
            icon: <FileText className="h-4 w-4" />,
        },
        {
            id: "summary" as const,
            label: "Period Summary",
            count: MOCK_SUMMARY.length,
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
                        {MOCK_ENTRIES.map((entry) => {
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
                                        <div className="grid grid-cols-3 gap-4 mb-3">
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
                        {MOCK_SUMMARY.map((period) => {
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
                            {["January 2026", "February 2026", "March 2026"].map((month, i) => {
                                const amounts = [310000, 435000, 320250];
                                const targets = [350000, 450000, 500000];
                                const pct = Math.round((amounts[i]! / targets[i]!) * 100);
                                return (
                                    <div key={month} className="p-4 rounded-lg bg-secondary/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{month}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">
                                                    {formatCurrency(amounts[i]!)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    / {formatCurrency(targets[i]!)}
                                                </span>
                                            </div>
                                        </div>
                                        <ProgressBar value={pct} size="sm" />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {pct}% of target recognized
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
