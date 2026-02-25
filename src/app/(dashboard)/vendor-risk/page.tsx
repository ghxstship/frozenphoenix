"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, AlertTriangle, CheckCircle2, ShieldAlert,
} from "lucide-react";
import { MOCK_VENDOR_RISK_SCORES } from "@/lib/mock-data-governance";
import { formatCurrency } from "@/lib/utils";
import type { VendorRiskLevel } from "@/types/governance";

const vendorNames: Record<string, string> = {
    v1: "SteelCraft Fabrication", v2: "EventTech Rentals", v3: "Lumina AV Solutions",
    v4: "ProStage Lighting", v5: "SoundWave Audio",
};

const RISK_VARIANTS: Record<VendorRiskLevel, "success" | "warning" | "destructive"> = {
    low: "success", medium: "warning", high: "destructive", critical: "destructive",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
    const color = score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{score}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
                <div className={`${color} rounded-full h-1.5 transition-all`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

export default function VendorRiskPage() {
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState<string>("all");

    const scores = MOCK_VENDOR_RISK_SCORES;

    const filtered = scores.filter(s => {
        const vendorName = vendorNames[s.vendor_id] || s.vendor_id;
        const matchesSearch = !search || vendorName.toLowerCase().includes(search.toLowerCase());
        const matchesRisk = riskFilter === "all" || s.risk_level === riskFilter;
        return matchesSearch && matchesRisk;
    });

    const lowRisk = scores.filter(s => s.risk_level === "low").length;
    const medRisk = scores.filter(s => s.risk_level === "medium").length;
    const highCritical = scores.filter(s => s.risk_level === "high" || s.risk_level === "critical").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Vendor Risk Scoring" description="Composite risk scoring across financial, compliance, performance, and operational dimensions" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Low Risk" value={lowRisk} icon={CheckCircle2} />
                <StatCard title="Medium Risk" value={medRisk} icon={AlertTriangle} />
                <StatCard title="High / Critical" value={highCritical} icon={ShieldAlert} />
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(s => (
                    <Card key={s.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-sm">{vendorNames[s.vendor_id] || s.vendor_id}</CardTitle>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Scored: {new Date(s.score_date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{s.overall_score}</div>
                                    <Badge variant={RISK_VARIANTS[s.risk_level]} className="text-[9px]">{s.risk_level.toUpperCase()}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 mb-3">
                                <ScoreBar label="Financial" score={s.financial_score} />
                                <ScoreBar label="Compliance" score={s.compliance_score} />
                                <ScoreBar label="Performance" score={s.performance_score} />
                                <ScoreBar label="Operational" score={s.operational_score} />
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border pt-2">
                                <span>Spend: {formatCurrency(s.total_spend)}</span>
                                <span>POs: {s.active_po_count}</span>
                                {s.overdue_invoice_count > 0 && <span className="text-destructive">Overdue: {s.overdue_invoice_count}</span>}
                                {s.incident_count > 0 && <span className="text-destructive">Incidents: {s.incident_count}</span>}
                            </div>
                            {(s.risk_factors as { factor: string }[]).length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {(s.risk_factors as { factor: string; severity: string }[]).map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 text-[10px]">
                                            <StatusBadge status={f.severity} className="text-[8px]" />
                                            <span>{f.factor}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
