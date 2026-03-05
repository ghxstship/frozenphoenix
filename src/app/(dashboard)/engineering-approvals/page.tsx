"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Plus, Wrench } from "lucide-react";
import type { EngineeringApproval, EngineeringApprovalStatus } from "@/types/governance";
import { useEngineeringApprovals } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const APPROVAL_STATUSES: EngineeringApprovalStatus[] = [
    "pending",
    "submitted",
    "under_review",
    "conditions_issued",
    "approved",
    "rejected",
    "expired",
    "inspection_required",
    "inspection_passed",
    "inspection_failed",
];

const APPROVAL_TYPE_LABELS: Record<string, string> = {
    structural: "Structural",
    electrical: "Electrical",
    mechanical: "Mechanical",
    fire_safety: "Fire Safety",
    rigging: "Rigging",
};

export default function EngineeringApprovalsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbApprovals, isLoading } = useEngineeringApprovals();

    const approvals: EngineeringApproval[] = (sbApprovals ?? []).map(
        (a: Record<string, unknown>) =>
            ({
                id: (a.id as string) ?? "",
                entity_type: (a.entity_type as string) ?? "",
                entity_id: (a.entity_id as string) ?? "",
                approval_type: (a.approval_type as string) ?? "structural",
                engineer_name: (a.engineer_name as string) ?? "",
                engineering_firm: (a.engineering_firm as string) ?? undefined,
                engineer_license_number: (a.engineer_license_number as string) ?? undefined,
                status: ((a.status as string) ?? "pending") as EngineeringApprovalStatus,
                valid_until: (a.valid_until as string) ?? undefined,
                conditions: (a.conditions as string) ?? undefined,
            }) as EngineeringApproval
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = approvals.filter((a) => {
        const matchesSearch =
            !search ||
            a.engineer_name.toLowerCase().includes(search.toLowerCase()) ||
            a.approval_type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const approved = approvals.filter(
        (a) => a.status === "approved" || a.status === "inspection_passed"
    ).length;
    const pending = approvals.filter((a) =>
        ["pending", "submitted", "under_review", "conditions_issued"].includes(a.status)
    ).length;
    const issues = approvals.filter((a) =>
        ["rejected", "expired", "inspection_failed"].includes(a.status)
    ).length;

    return (
        <PermissionGate resource="engineering_approvals" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Engineering Approvals"
                    description="Track structural, electrical, mechanical, fire safety, and rigging approvals from licensed engineers"
                >
                    <Button size="sm">
                        <Plus className="h-4 w-4" /> Request Approval
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Approved" value={approved} icon={CheckCircle2} />
                    <StatCard title="Pending" value={pending} icon={Clock} />
                    <StatCard title="Issues" value={issues} icon={AlertTriangle} />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search approvals..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {APPROVAL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Wrench className="h-4 w-4" /> Engineering Approvals ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-3 font-medium">Type</th>
                                        <th className="text-left p-3 font-medium">Engineer</th>
                                        <th className="text-left p-3 font-medium">Entity</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Valid Until</th>
                                        <th className="text-left p-3 font-medium">Conditions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-3 font-medium">
                                                {APPROVAL_TYPE_LABELS[a.approval_type] ||
                                                    a.approval_type}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs font-medium">
                                                    {a.engineer_name}
                                                </div>
                                                {a.engineering_firm && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {a.engineering_firm}
                                                    </div>
                                                )}
                                                {a.engineer_license_number && (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        License: {a.engineer_license_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {a.entity_type} · {a.entity_id}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge
                                                    status={a.status}
                                                    className="text-[10px]"
                                                />
                                            </td>
                                            <td className="p-3 text-xs">
                                                {a.valid_until
                                                    ? new Date(a.valid_until).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td className="p-3 text-xs max-w-[200px] truncate">
                                                {a.conditions || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
