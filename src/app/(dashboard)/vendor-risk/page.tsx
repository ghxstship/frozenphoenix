"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle, CheckCircle2, ShieldAlert, Loader2,
} from "lucide-react";
import { MOCK_VENDOR_RISK_SCORES } from "@/lib/demo-data-governance";
import { useRiskAssessments, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { VendorRiskLevel } from "@/types/governance";
import { RISK_LEVEL_MAP } from "@/config/domain-config";

const vendorNames: Record<string, string> = {
    v1: "SteelCraft Fabrication", v2: "EventTech Rentals", v3: "Lumina AV Solutions",
    v4: "ProStage Lighting", v5: "SoundWave Audio",
};

const RISK_VARIANTS: Record<VendorRiskLevel, "success" | "warning" | "destructive"> = {
    low: "success", medium: "warning", high: "destructive", critical: "destructive",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{score}</span>
            </div>
            <ProgressBar value={score} size="sm" />
        </div>
    );
}

export default function VendorRiskPage() {
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState<string>("all");
    const { data: sbScores, isLoading } = useRiskAssessments();

    const scores = isSupabaseConfigured && sbScores ? (sbScores as unknown as typeof MOCK_VENDOR_RISK_SCORES) : MOCK_VENDOR_RISK_SCORES;

    const filtered = scores.filter(s => {
        const vendorName = vendorNames[s.vendor_id] || s.vendor_id;
        const matchesSearch = !search || vendorName.toLowerCase().includes(search.toLowerCase());
        const matchesRisk = riskFilter === "all" || s.risk_level === riskFilter;
        return matchesSearch && matchesRisk;
    });

    const lowRisk = scores.filter(s => s.risk_level === "low").length;
    const medRisk = scores.filter(s => s.risk_level === "medium").length;
    const highCritical = scores.filter(s => s.risk_level === "high" || s.risk_level === "critical").length;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="vendor_risk" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Vendor Risk Scoring" description="Composite risk scoring across financial, compliance, performance, and operational dimensions" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Low Risk" value={lowRisk} icon={CheckCircle2} />
                <StatCard title="Medium Risk" value={medRisk} icon={AlertTriangle} />
                <StatCard title="High / Critical" value={highCritical} icon={ShieldAlert} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search vendors..." className="flex-1 max-w-sm" />
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
                                    <Badge variant={RISK_VARIANTS[s.risk_level]} className="text-[9px]">{RISK_LEVEL_MAP[s.risk_level as keyof typeof RISK_LEVEL_MAP]?.label ?? s.risk_level}</Badge>
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
        </PermissionGate>
    );
}
