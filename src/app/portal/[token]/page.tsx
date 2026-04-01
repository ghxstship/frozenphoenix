"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Package,
    Plus,
    ShieldCheck,
    Trash2,
    Upload,
    Users,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { COMMON_STRINGS } from "@/lib/i18n/common-strings";

type PortalData = {
    project: Record<string, unknown> | null;
    vendor: Record<string, unknown> | null;
    collaborator: Record<string, unknown> | null;
    advance_items: Record<string, unknown>[];
    crew_submissions: Record<string, unknown>[];
    permissions: string[];
    expires_at: string;
};

type Requirement = {
    id: string;
    requirement_type: string;
    label: string;
    description: string | null;
    status: string;
    deadline: string | null;
    is_blocking: boolean;
    submitted_at: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    custom_instructions: string | null;
    upload_url: string | null;
    sort_order: number;
};

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        variant: "default" | "info" | "warning" | "success" | "destructive" | "ghost";
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    not_requested: { label: "Not Requested", variant: "ghost", icon: Clock },
    requested: { label: "Action Required", variant: "warning", icon: AlertTriangle },
    submitted: { label: "Submitted", variant: "info", icon: FileText },
    in_review: { label: "In Review", variant: "info", icon: Clock },
    approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
    rejected: { label: "Needs Revision", variant: "destructive", icon: XCircle },
    expired: { label: "Expired", variant: "destructive", icon: AlertTriangle },
    waived: { label: "Waived", variant: "ghost", icon: CheckCircle2 },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    contract: FileText,
    coi: ShieldCheck,
    w9: FileText,
    nda: FileText,
    advance_manifest: Package,
    crew_roster: Users,
    insurance_auto: ShieldCheck,
    insurance_gl: ShieldCheck,
    workers_comp: ShieldCheck,
    background_check: ShieldCheck,
    custom: FileText,
};

