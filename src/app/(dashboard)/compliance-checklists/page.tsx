"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { MOCK_COMPLIANCE_CHECKLISTS } from "@/lib/demo-data-governance";
import type { ComplianceChecklistStatus } from "@/types/governance";

const CHECKLIST_STATUSES: ComplianceChecklistStatus[] = [
    "not_started", "in_progress", "completed", "failed", "requires_remediation", "waived",
];

const CHECKLIST_TYPE_LABELS: Record<string, string> = {
    ada: "ADA", osha: "OSHA", fire_safety: "Fire Safety", health_safety: "Health & Safety",
    noise: "Noise", environmental: "Environmental", electrical_safety: "Electrical Safety",
    crowd_management: "Crowd Management", food_safety: "Food Safety",
    alcohol_service: "Alcohol Service", general: "General",
};

export default function ComplianceChecklistsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const checklists = MOCK_COMPLIANCE_CHECKLISTS;

    const filtered = checklists.filter(c => {
        const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const completed = checklists.filter(c => c.status === "completed").length;
    const inProgress = checklists.filter(c => c.status === "in_progress").length;
    const notStarted = checklists.filter(c => c.status === "not_started" || c.status === "failed").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Compliance Checklists" description="ADA, OSHA, fire safety, and other compliance inspections across locations, activations, and events">
                <Button size="sm"><Plus className="h-4 w-4" /> New Checklist</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Completed" value={completed} icon={CheckCircle2} />
                <StatCard title="In Progress" value={inProgress} icon={Clock} />
                <StatCard title="Not Started / Failed" value={notStarted} icon={AlertTriangle} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search checklists..." className="flex-1 max-w-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {CHECKLIST_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(c => (
                    <Card key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-sm">{c.title}</CardTitle>
                                <StatusBadge status={c.status} className="text-[10px]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="text-[9px]">{CHECKLIST_TYPE_LABELS[c.checklist_type] || c.checklist_type}</Badge>
                                <span className="text-[10px] text-muted-foreground">{c.entity_type}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">{c.completed_items} / {c.total_items} items</span>
                                    <span className="font-medium">{c.completion_percent}%</span>
                                </div>
                                <ProgressBar value={c.completion_percent} size="md" />
                            </div>
                            {c.inspected_at && (
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    Inspected: {new Date(c.inspected_at).toLocaleDateString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
