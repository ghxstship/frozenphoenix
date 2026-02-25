"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import {
    UserPlus, CheckCircle2, Clock,
    FileText, Users,
} from "lucide-react";
import type { OnboardingStatus } from "@/types/vendor-lifecycle";

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

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "info" | "warning" | "success" | "destructive" }> = {
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

const mockOnboardingVendors: OnboardingVendor[] = [
    { id: "v10", name: "Apex Rigging Co", type: "subcontractor", contactName: "Tom Rigger", email: "tom@apexrigging.com", status: "invited", invitedAt: "2026-02-24T10:00:00Z", docsSubmitted: 0, docsRequired: 5, docsApproved: 0, categories: ["rigging", "technical"], lastActivity: "2026-02-24T10:00:00Z" },
    { id: "v11", name: "Scenic Arts Studio", type: "vendor", contactName: "Maria Scenic", email: "maria@scenicarts.com", status: "application_submitted", invitedAt: "2026-02-20T10:00:00Z", docsSubmitted: 2, docsRequired: 4, docsApproved: 0, categories: ["scenic", "fabrication"], lastActivity: "2026-02-22T14:00:00Z" },
    { id: "v12", name: "ColorWorks Graphics", type: "vendor", contactName: "James Color", email: "james@colorworks.com", status: "documents_pending", invitedAt: "2026-02-15T10:00:00Z", docsSubmitted: 3, docsRequired: 4, docsApproved: 2, categories: ["print", "graphics"], lastActivity: "2026-02-21T09:00:00Z" },
    { id: "v13", name: "PowerLine Electrical", type: "subcontractor", contactName: "Sarah Watts", email: "sarah@powerline.com", status: "documents_received", invitedAt: "2026-02-10T10:00:00Z", docsSubmitted: 5, docsRequired: 5, docsApproved: 3, categories: ["electrical", "technical"], lastActivity: "2026-02-23T11:00:00Z" },
    { id: "v14", name: "Momentum Staffing", type: "agency", contactName: "Chris Staff", email: "chris@momentum.com", status: "under_review", invitedAt: "2026-02-05T10:00:00Z", docsSubmitted: 4, docsRequired: 4, docsApproved: 4, categories: ["staffing"], lastActivity: "2026-02-24T08:00:00Z" },
    { id: "v15", name: "SecureGuard Services", type: "vendor", contactName: "Pat Guard", email: "pat@secureguard.com", status: "background_check", invitedAt: "2026-01-28T10:00:00Z", docsSubmitted: 5, docsRequired: 5, docsApproved: 5, categories: ["security"], lastActivity: "2026-02-22T16:00:00Z" },
    { id: "v16", name: "BlueSky AV Rentals", type: "vendor", contactName: "Lisa Sky", email: "lisa@blueskyav.com", status: "approved", invitedAt: "2026-01-15T10:00:00Z", docsSubmitted: 4, docsRequired: 4, docsApproved: 4, categories: ["av", "technical"], lastActivity: "2026-02-01T10:00:00Z" },
    { id: "v17", name: "FastTrack Couriers", type: "supplier", contactName: "Dave Fast", email: "dave@fasttrack.com", status: "approved", invitedAt: "2026-01-10T10:00:00Z", docsSubmitted: 3, docsRequired: 3, docsApproved: 3, categories: ["logistics"], lastActivity: "2026-01-25T10:00:00Z" },
];

export default function VendorOnboardingPage() {
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");

    const filtered = mockOnboardingVendors.filter(v =>
        !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.contactName.toLowerCase().includes(search.toLowerCase())
    );

    const stageGroups = ONBOARDING_STAGES.map(stage => ({
        ...stage,
        vendors: filtered.filter(v => v.status === stage.id),
    }));

    const pending = mockOnboardingVendors.filter(v => !["approved", "rejected", "archived"].includes(v.status));
    const docsPending = mockOnboardingVendors.filter(v => v.docsSubmitted < v.docsRequired);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Vendor Onboarding" description="Pipeline view of vendor/subcontractor onboarding with compliance document tracking">
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border bg-card p-0.5" role="tablist">
                        <button role="tab" aria-selected={viewMode === "pipeline"} onClick={() => setViewMode("pipeline")} className={`px-2 py-1 rounded-md text-xs transition-colors ${viewMode === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Pipeline</button>
                        <button role="tab" aria-selected={viewMode === "list"} onClick={() => setViewMode("list")} className={`px-2 py-1 rounded-md text-xs transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>List</button>
                    </div>
                    <Button size="sm"><UserPlus className="h-4 w-4" /> Invite Vendor</Button>
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
                    {stageGroups.map(stage => (
                        <div key={stage.id} className="min-w-[260px] flex-shrink-0">
                            <div className={`rounded-lg p-3 ${stage.color} mb-3`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold">{stage.label}</h3>
                                    <Badge variant="default" className="text-[10px]">{stage.vendors.length}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {stage.vendors.map(vendor => (
                                    <Card key={vendor.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-medium">{vendor.name}</h4>
                                                <Badge variant="default" className="text-[9px]">{vendor.type}</Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mb-2">{vendor.contactName} · {vendor.email}</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <ProgressBar value={vendor.docsRequired > 0 ? (vendor.docsApproved / vendor.docsRequired) * 100 : 0} size="xs" className="flex-1" />
                                                <span className="text-[10px] text-muted-foreground">{vendor.docsApproved}/{vendor.docsRequired}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {vendor.categories.map(cat => (
                                                    <Chip key={cat} size="sm">{cat}</Chip>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {stage.vendors.length === 0 && (
                                    <div className="text-center py-6 text-xs text-muted-foreground">No vendors</div>
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
                                    {filtered.map(v => (
                                        <tr key={v.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                            <td className="p-3 font-medium">{v.name}</td>
                                            <td className="p-3"><Badge variant="default" className="text-[10px]">{v.type}</Badge></td>
                                            <td className="p-3 text-muted-foreground text-xs">{v.contactName}<br />{v.email}</td>
                                            <td className="p-3"><Badge variant={STATUS_BADGE[v.status]?.variant || "default"} className="text-[10px]">{STATUS_BADGE[v.status]?.label || v.status}</Badge></td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <ProgressBar value={v.docsRequired > 0 ? (v.docsApproved / v.docsRequired) * 100 : 0} size="xs" className="w-16" />
                                                    <span className="text-xs text-muted-foreground">{v.docsApproved}/{v.docsRequired}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">{new Date(v.invitedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
