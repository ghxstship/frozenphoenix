"use client";

import { useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_PERMIT_CONFIG } from "@/config/create-entity-configs";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileBadge,
    Loader2,
    MapPin,
    Plus,
    XCircle,
} from "lucide-react";
import type { Permit } from "@/types/governance";
import { usePermits } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { PermitStatus } from "@/types/governance";

const PERMIT_STATUSES: PermitStatus[] = [
    "required",
    "application_draft",
    "submitted",
    "under_review",
    "conditions_issued",
    "approved",
    "active",
    "expired",
    "revoked",
    "renewed",
];

const PERMIT_TYPE_LABELS: Record<string, string> = {
    fire: "Fire",
    building: "Building",
    electrical: "Electrical",
    noise: "Noise",
    health: "Health",
    liquor: "Liquor",
    signage: "Signage",
    street_closure: "Street Closure",
    temporary_event: "Temporary Event",
    crowd_gathering: "Crowd Gathering",
    pyrotechnics: "Pyrotechnics",
    drone: "Drone",
    broadcast: "Broadcast",
    business_license: "Business License",
    ada_variance: "ADA Variance",
    structural_approval: "Structural",
    plumbing: "Plumbing",
    amusement: "Amusement",
    food_service: "Food Service",
    other: "Other",
};

export default function PermitsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbPermits, isLoading } = usePermits();

    const permits = (sbPermits ?? []) as Permit[];

    const filtered = permits.filter((p) => {
        const matchesSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.jurisdiction.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const approved = permits.filter((p) => p.status === "approved" || p.status === "active").length;
    const pending = permits.filter((p) =>
        ["submitted", "under_review", "conditions_issued"].includes(p.status)
    ).length;
    const required = permits.filter(
        (p) => p.status === "required" || p.status === "application_draft"
    ).length;
    const expired = permits.filter((p) => p.status === "expired" || p.status === "revoked").length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="permits" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Permits & Licenses"
                    description="Track permits, licenses, and regulatory approvals across all jurisdictions and entities"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> New Permit
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Approved / Active" value={approved} icon={CheckCircle2} />
                    <StatCard title="Pending Review" value={pending} icon={Clock} />
                    <StatCard title="Action Required" value={required} icon={AlertTriangle} />
                    <StatCard title="Expired / Revoked" value={expired} icon={XCircle} />
                </div>

                {required > 0 && (
                    <Card className="border-warning/30 bg-warning/5">
                        <CardContent className="py-3 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-warning">
                                    {required} permit(s) still need applications filed
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    These permits are required but have not yet been submitted.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search permits..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {PERMIT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileBadge className="h-4 w-4" /> Permits ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-3 font-medium">Permit</th>
                                        <th className="text-left p-3 font-medium">Type</th>
                                        <th className="text-left p-3 font-medium">Jurisdiction</th>
                                        <th className="text-left p-3 font-medium">Entity</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Expiry</th>
                                        <th className="text-left p-3 font-medium">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-3">
                                                <div className="font-medium">{p.title}</div>
                                                {p.permit_number && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {p.permit_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {PERMIT_TYPE_LABELS[p.permit_type] || p.permit_type}
                                            </td>
                                            <td className="p-3 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {p.jurisdiction}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {p.jurisdiction_level}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {p.entity_type}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge
                                                    status={p.status}
                                                    className="text-[10px]"
                                                />
                                            </td>
                                            <td className="p-3 text-xs">
                                                {p.expiry_date
                                                    ? new Date(p.expiry_date).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {p.total_cost
                                                    ? `$${p.total_cost.toLocaleString()}`
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CreateEntityDialog
                config={CREATE_PERMIT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
