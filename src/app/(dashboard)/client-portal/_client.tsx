"use client";

import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_SERVICE_REQUEST_CONFIG } from "@/config/create-entity-configs";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyRow } from "@/components/ui/empty-row";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye,
    FileSignature,
    FileText,
    FolderKanban,
    MessageSquare,
    Plus,
    ShieldCheck,
} from "lucide-react";
import { useApprovals, useProjects } from "@/lib/supabase";
import { useClientInvoices, useEstimates } from "@/lib/supabase";

const EST_STATUS_BADGE: Record<string, "default" | "info" | "warning" | "success" | "destructive"> =
    {
        draft: "default",
        sent: "info",
        viewed: "info",
        accepted: "success",
        rejected: "destructive",
        expired: "destructive",
    };

export function ClientPortalPageClient() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: sbProjects, isLoading: projLoading } = useProjects();
    const { data: sbInvoices, isLoading: invLoading } = useClientInvoices();
    const { data: sbApprovals, isLoading: appLoading } = useApprovals();
    const { data: sbEstimates, isLoading: estLoading } = useEstimates();

    const isLoading = projLoading || invLoading || appLoading || estLoading;

    type ProjectView = {
        id: string;
        name: string;
        status: string;
        phase: string;
        progress: number;
        nextMilestone: string;
        nextMilestoneDate: string;
    };
    const projects: ProjectView[] = (sbProjects ?? []).map((p) => {
        const rec = p as Record<string, unknown>;
        return {
            id: p.id,
            name: p.name ?? "",
            status: (p.status ?? "planning") as string,
            phase: (rec.phase as string) ?? "",
            progress: Number(rec.progress ?? 0),
            nextMilestone: "",
            nextMilestoneDate: "",
        };
    });

    type InvoiceView = {
        id: string;
        number: string;
        amount: number;
        status: string;
        dueDate: string;
    };
    const invoices: InvoiceView[] = (sbInvoices ?? []).map((inv: Record<string, unknown>) => ({
        id: inv.id as string,
        number: (inv.invoice_number as string) ?? "",
        amount: Number(inv.total ?? 0),
        status: (inv.status as string) ?? "draft",
        dueDate: (inv.due_date as string) ?? "",
    }));

    type ApprovalView = {
        id: string;
        title: string;
        type: string;
        status: string;
        deadline: string;
    };
    const approvals: ApprovalView[] = (sbApprovals ?? []).map((a) => ({
        id: a.id,
        title: a.milestone_name ?? "",
        type: a.milestone_id ?? "",
        status: (a.status ?? "pending") as string,
        deadline: a.deadline ? String(a.deadline) : "",
    }));

    type EstimateView = {
        id: string;
        number: string;
        title: string;
        total: number;
        status: string;
        validUntil: string;
        sentAt: string;
    };
    const estimates: EstimateView[] = (sbEstimates ?? []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        number: (e.number as string) ?? "",
        title: (e.title as string) ?? "",
        total: Number(e.total ?? 0),
        status: (e.status as string) ?? "draft",
        validUntil: (e.valid_until as string) ?? "",
        sentAt: (e.sent_at as string) ?? "",
    }));

    const totalOutstanding = invoices
        .filter((i) => i.status !== "paid")
        .reduce((sum, i) => sum + i.amount, 0);
    const pendingApprovals = approvals.filter((a) => a.status === "pending").length;

    const contentSlot = (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 density-gap-card">
                <StatCard
                    title="Active Projects"
                    value={
                        projects.filter((p) => p.status === "active" || p.status === "in_progress")
                            .length
                    }
                    icon={FolderKanban}
                />
                <StatCard title="Pending Approvals" value={pendingApprovals} icon={ShieldCheck} />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(totalOutstanding)}
                    icon={DollarSign}
                />
                <StatCard title="Estimates" value={estimates.length} icon={FileSignature} />
                <StatCard title="Documents" value={0} icon={FileText} />
            </div>

            {/* Projects */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FolderKanban className="h-4 w-4" />
                        Your Projects
                    </CardTitle>
                </CardHeader>
                <CardContent className="density-gap-section">
                    {projects.length === 0 && <EmptyRow message="No projects found" />}
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold">{project.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant={
                                                project.status === "active" ||
                                                project.status === "in_progress"
                                                    ? "success"
                                                    : "ghost"
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {project.phase}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Eye className="mr-2 h-3 w-3" />
                                    View
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-semibold">{project.progress}%</span>
                                </div>
                                <ProgressBar value={project.progress} size="md" />
                                {project.nextMilestone && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        Next: {project.nextMilestone} —{" "}
                                        {formatDate(project.nextMilestoneDate)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 density-gap-card">
                {/* Estimates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileSignature className="h-4 w-4" />
                            Estimates & Quotes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {estimates.length === 0 && <EmptyRow message="No estimates found" />}
                        {estimates.map((est) => (
                            <div
                                key={est.id}
                                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="density-caption font-mono text-muted-foreground">
                                                {est.number}
                                            </span>
                                            <Badge
                                                variant={EST_STATUS_BADGE[est.status] || "default"}
                                                className="density-caption"
                                            >
                                                {est.status}
                                            </Badge>
                                        </div>
                                        <h4 className="text-sm font-semibold mt-1">{est.title}</h4>
                                    </div>
                                    <span className="text-sm font-bold">
                                        {formatCurrency(est.total)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                    <span>
                                        {est.validUntil &&
                                            `Valid until ${formatDate(est.validUntil)}`}
                                    </span>
                                    {est.status === "sent" && (
                                        <Button size="sm">Review & Approve</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Pending Approvals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Pending Approvals
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {approvals.length === 0 && <EmptyRow message="No approvals pending" />}
                        {approvals.map((approval) => (
                            <div
                                key={approval.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div>
                                    <h4 className="text-sm font-semibold">{approval.title}</h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Badge variant="ghost" className="density-caption">
                                            {approval.type}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Due {formatDate(approval.deadline)}
                                        </span>
                                    </div>
                                </div>
                                {approval.status === "pending" ? (
                                    <Button size="sm">Review</Button>
                                ) : (
                                    <Badge variant="success">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Approved
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Invoices */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Invoices
                        </CardTitle>
                        <Button size="sm" variant="outline">
                            <CreditCard className="h-3 w-3" /> Make Payment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {invoices.length === 0 && <EmptyRow message="No invoices found" />}
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                        >
                            <div className="flex items-center gap-3">
                                <FileText
                                    className={`h-4 w-4 ${invoice.status === "paid" ? "text-success" : invoice.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}
                                />
                                <div>
                                    <p className="text-sm font-semibold">{invoice.number}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Due {formatDate(invoice.dueDate)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-bold">
                                    {formatCurrency(invoice.amount)}
                                </p>
                                <Badge
                                    variant={
                                        invoice.status === "paid"
                                            ? "success"
                                            : invoice.status === "overdue"
                                              ? "destructive"
                                              : "info"
                                    }
                                >
                                    {invoice.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <CreateEntityDialog
                config={CREATE_SERVICE_REQUEST_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "client_portal",
        action: "read",
        title: "Client Portal",
        description:
            "View projects, estimates, invoices, and pending approvals. Request new work or make payments.",
        headerActions: (
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" /> Messages
                </Button>
                <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Request Work
                </Button>
                <Badge variant="info" className="text-sm px-3 py-1">
                    <Building2 className="mr-2 h-3.5 w-3.5" />
                    Client View
                </Badge>
            </div>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
