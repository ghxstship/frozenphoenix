"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { CheckCircle2, Clock, FileText, Loader2, UserPlus, Users } from "lucide-react";
import type { OnboardingStatus } from "@/types/vendor-lifecycle";
import { useVendorOnboarding } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { SegmentedControl } from "@/components/ui/segmented-control";

interface OnboardingVendor {
    id: string;
    name: string;
    type: string;
    contactName: string;
    email: string;
    status: OnboardingStatus;
    invitedAt: string;
    docsSubmitted: number;
    docsRequired: number;
    docsApproved: number;
    categories: string[];
    lastActivity: string;
}

const ONBOARDING_STAGES: { id: OnboardingStatus; label: string; color: string }[] = [
    { id: "invited", label: "Invited", color: "bg-muted" },
    { id: "application_submitted", label: "Application", color: "bg-info/10" },
    { id: "documents_pending", label: "Docs Pending", color: "bg-warning/10" },
    { id: "documents_received", label: "Docs Received", color: "bg-info/10" },
    { id: "under_review", label: "Under Review", color: "bg-primary/10" },
    { id: "background_check", label: "Background Check", color: "bg-warning/10" },
    { id: "approved", label: "Approved", color: "bg-success/10" },
];

const STATUS_BADGE: Record<
    string,
    { label: string; variant: "default" | "info" | "warning" | "success" | "destructive" }
> = {
    invited: { label: "Invited", variant: "default" },
    application_submitted: { label: "Application Received", variant: "info" },
    under_review: { label: "Under Review", variant: "info" },
    documents_pending: { label: "Docs Pending", variant: "warning" },
    documents_received: { label: "Docs Received", variant: "info" },
    background_check: { label: "Background Check", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Rejected", variant: "destructive" },
    archived: { label: "Archived", variant: "default" },
};

export default function VendorOnboardingPage() {
    const [search, setSearch] = useState("");
    const VIEW_MODES = ["pipeline", "list"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "pipeline",
        validValues: VIEW_MODES,
    });

    const { data: sbVendors, isLoading } = useVendorOnboarding();

    const vendors: OnboardingVendor[] = (sbVendors ?? []).map((v: Record<string, unknown>) => ({
        id: (v.id as string) ?? "",
        name: (v.name as string) ?? "",
        type: (v.type as string) ?? "",
        contactName: (v.contact_name as string) ?? "",
        email: (v.email as string) ?? "",
        status: ((v.status as string) ?? "invited") as OnboardingStatus,
        invitedAt: (v.invited_at as string) ?? "",
        docsSubmitted: (v.docs_submitted as number) ?? 0,
        docsRequired: (v.docs_required as number) ?? 0,
        docsApproved: (v.docs_approved as number) ?? 0,
        categories: (v.categories as string[]) ?? [],
        lastActivity: (v.last_activity as string) ?? "",
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = vendors.filter(
        (v) =>
            !search ||
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.contactName.toLowerCase().includes(search.toLowerCase())
    );

    const stageGroups = ONBOARDING_STAGES.map((stage) => ({
        ...stage,
        vendors: filtered.filter((v) => v.status === stage.id),
    }));

    const pending = vendors.filter((v) => !["approved", "rejected", "archived"].includes(v.status));
    const docsPending = vendors.filter((v) => v.docsSubmitted < v.docsRequired);

    return (
        <PermissionGate resource="vendor_onboarding" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Vendor Onboarding"
                    description="Pipeline view of vendor/subcontractor onboarding with compliance document tracking"
                >
                    <div className="flex items-center gap-2">
                        <SegmentedControl<"pipeline" | "list">
                            ariaLabel="Vendor onboarding view mode"
                            value={viewMode}
                            onValueChange={setViewMode}
                            size="sm"
                            options={[
                                { value: "pipeline", label: "Pipeline" },
                                { value: "list", label: "List" },
                            ]}
                        />
                        <Button size="sm">
                            <UserPlus className="h-4 w-4" /> Invite Vendor
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="In Pipeline" value={pending.length} icon={Users} />
                    <StatCard title="Docs Pending" value={docsPending.length} icon={FileText} />
                    <StatCard title="Approved This Month" value={2} icon={CheckCircle2} />
                    <StatCard title="Avg. Onboarding Time" value="8 days" icon={Clock} />
                </div>

                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search vendors..."
                    className="max-w-sm"
                />

                {viewMode === "pipeline" && (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {stageGroups.map((stage) => (
                            <div key={stage.id} className="min-w-[260px] flex-shrink-0">
                                <div className={`rounded-lg p-3 ${stage.color} mb-3`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold">{stage.label}</h3>
                                        <Badge variant="default" className="text-[10px]">
                                            {stage.vendors.length}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {stage.vendors.map((vendor) => (
                                        <Card
                                            key={vendor.id}
                                            className="hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="text-sm font-medium">
                                                        {vendor.name}
                                                    </h4>
                                                    <Badge variant="default" className="text-[9px]">
                                                        {vendor.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mb-2">
                                                    {vendor.contactName} · {vendor.email}
                                                </p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ProgressBar
                                                        value={
                                                            vendor.docsRequired > 0
                                                                ? (vendor.docsApproved /
                                                                      vendor.docsRequired) *
                                                                  100
                                                                : 0
                                                        }
                                                        size="xs"
                                                        className="flex-1"
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {vendor.docsApproved}/{vendor.docsRequired}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {vendor.categories.map((cat) => (
                                                        <Chip key={cat} size="sm">
                                                            {cat}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {stage.vendors.length === 0 && (
                                        <div className="text-center py-6 text-xs text-muted-foreground">
                                            No vendors
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === "list" && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left p-3 font-medium">Vendor</th>
                                            <th className="text-left p-3 font-medium">Type</th>
                                            <th className="text-left p-3 font-medium">Contact</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-left p-3 font-medium">Documents</th>
                                            <th className="text-left p-3 font-medium">Invited</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((v) => (
                                            <tr
                                                key={v.id}
                                                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                            >
                                                <td className="p-3 font-medium">{v.name}</td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant="default"
                                                        className="text-[10px]"
                                                    >
                                                        {v.type}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-muted-foreground text-xs">
                                                    {v.contactName}
                                                    <br />
                                                    {v.email}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={
                                                            STATUS_BADGE[v.status]?.variant ||
                                                            "default"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {STATUS_BADGE[v.status]?.label || v.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <ProgressBar
                                                            value={
                                                                v.docsRequired > 0
                                                                    ? (v.docsApproved /
                                                                          v.docsRequired) *
                                                                      100
                                                                    : 0
                                                            }
                                                            size="xs"
                                                            className="w-16"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {v.docsApproved}/{v.docsRequired}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {new Date(v.invitedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