export default function CollaboratorPortalPage() {
    const params = useParams();
    const token = params.token as string;

    const [data, setData] = React.useState<PortalData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [submittingReq, setSubmittingReq] = React.useState<string | null>(null);
    const [actionError, setActionError] = React.useState<string | null>(null);

    const loadPortal = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/portal/${token}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setError(
                    (err as Record<string, Record<string, string>>)?.error?.message ??
                        "Unable to load portal"
                );
                return;
            }
            const json = await res.json();
            setData(json.data as PortalData);
        } catch {
            setError("Network error — please try again");
        } finally {
            setLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        if (token) loadPortal();
    }, [token, loadPortal]);

    const [confirmingManifest, setConfirmingManifest] = React.useState(false);
    const [crewDraft, setCrewDraft] = React.useState<
        { first_name: string; last_name: string; role_title: string; email: string }[]
    >([]);
    const [submittingCrew, setSubmittingCrew] = React.useState(false);

    async function handleSubmitRequirement(requirementId: string) {
        setSubmittingReq(requirementId);
        try {
            const res = await fetch(`/api/portal/${token}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requirement_id: requirementId }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setActionError(
                    (err as Record<string, Record<string, string>>)?.error?.message ??
                        "Submission failed"
                );
                return;
            }
            setActionError(null);
            await loadPortal();
        } finally {
            setSubmittingReq(null);
        }
    }

    async function handleConfirmManifest() {
        if (!data) return;
        setConfirmingManifest(true);
        try {
            const items = data.advance_items
                .filter((i) => String(i.status ?? "") === "pending")
                .map((i) => ({
                    item_id: i.id,
                    quantity_confirmed: i.quantity_requested,
                }));
            if (items.length === 0) return;
            const res = await fetch(`/api/portal/${token}/confirm-manifest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setActionError(
                    (err as Record<string, Record<string, string>>)?.error?.message ??
                        "Confirmation failed"
                );
                return;
            }
            setActionError(null);
            await loadPortal();
        } finally {
            setConfirmingManifest(false);
        }
    }

    function addCrewRow() {
        setCrewDraft((prev) => [
            ...prev,
            { first_name: "", last_name: "", role_title: "", email: "" },
        ]);
    }

    function updateCrewRow(index: number, field: string, value: string) {
        setCrewDraft((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    }

    function removeCrewRow(index: number) {
        setCrewDraft((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmitCrew() {
        const valid = crewDraft.filter((r) => r.first_name && r.last_name && r.role_title);
        if (valid.length === 0) return;
        setSubmittingCrew(true);
        try {
            const res = await fetch(`/api/portal/${token}/crew-roster`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crew: valid }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setActionError(
                    (err as Record<string, Record<string, string>>)?.error?.message ??
                        "Submission failed"
                );
                return;
            }
            setActionError(null);
            setCrewDraft([]);
            await loadPortal();
        } finally {
            setSubmittingCrew(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 motion-safe:animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                        <h2 className="text-lg font-semibold">Portal Unavailable</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { project, vendor, collaborator } = data;
    const requirements = (
        (collaborator?.collaborator_requirements as Requirement[] | undefined) ?? []
    ).sort((a, b) => a.sort_order - b.sort_order);

    const totalReqs = requirements.length;
    const completedReqs = requirements.filter(
        (r) => r.status === "approved" || r.status === "waived"
    ).length;
    const actionRequired = requirements.filter(
        (r) => r.status === "requested" || r.status === "rejected"
    ).length;
    const progressPct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card px-4 py-6 sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {String(project?.name ?? "Project")}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {String(vendor?.name ?? "")} &mdash;{" "}
                                {String(collaborator?.engagement_type ?? "Collaborator")}
                            </p>
                        </div>
                        <Badge
                            variant={String(collaborator?.status) === "active" ? "success" : "info"}
                        >
                            {String(collaborator?.status ?? "invited")}
                        </Badge>
                    </div>

                    {/* Timeline */}
                    {Boolean(project?.start_date) && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(String(project?.start_date))} —{" "}
                                {formatDate(String(project?.end_date ?? ""))}
                            </span>
                            {Boolean(collaborator?.scope_summary) && (
                                <>
                                    <span>·</span>
                                    <span>{String(collaborator?.scope_summary)}</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>
                                {completedReqs}/{totalReqs} requirements complete
                            </span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 density-gap-page">
                {/* Error Banner */}
                {actionError && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex items-center justify-between gap-3 pt-4">
                            <div className="flex items-center gap-3">
                                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                                <p className="text-sm text-destructive">{actionError}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActionError(null)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Dismiss
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Action Required Banner */}
                {actionRequired > 0 && (
                    <Card className="border-warning/50 bg-warning/5">
                        <CardContent className="flex items-center gap-3 pt-4">
                            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                            <div>
                                <p className="text-sm font-medium">
                                    {actionRequired} item{actionRequired > 1 ? "s" : ""} require
                                    {actionRequired === 1 ? "s" : ""} your attention
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Please review and submit the items marked below
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Requirements Checklist */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {requirements.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No requirements assigned yet
                            </p>
                        ) : (
                            requirements.map((req) => {
                                const statusConf =
                                    STATUS_CONFIG[req.status] ?? STATUS_CONFIG.not_requested;
                                const TypeIcon = TYPE_ICONS[req.requirement_type] ?? FileText;
                                const daysUntilDeadline = req.deadline
                                    ? Math.ceil(
                                          (new Date(req.deadline).getTime() - Date.now()) /
                                              (1000 * 60 * 60 * 24)
                                      )
                                    : null;

                                return (
                                    <div
                                        key={req.id}
                                        className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                                            req.status === "requested" || req.status === "rejected"
                                                ? "border-warning/50 bg-warning/5"
                                                : req.status === "approved" ||
                                                    req.status === "waived"
                                                  ? "border-success/30 bg-success/5"
                                                  : ""
                                        }`}
                                    >
                                        <div className="mt-0.5">
                                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {req.label}
                                                </span>
                                                {req.is_blocking && (
                                                    <Badge
                                                        variant="ghost"
                                                        className="density-caption"
                                                    >
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                            {req.description && (
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {req.description}
                                                </p>
                                            )}
                                            {req.custom_instructions && (
                                                <p className="mt-1 text-xs italic text-muted-foreground">
                                                    {req.custom_instructions}
                                                </p>
                                            )}
                                            {req.rejection_reason && (
                                                <p className="mt-1 text-xs text-destructive">
                                                    Revision needed: {req.rejection_reason}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                {req.deadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Due {formatDate(req.deadline)}
                                                        {daysUntilDeadline !== null &&
                                                            daysUntilDeadline <= 3 &&
                                                            daysUntilDeadline >= 0 && (
                                                                <span className="text-warning font-medium">
                                                                    ({daysUntilDeadline}d left)
                                                                </span>
                                                            )}
                                                        {daysUntilDeadline !== null &&
                                                            daysUntilDeadline < 0 && (
                                                                <span className="text-destructive font-medium">
                                                                    (overdue)
                                                                </span>
                                                            )}
                                                    </span>
                                                )}
                                                {req.submitted_at && (
                                                    <span>
                                                        Submitted {formatDate(req.submitted_at)}
                                                    </span>
                                                )}
                                                {req.approved_at && (
                                                    <span>
                                                        Approved {formatDate(req.approved_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge
                                                variant={statusConf?.variant ?? "ghost"}
                                                className="density-caption"
                                            >
                                                {statusConf?.label ?? req.status}
                                            </Badge>
                                            {(req.status === "requested" ||
                                                req.status === "rejected") &&
                                                data.permissions.includes("submit") && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        disabled={submittingReq === req.id}
                                                        onClick={() =>
                                                            handleSubmitRequirement(req.id)
                                                        }
                                                    >
                                                        {submittingReq === req.id ? (
                                                            <Loader2 className="h-3 w-3 motion-safe:animate-spin" />
                                                        ) : (
                                                            <Upload className="h-3 w-3" />
                                                        )}
                                                        {submittingReq === req.id
                                                            ? COMMON_STRINGS.action_submitting
                                                            : COMMON_STRINGS.action_submit}
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Advance Items — Interactive Manifest Confirmation */}
                {data.advance_items.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Production Advance Items ({data.advance_items.length})
                            </CardTitle>
                            {data.advance_items.some((i) => String(i.status ?? "") === "pending") &&
                                data.permissions.includes("submit") && (
                                    <Button
                                        size="sm"
                                        disabled={confirmingManifest}
                                        onClick={handleConfirmManifest}
                                    >
                                        {confirmingManifest ? (
                                            <Loader2 className="h-3 w-3 motion-safe:animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-3 w-3" />
                                        )}
                                        {confirmingManifest ? "Confirming..." : "Confirm All Items"}
                                    </Button>
                                )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.advance_items.map((item) => {
                                const catalogItem = item.catalog_items as Record<
                                    string,
                                    unknown
                                > | null;
                                const isPending = String(item.status ?? "") === "pending";
                                const isConfirmed = String(item.status ?? "") === "confirmed";
                                return (
                                    <div
                                        key={item.id as string}
                                        className={`flex items-center justify-between rounded-lg border p-3 ${
                                            isConfirmed ? "border-success/30 bg-success/5" : ""
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {String(catalogItem?.name ?? "Item")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Qty: {String(item.quantity_requested ?? 0)}
                                                {item.quantity_confirmed
                                                    ? ` (${String(item.quantity_confirmed)} confirmed)`
                                                    : ""}
                                                {` · ${String(catalogItem?.unit_of_measure ?? "ea")}`}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                isConfirmed
                                                    ? "success"
                                                    : isPending
                                                      ? "warning"
                                                      : "ghost"
                                            }
                                            className="density-caption"
                                        >
                                            {isConfirmed
                                                ? "Confirmed"
                                                : String(item.status ?? "pending")}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Crew Roster — Interactive Submission */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Crew Roster
                            {data.crew_submissions.length > 0 &&
                                ` (${data.crew_submissions.length} submitted)`}
                        </CardTitle>
                        {data.permissions.includes("submit") && (
                            <Button size="sm" variant="outline" onClick={addCrewRow}>
                                <Plus className="h-3 w-3" />
                                Add Member
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Existing submissions */}
                        {data.crew_submissions.map((crew) => (
                            <div
                                key={crew.id as string}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(crew.first_name)} {String(crew.last_name)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {String(crew.role_title ?? "")}
                                        {crew.department ? ` · ${String(crew.department)}` : ""}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        crew.status === "approved"
                                            ? "success"
                                            : crew.status === "rejected"
                                              ? "destructive"
                                              : "info"
                                    }
                                    className="density-caption"
                                >
                                    {String(crew.status ?? "submitted")}
                                </Badge>
                            </div>
                        ))}

                        {/* Draft rows */}
                        {crewDraft.map((row, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 p-3"
                            >
                                <Input
                                    placeholder="First name"
                                    value={row.first_name}
                                    onChange={(e) =>
                                        updateCrewRow(idx, "first_name", e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <Input
                                    placeholder="Last name"
                                    value={row.last_name}
                                    onChange={(e) =>
                                        updateCrewRow(idx, "last_name", e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <Input
                                    placeholder="Role / Title"
                                    value={row.role_title}
                                    onChange={(e) =>
                                        updateCrewRow(idx, "role_title", e.target.value)
                                    }
                                    className="h-8 text-sm"
                                />
                                <Input
                                    placeholder="Email"
                                    value={row.email}
                                    onChange={(e) => updateCrewRow(idx, "email", e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeCrewRow(idx)}
                                    className="shrink-0"
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}

                        {/* Submit draft rows */}
                        {crewDraft.length > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                    {
                                        crewDraft.filter(
                                            (r) => r.first_name && r.last_name && r.role_title
                                        ).length
                                    }{" "}
                                    of {crewDraft.length} ready
                                </p>
                                <Button
                                    size="sm"
                                    disabled={
                                        submittingCrew ||
                                        crewDraft.filter(
                                            (r) => r.first_name && r.last_name && r.role_title
                                        ).length === 0
                                    }
                                    onClick={handleSubmitCrew}
                                >
                                    {submittingCrew ? (
                                        <Loader2 className="h-3 w-3 motion-safe:animate-spin" />
                                    ) : (
                                        <Upload className="h-3 w-3" />
                                    )}
                                    {submittingCrew
                                        ? COMMON_STRINGS.action_submitting
                                        : "Submit Roster"}
                                </Button>
                            </div>
                        )}

                        {data.crew_submissions.length === 0 && crewDraft.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No crew members submitted yet
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground py-4">
                    Portal access expires {formatDate(data.expires_at)}
                </div>
            </main>
        </div>
    );
}
