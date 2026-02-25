"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileBarChart, Users, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MockPostEventReport {
    id: string;
    eventName: string;
    status: string;
    compiledBy: string;
    compiledAt: string;
    totalAttendance: number;
    peakAttendance: number;
    vipCount: number;
    totalBudget: number;
    totalSpent: number;
    totalRevenue: number;
    finalMarginPercent: number;
    totalIncidents: number;
    totalAssetsDeployed: number;
    assetsDamaged: number;
    assetsMissing: number;
    totalDamageCost: number;
    loadInVarianceMinutes: number;
    showStartVarianceMinutes: number;
    strikeVarianceMinutes: number;
}

const mockReports: MockPostEventReport[] = [
    {
        id: "1", eventName: "Acme Corp Annual Summit 2026", status: "approved", compiledBy: "Pat Davis", compiledAt: "2026-02-25",
        totalAttendance: 4200, peakAttendance: 3800, vipCount: 45,
        totalBudget: 250000, totalSpent: 212000, totalRevenue: 285000, finalMarginPercent: 25.6,
        totalIncidents: 7, totalAssetsDeployed: 142, assetsDamaged: 3, assetsMissing: 1, totalDamageCost: 4800,
        loadInVarianceMinutes: -15, showStartVarianceMinutes: 2, strikeVarianceMinutes: 25,
    },
    {
        id: "2", eventName: "TechStart Product Launch", status: "in_review", compiledBy: "Jordan Lee", compiledAt: "2026-02-24",
        totalAttendance: 1200, peakAttendance: 1100, vipCount: 28,
        totalBudget: 85000, totalSpent: 78500, totalRevenue: 95000, finalMarginPercent: 17.4,
        totalIncidents: 2, totalAssetsDeployed: 56, assetsDamaged: 0, assetsMissing: 0, totalDamageCost: 0,
        loadInVarianceMinutes: 10, showStartVarianceMinutes: 0, strikeVarianceMinutes: -10,
    },
    {
        id: "3", eventName: "BrandCo Festival Day 1", status: "draft", compiledBy: "Alex Torres", compiledAt: "2026-02-23",
        totalAttendance: 8500, peakAttendance: 7200, vipCount: 120,
        totalBudget: 500000, totalSpent: 465000, totalRevenue: 620000, finalMarginPercent: 25.0,
        totalIncidents: 15, totalAssetsDeployed: 320, assetsDamaged: 8, assetsMissing: 3, totalDamageCost: 12400,
        loadInVarianceMinutes: 45, showStartVarianceMinutes: 5, strikeVarianceMinutes: 60,
    },
];

function formatVariance(mins: number): string {
    const abs = Math.abs(mins);
    const sign = mins > 0 ? "+" : mins < 0 ? "-" : "";
    return `${sign}${abs}m`;
}

export default function PostEventReportsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Post-Event Reports" description="Compiled event summaries with attendance, financials, incidents, and lessons learned" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={mockReports.length} icon={FileBarChart} />
                <StatCard title="Approved" value={mockReports.filter(r => r.status === "approved").length} icon={FileBarChart} />
                <StatCard title="In Review" value={mockReports.filter(r => r.status === "in_review").length} icon={FileBarChart} />
                <StatCard title="Draft" value={mockReports.filter(r => r.status === "draft").length} icon={FileBarChart} />
            </div>

            <div className="space-y-4">
                {mockReports.map((report, i) => (
                    <Card key={report.id} className="hover:shadow-sm transition-all animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold">{report.eventName}</h3>
                                        <StatusBadge status={report.status} className="text-[10px]" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">By {report.compiledBy} — {report.compiledAt}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Attendance</p>
                                    <p className="font-semibold">{report.totalAttendance.toLocaleString()}</p>
                                    <p className="text-[10px] text-muted-foreground">Peak: {report.peakAttendance.toLocaleString()} | VIP: {report.vipCount}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Financial</p>
                                    <p className="font-semibold">{formatCurrency(report.totalRevenue)}</p>
                                    <p className="text-[10px] text-muted-foreground">Spent: {formatCurrency(report.totalSpent)} | Margin: {report.finalMarginPercent}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Incidents</p>
                                    <p className="font-semibold">{report.totalIncidents}</p>
                                    <p className="text-[10px] text-muted-foreground">Damaged: {report.assetsDamaged} | Missing: {report.assetsMissing}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Timeline Variance</p>
                                    <div className="flex gap-2 text-[11px] mt-0.5">
                                        <span className={report.loadInVarianceMinutes > 15 ? "text-warning" : ""}>Load-in: {formatVariance(report.loadInVarianceMinutes)}</span>
                                        <span className={report.showStartVarianceMinutes > 5 ? "text-warning" : ""}>Show: {formatVariance(report.showStartVarianceMinutes)}</span>
                                        <span className={report.strikeVarianceMinutes > 30 ? "text-warning" : ""}>Strike: {formatVariance(report.strikeVarianceMinutes)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
