"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_SERVICE_REQUEST_CONFIG } from "@/config/create-entity-configs";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    AlertTriangle,
    ArrowRightCircle,
    Calendar,
    ClipboardList,
    Clock,
    FileSignature,
    FolderKanban,
    Inbox,
    Loader2,
    Mail,
    MapPin,
    Megaphone,
    Phone,
    Plus,
    User,
} from "lucide-react";
import type {
    ServiceRequest,
    ServiceRequestPriority,
    ServiceRequestStatus,
} from "@/types/vendor-lifecycle";
import { useServiceRequests } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const SERVICE_REQUEST_STATUSES: ServiceRequestStatus[] = [
    "new",
    "acknowledged",
    "assessment_scheduled",
    "quoted",
    "approved",
    "converted",
    "declined",
    "cancelled",
    "archived",
];

const PRIORITY_CONFIG: Record<ServiceRequestPriority, { label: string; color: string }> = {
    low: { label: "Low", color: "text-muted-foreground" },
    normal: { label: "Normal", color: "text-foreground" },
    high: { label: "High", color: "text-warning" },
    urgent: { label: "Urgent", color: "text-destructive" },
    emergency: { label: "Emergency", color: "text-destructive font-bold" },
};

const SOURCE_LABELS: Record<string, { label: string; icon: typeof Inbox }> = {
    client_portal: { label: "Client Portal", icon: User },
    online_booking: { label: "Online Booking", icon: Calendar },
    phone: { label: "Phone", icon: Phone },
    email: { label: "Email", icon: Mail },
    walk_in: { label: "Walk-in", icon: MapPin },
    referral: { label: "Referral", icon: Megaphone },
    social_media: { label: "Social Media", icon: Megaphone },
    website_form: { label: "Website Form", icon: Inbox },
    vendor_portal: { label: "Vendor Portal", icon: User },
    internal: { label: "Internal", icon: ClipboardList },
};

const CONVERT_ICONS: Record<string, typeof FileSignature> = {
    estimate: FileSignature,
    work_order: ClipboardList,
    project: FolderKanban,
    deal: Megaphone,
};

export default function ServiceRequestsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbRequests, isLoading } = useServiceRequests();

    const requests: ServiceRequest[] = (sbRequests ?? []).map(
        (r: Record<string, unknown>) =>
            ({
                id: (r.id as string) ?? "",
                title: (r.title as string) ?? "",
                description: (r.description as string) ?? "",
                status: ((r.status as string) ?? "new") as ServiceRequestStatus,
                priority: ((r.priority as string) ?? "normal") as ServiceRequestPriority,
                source: (r.source as string) ?? "email",
                category: (r.category as string) ?? "",
                serviceType: (r.service_type as string) ?? "",
                companyName: (r.company_name as string) ?? "",
                contactName: (r.contact_name as string) ?? "",
                requesterName: (r.requester_name as string) ?? "",
                requesterEmail: (r.requester_email as string) ?? "",
                preferredDate: (r.preferred_date as string) ?? "",
                isFlexible: (r.is_flexible as boolean) ?? false,
                requiresAssessment: (r.requires_assessment as boolean) ?? false,
                assignedToName: (r.assigned_to_name as string) ?? "",
                convertedToType: (r.converted_to_type as string) ?? undefined,
                attachmentUrls: (r.attachment_urls as string[]) ?? [],
                createdAt: (r.created_at as string) ?? "",
            }) as ServiceRequest
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    const filtered = requests.filter((r) => {
        const matchesSearch =
            !search ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            (r.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.contactName || r.requesterName || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const newRequests = requests.filter((r) => r.status === "new").length;
    const inProgress = requests.filter((r) =>
        ["acknowledged", "assessment_scheduled", "quoted"].includes(r.status)
    ).length;
    const converted = requests.filter((r) => r.status === "converted").length;
    const urgentCount = requests.filter(
        (r) =>
            ["urgent", "emergency"].includes(r.priority) &&
            !["converted", "declined", "cancelled", "archived"].includes(r.status)
    ).length;

    return (
        <PermissionGate resource="service_requests" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Service Requests"
                    description="Triage incoming work requests from clients, online booking, and other channels into estimates, work orders, or projects"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> New Request
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="New Requests" value={newRequests} icon={Inbox} />
                    <StatCard title="In Progress" value={inProgress} icon={Clock} />
                    <StatCard title="Converted" value={converted} icon={ArrowRightCircle} />
                    <StatCard title="Urgent" value={urgentCount} icon={AlertTriangle} />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search requests..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {SERVICE_REQUEST_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    {filtered.map((req, i) => {
                        const SourceIcon = SOURCE_LABELS[req.source]?.icon || Inbox;
                        const ConvertIcon = req.convertedToType
                            ? CONVERT_ICONS[req.convertedToType] || ArrowRightCircle
                            : null;

                        return (
                            <StaggerItem key={req.id} index={i} stagger="normal">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <StatusBadge
                                                        status={req.status}
                                                        className="text-[10px]"
                                                    />
                                                    <span
                                                        className={`text-[10px] font-medium ${PRIORITY_CONFIG[req.priority].color}`}
                                                    >
                                                        {PRIORITY_CONFIG[req.priority].label}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <SourceIcon className="h-3 w-3" />
                                                        {SOURCE_LABELS[req.source]?.label ||
                                                            req.source}
                                                    </span>
                                                </div>

                                                <h3 className="text-sm font-bold mb-1">
                                                    {req.title}
                                                </h3>

                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                                    {(req.companyName ||
                                                        req.contactName ||
                                                        req.requesterName) && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {req.companyName && (
                                                                <span className="font-medium">
                                                                    {req.companyName}
                                                                </span>
                                                            )}
                                                            {req.contactName && (
                                                                <span>{req.contactName}</span>
                                                            )}
                                                            {!req.contactName &&
                                                                req.requesterName && (
                                                                    <span>{req.requesterName}</span>
                                                                )}
                                                        </span>
                                                    )}
                                                    {req.requesterEmail && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {req.requesterEmail}
                                                        </span>
                                                    )}
                                                    {req.preferredDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Preferred: {req.preferredDate}
                                                            {req.isFlexible && " (flexible)"}
                                                        </span>
                                                    )}
                                                </div>

                                                {req.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                        {req.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3 text-[10px]">
                                                    {req.category && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {req.category}
                                                        </span>
                                                    )}
                                                    {req.serviceType && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {req.serviceType}
                                                        </span>
                                                    )}
                                                    {req.requiresAssessment && (
                                                        <span className="text-warning">
                                                            Requires assessment
                                                        </span>
                                                    )}
                                                    {req.assignedToName && (
                                                        <span className="text-muted-foreground">
                                                            Assigned: {req.assignedToName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex flex-col items-end gap-2">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </span>

                                                {req.convertedToType && ConvertIcon && (
                                                    <Badge
                                                        variant="success"
                                                        className="text-[10px]"
                                                    >
                                                        <ConvertIcon className="h-3 w-3 mr-1" />→{" "}
                                                        {req.convertedToType.replace("_", " ")}
                                                    </Badge>
                                                )}

                                                {req.status === "new" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Triage
                                                    </Button>
                                                )}
                                                {req.status === "acknowledged" && (
                                                    <Button size="sm" className="text-xs">
                                                        Create Quote
                                                    </Button>
                                                )}
                                                {req.status === "assessment_scheduled" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        View Assessment
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No service requests found
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <CreateEntityDialog
                config={CREATE_SERVICE_REQUEST_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
