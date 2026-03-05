"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    AlertTriangle,
    Briefcase,
    ChevronRight,
    Clock,
    Loader2,
    MapPin,
    Plus,
    Star,
    UserCheck,
    Users,
    UserX,
} from "lucide-react";
import { MOCK_WORKER_PROFILES } from "@/lib/demo-data-workforce";
import { useWorkerProfiles } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { WorkerClassification, WorkerLifecycleStatus } from "@/types/workforce";

const LIFECYCLE_CONFIG: Record<
    WorkerLifecycleStatus,
    { label: string; variant: "default" | "info" | "warning" | "success" | "destructive" }
> = {
    prospect: { label: "Prospect", variant: "default" },
    onboarding: { label: "Onboarding", variant: "info" },
    active: { label: "Active", variant: "success" },
    on_leave: { label: "On Leave", variant: "warning" },
    suspended: { label: "Suspended", variant: "destructive" },
    offboarding: { label: "Offboarding", variant: "warning" },
    alumni: { label: "Alumni", variant: "default" },
    do_not_engage: { label: "Do Not Engage", variant: "destructive" },
};

const CLASSIFICATION_LABELS: Record<WorkerClassification, string> = {
    full_time_employee: "Full-Time",
    part_time_employee: "Part-Time",
    seasonal_employee: "Seasonal",
    contract_employee: "Contract",
    independent_contractor: "IC (1099)",
    subcontractor: "Subcontractor",
    freelancer: "Freelancer",
    agency_worker: "Agency",
    temp_worker: "Temp",
    intern: "Intern",
    volunteer: "Volunteer",
};

function ComplianceBar({ score }: { score: number }) {
    return (
        <div className="flex items-center gap-2">
            <ProgressBar value={score} size="sm" className="w-16" />
            <span className="text-[10px] text-muted-foreground">{score}%</span>
        </div>
    );
}

function StarRating({ rating }: { rating: number }) {
    if (!rating) return <span className="text-[10px] text-muted-foreground">No reviews</span>;
    return (
        <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-star-rating text-star-rating" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
        </div>
    );
}

export default function WorkforcePage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [classFilter, setClassFilter] = useState<string>("all");
    const { data: sbWorkers, isLoading } = useWorkerProfiles();

    const workers = (sbWorkers ?? []) as typeof MOCK_WORKER_PROFILES;
    const filtered = workers.filter((w) => {
        const matchesSearch =
            !search ||
            `${w.firstName} ${w.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            w.email.toLowerCase().includes(search.toLowerCase()) ||
            (w.primaryRole || "").toLowerCase().includes(search.toLowerCase()) ||
            w.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === "all" || w.lifecycleStatus === statusFilter;
        const matchesClass = classFilter === "all" || w.primaryClassification === classFilter;
        return matchesSearch && matchesStatus && matchesClass;
    });

    const activeCount = workers.filter((w) => w.lifecycleStatus === "active").length;
    const onboardingCount = workers.filter((w) => w.lifecycleStatus === "onboarding").length;
    const complianceIssues = workers.filter(
        (w) => (w.complianceScore || 0) < 80 && w.lifecycleStatus === "active"
    ).length;
    const suspendedCount = workers.filter((w) => w.lifecycleStatus === "suspended").length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="workforce" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Workforce Directory"
                    description="Unified view of all workers across all employment classifications — employees, contractors, freelancers, vendors, and more"
                >
                    <Link href="/workforce/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4" /> Add Worker
                        </Button>
                    </Link>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Workers" value={activeCount} icon={UserCheck} />
                    <StatCard title="Onboarding" value={onboardingCount} icon={Clock} />
                    <StatCard
                        title="Compliance Issues"
                        value={complianceIssues}
                        icon={AlertTriangle}
                    />
                    <StatCard title="Suspended" value={suspendedCount} icon={UserX} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search by name, role, skill..."
                        className="flex-1 min-w-[200px] max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(LIFECYCLE_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>
                                {cfg.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Classifications</option>
                        {Object.entries(CLASSIFICATION_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    {filtered.map((worker, i) => (
                        <StaggerItem key={worker.id} index={i} stagger="tight">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {worker.firstName[0]}
                                            {worker.lastName[0]}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm font-bold truncate">
                                                    {worker.firstName} {worker.lastName}
                                                </h3>
                                                {worker.preferred && (
                                                    <Star className="h-3 w-3 fill-star-rating text-star-rating shrink-0" />
                                                )}
                                                <Badge
                                                    variant={
                                                        LIFECYCLE_CONFIG[worker.lifecycleStatus]
                                                            .variant
                                                    }
                                                    className="text-[10px] shrink-0"
                                                >
                                                    {LIFECYCLE_CONFIG[worker.lifecycleStatus].label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" />
                                                    {worker.primaryRole || "Unassigned"}
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px]">
                                                    {
                                                        CLASSIFICATION_LABELS[
                                                            worker.primaryClassification
                                                        ]
                                                    }
                                                </span>
                                                {worker.department && (
                                                    <span className="hidden sm:inline">
                                                        {worker.department}
                                                    </span>
                                                )}
                                                {worker.homeBase && (
                                                    <span className="hidden md:flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {worker.homeBase}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex items-center gap-4 shrink-0">
                                            <div className="text-center">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Compliance
                                                </p>
                                                <ComplianceBar
                                                    score={worker.complianceScore || 0}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Rating
                                                </p>
                                                <StarRating rating={worker.averageRating || 0} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Active
                                                </p>
                                                <p className="text-xs font-medium">
                                                    {worker.activeEngagements || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex items-center gap-1 shrink-0">
                                            {worker.skills.slice(0, 3).map((skill) => (
                                                <Chip key={skill} size="sm">
                                                    {skill.replace(/_/g, " ")}
                                                </Chip>
                                            ))}
                                            {worker.skills.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    +{worker.skills.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No workers found matching your criteria
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    Showing {filtered.length} of {workers.length} workers
                </div>
            </div>
        </PermissionGate>
    );
}
