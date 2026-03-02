"use client";

import { useMemo, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApprovalFlow, type ApprovalStep } from "@/components/ui/approval-flow";
import { OverlineText } from "@/components/ui/overline-text";
import { StaggerItem } from "@/components/ui/stagger-container";
import { formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    Clock,
    Plus,
    XCircle,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

type QCStatus = "pending" | "in_progress" | "passed" | "failed" | "waived";
type QCCategory =
    | "safety"
    | "technical"
    | "aesthetic"
    | "structural"
    | "compliance"
    | "client_signoff";

interface CheckItem {
    id: string;
    label: string;
    passed: boolean | null;
    note?: string;
}

interface QualityCheck {
    id: string;
    title: string;
    projectName: string;
    category: QCCategory;
    status: QCStatus;
    phase: string;
    inspectorName: string;
    scheduledDate: string;
    completedDate?: string;
    checkItems: CheckItem[];
    photos: number;
    notes?: string;
}

const CATEGORY_LABELS: Record<QCCategory, string> = {
    safety: "Safety",
    technical: "Technical",
    aesthetic: "Aesthetic",
    structural: "Structural",
    compliance: "Compliance",
    client_signoff: "Client Sign-Off",
};

const MOCK_QC: QualityCheck[] = [
    {
        id: "qc1",
        title: "Stage Structural Integrity Check",
        projectName: "Nike Air Max Launch",
        category: "structural",
        status: "passed",
        phase: "Load-In",
        inspectorName: "Marcus Johnson",
        scheduledDate: "2026-03-01",
        completedDate: "2026-03-01",
        checkItems: [
            { id: "ci1", label: "Weight load test passed (150% rated capacity)", passed: true },
            { id: "ci2", label: "All connection points torqued to spec", passed: true },
            { id: "ci3", label: "Guardrails installed and tested", passed: true },
            { id: "ci4", label: "Emergency exit paths clear", passed: true },
        ],
        photos: 8,
        notes: "All structural elements passed. Stage rated for 2,500 lbs distributed load.",
    },
    {
        id: "qc2",
        title: "AV Systems Integration Test",
        projectName: "Nike Air Max Launch",
        category: "technical",
        status: "in_progress",
        phase: "Technical Rehearsal",
        inspectorName: "David Kim",
        scheduledDate: "2026-03-02",
        checkItems: [
            { id: "ci5", label: "Main PA SPL at design target (±3dB)", passed: true },
            { id: "ci6", label: "LED wall pixel mapping verified", passed: true },
            { id: "ci7", label: "Timecode sync < 1 frame drift", passed: null },
            { id: "ci8", label: "Backup systems failover tested", passed: null },
            { id: "ci9", label: "Intercom coverage all positions", passed: true },
        ],
        photos: 4,
    },
    {
        id: "qc3",
        title: "Fire Safety & Compliance Review",
        projectName: "Red Bull Festival 2024",
        category: "compliance",
        status: "pending",
        phase: "Pre-Event",
        inspectorName: "Safety Team",
        scheduledDate: "2026-03-10",
        checkItems: [
            { id: "ci10", label: "Fire marshal approval obtained", passed: null },
            { id: "ci11", label: "Fire extinguisher placement verified", passed: null },
            { id: "ci12", label: "Emergency evacuation plan posted", passed: null },
            { id: "ci13", label: "Pyrotechnics safety perimeter marked", passed: null },
            { id: "ci14", label: "Crowd capacity limits documented", passed: null },
        ],
        photos: 0,
    },
    {
        id: "qc4",
        title: "Client Creative Walkthrough",
        projectName: "Nike Air Max Launch",
        category: "client_signoff",
        status: "failed",
        phase: "Dress Rehearsal",
        inspectorName: "Sarah Chen",
        scheduledDate: "2026-03-03",
        completedDate: "2026-03-03",
        checkItems: [
            { id: "ci15", label: "Brand color accuracy (Pantone match)", passed: true },
            { id: "ci16", label: "Logo placement per brand guidelines", passed: true },
            {
                id: "ci17",
                label: "Lighting mood matches creative brief",
                passed: false,
                note: "Client wants warmer tones in hero zone",
            },
            { id: "ci18", label: "Content playback sequence approved", passed: true },
            {
                id: "ci19",
                label: "VIP experience flow approved",
                passed: false,
                note: "Registration desk needs relocation",
            },
        ],
        photos: 12,
        notes: "2 items require rework. Follow-up walkthrough scheduled for March 4.",
    },
    {
        id: "qc5",
        title: "Rigging Safety Inspection",
        projectName: "Red Bull Festival 2024",
        category: "safety",
        status: "passed",
        phase: "Load-In",
        inspectorName: "Tom Bradley",
        scheduledDate: "2026-03-08",
        completedDate: "2026-03-08",
        checkItems: [
            { id: "ci20", label: "All rigging points certified", passed: true },
            { id: "ci21", label: "Wire rope inspection (no fraying)", passed: true },
            { id: "ci22", label: "Safety cables on all suspended elements", passed: true },
            { id: "ci23", label: "Motor controllers tested", passed: true },
        ],
        photos: 6,
    },
];

const QC_APPROVAL_STEPS: ApprovalStep[] = [
    { id: "s1", label: "Inspector Check", assigneeName: "Inspector", status: "approved" },
    { id: "s2", label: "PM Review", assigneeName: "Project Manager", status: "in_progress" },
    { id: "s3", label: "Client Sign-Off", assigneeName: "Client", status: "pending" },
];

const TAB_VALUES = ["all", "pending", "in_progress", "passed", "failed"] as const;

export default function QualityChecksPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: TAB_VALUES,
    });
    const [expandedId, setExpandedId] = useState<string | null>("qc1");

    const filtered = useMemo(
        () =>
            MOCK_QC.filter((qc) => {
                if (statusFilter !== "all" && qc.status !== statusFilter) return false;
                if (
                    search &&
                    !qc.title.toLowerCase().includes(search.toLowerCase()) &&
                    !qc.projectName.toLowerCase().includes(search.toLowerCase())
                )
                    return false;
                return true;
            }),
        [search, statusFilter]
    );

    const passed = MOCK_QC.filter((q) => q.status === "passed").length;
    const failed = MOCK_QC.filter((q) => q.status === "failed").length;
    const pending = MOCK_QC.filter(
        (q) => q.status === "pending" || q.status === "in_progress"
    ).length;
    const totalItems = MOCK_QC.reduce((s, q) => s + q.checkItems.length, 0);
    const passedItems = MOCK_QC.reduce(
        (s, q) => s + q.checkItems.filter((ci) => ci.passed === true).length,
        0
    );

    return (
        <PermissionGate resource="quality_checks" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Quality Checks"
                    description="Inspection checklists, safety verifications, and client sign-off tracking"
                >
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Inspection
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Passed" value={passed} icon={CheckCircle2} />
                    <StatCard
                        title="Failed / Rework"
                        value={failed}
                        icon={XCircle}
                        className={failed > 0 ? "border-destructive/50 bg-destructive/5" : ""}
                    />
                    <StatCard title="Pending" value={pending} icon={Clock} />
                    <StatCard
                        title="Items Checked"
                        value={`${passedItems}/${totalItems}`}
                        description={`${totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0}% complete`}
                        icon={ClipboardCheck}
                    />
                </div>

                {/* Approval Workflow */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Standard QC Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ApprovalFlow steps={QC_APPROVAL_STEPS} />
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4 flex-wrap">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search inspections..."
                        className="flex-1 max-w-sm"
                    />
                    <SegmentedControl
                        ariaLabel="QC status filter"
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as (typeof TAB_VALUES)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "pending", label: "Pending" },
                            { value: "in_progress", label: "In Progress" },
                            { value: "passed", label: "Passed" },
                            { value: "failed", label: "Failed" },
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    {filtered.map((qc, i) => {
                        const isExpanded = expandedId === qc.id;
                        const passCount = qc.checkItems.filter((ci) => ci.passed === true).length;
                        const failCount = qc.checkItems.filter((ci) => ci.passed === false).length;
                        const unchecked = qc.checkItems.filter((ci) => ci.passed === null).length;

                        return (
                            <StaggerItem key={qc.id} index={i} stagger="normal">
                                <Card className="overflow-hidden">
                                    <CardHeader
                                        className="cursor-pointer hover:bg-secondary/30 transition-colors py-4"
                                        onClick={() => setExpandedId(isExpanded ? null : qc.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CardTitle className="text-sm">
                                                        {qc.title}
                                                    </CardTitle>
                                                    <StatusBadge
                                                        status={qc.status}
                                                        className="text-[10px]"
                                                    />
                                                    <Badge variant="ghost" className="text-[10px]">
                                                        {CATEGORY_LABELS[qc.category]}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {qc.projectName} · {qc.phase} · Inspector:{" "}
                                                    {qc.inspectorName} ·{" "}
                                                    {formatDate(qc.scheduledDate)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className="text-success font-medium">
                                                        {passCount}✓
                                                    </span>
                                                    {failCount > 0 && (
                                                        <span className="text-destructive font-medium">
                                                            {failCount}✗
                                                        </span>
                                                    )}
                                                    {unchecked > 0 && (
                                                        <span className="text-muted-foreground">
                                                            {unchecked}○
                                                        </span>
                                                    )}
                                                </div>
                                                {qc.photos > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Camera className="h-3 w-3" />
                                                        {qc.photos}
                                                    </div>
                                                )}
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardContent className="pt-0 space-y-4">
                                            <div>
                                                <OverlineText as="h4" className="mb-3">
                                                    Check Items
                                                </OverlineText>
                                                <div className="space-y-2">
                                                    {qc.checkItems.map((ci) => (
                                                        <div
                                                            key={ci.id}
                                                            className={`flex items-start gap-3 p-2.5 rounded-lg ${
                                                                ci.passed === true
                                                                    ? "bg-success/5"
                                                                    : ci.passed === false
                                                                      ? "bg-destructive/5"
                                                                      : "bg-secondary/30"
                                                            }`}
                                                        >
                                                            <div className="shrink-0 mt-0.5">
                                                                {ci.passed === true && (
                                                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                                                )}
                                                                {ci.passed === false && (
                                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                                )}
                                                                {ci.passed === null && (
                                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium">
                                                                    {ci.label}
                                                                </p>
                                                                {ci.note && (
                                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                        {ci.note}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {qc.notes && (
                                                <div>
                                                    <OverlineText as="h4" className="mb-2">
                                                        Inspector Notes
                                                    </OverlineText>
                                                    <p className="text-sm text-muted-foreground">
                                                        {qc.notes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                {qc.status === "in_progress" && (
                                                    <Button size="sm">
                                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                                                        Complete Inspection
                                                    </Button>
                                                )}
                                                {qc.status === "failed" && (
                                                    <Button size="sm" variant="outline">
                                                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />{" "}
                                                        Schedule Re-Inspection
                                                    </Button>
                                                )}
                                                {qc.status === "pending" && (
                                                    <Button size="sm">
                                                        <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />{" "}
                                                        Start Inspection
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm">
                                                    <Camera className="mr-1.5 h-3.5 w-3.5" /> Add
                                                    Photos
                                                </Button>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No quality checks found</p>
                    </div>
                )}
            </div>
        </PermissionGate>
    );
}
