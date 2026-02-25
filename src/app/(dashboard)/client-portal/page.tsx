"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Building2, FolderKanban, FileText, ShieldCheck, DollarSign,
    Calendar, CheckCircle2, Clock, Eye, Download, FileSignature,
    Plus, CreditCard, MessageSquare,
} from "lucide-react";

interface PortalProject {
    id: string;
    name: string;
    status: string;
    phase: string;
    progress: number;
    nextMilestone: string;
    nextMilestoneDate: string;
}

interface PortalInvoice {
    id: string;
    number: string;
    amount: number;
    status: string;
    dueDate: string;
}

interface PortalApproval {
    id: string;
    title: string;
    type: string;
    status: string;
    deadline: string;
}

interface PortalEstimate {
    id: string;
    number: string;
    title: string;
    total: number;
    status: string;
    validUntil: string;
    sentAt: string;
}

const mockProjects: PortalProject[] = [
    { id: "1", name: "Air Max Launch Experience", status: "active", phase: "Fabrication", progress: 65, nextMilestone: "QC Sign-off", nextMilestoneDate: "2026-03-10" },
    { id: "2", name: "Summer Brand Activation", status: "planning", phase: "Pre-Production", progress: 25, nextMilestone: "Creative Approval", nextMilestoneDate: "2026-03-20" },
];

const mockInvoices: PortalInvoice[] = [
    { id: "1", number: "INV-2026-0001", amount: 125000, status: "paid", dueDate: "2026-02-14" },
    { id: "2", number: "INV-2026-0003", amount: 195000, status: "overdue", dueDate: "2026-01-31" },
    { id: "3", number: "INV-2026-0005", amount: 62500, status: "sent", dueDate: "2026-03-20" },
];

const mockApprovals: PortalApproval[] = [
    { id: "1", title: "Creative Concept — Air Max Launch", type: "creative", status: "pending", deadline: "2026-03-05" },
    { id: "2", title: "Fabrication Proof — Stage Design", type: "production", status: "pending", deadline: "2026-03-08" },
    { id: "3", title: "Budget Amendment Request", type: "financial", status: "approved", deadline: "2026-02-28" },
];

const mockEstimates: PortalEstimate[] = [
    { id: "est1", number: "EST-2026-001", title: "SXSW Brand Activation Package", total: 198740, status: "sent", validUntil: "2026-03-01", sentAt: "2026-02-20" },
    { id: "est4", number: "EST-2026-004", title: "Podcast Studio Pop-Up", total: 68500, status: "accepted", validUntil: "2026-03-15", sentAt: "2026-02-15" },
];

const EST_STATUS_BADGE: Record<string, "default" | "info" | "warning" | "success" | "destructive"> = {
    draft: "default",
    sent: "info",
    viewed: "info",
    accepted: "success",
    rejected: "destructive",
    expired: "destructive",
};

export default function ClientPortalPage() {
    const totalOutstanding = mockInvoices.filter(i => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);
    const pendingApprovals = mockApprovals.filter(a => a.status === "pending").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Client Portal" description="View projects, estimates, invoices, and pending approvals. Request new work or make payments.">
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline"><MessageSquare className="h-4 w-4" /> Messages</Button>
                    <Button size="sm"><Plus className="h-4 w-4" /> Request Work</Button>
                    <Badge variant="info" className="text-sm px-3 py-1">
                        <Building2 className="mr-2 h-3.5 w-3.5" />Client View
                    </Badge>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Active Projects" value={mockProjects.length} icon={FolderKanban} />
                <StatCard title="Pending Approvals" value={pendingApprovals} icon={ShieldCheck} />
                <StatCard title="Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} />
                <StatCard title="Estimates" value={mockEstimates.length} icon={FileSignature} />
                <StatCard title="Documents" value={12} icon={FileText} />
            </div>

            {/* Projects */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FolderKanban className="h-4 w-4" />Your Projects
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockProjects.map((project) => (
                        <div key={project.id} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold">{project.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={project.status === "active" ? "success" : "ghost"}>{project.status}</Badge>
                                        <span className="text-xs text-muted-foreground">{project.phase}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm"><Eye className="mr-2 h-3 w-3" />View</Button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-semibold">{project.progress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Next: {project.nextMilestone} — {formatDate(project.nextMilestoneDate)}
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estimates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileSignature className="h-4 w-4" />Estimates & Quotes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockEstimates.map((est) => (
                            <div key={est.id} className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-muted-foreground">{est.number}</span>
                                            <Badge variant={EST_STATUS_BADGE[est.status] || "default"} className="text-[10px]">{est.status}</Badge>
                                        </div>
                                        <h4 className="text-sm font-semibold mt-1">{est.title}</h4>
                                    </div>
                                    <span className="text-sm font-bold">{formatCurrency(est.total)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                    <span>Valid until {formatDate(est.validUntil)}</span>
                                    {est.status === "sent" && <Button size="sm">Review & Approve</Button>}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Pending Approvals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />Pending Approvals
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockApprovals.map((approval) => (
                            <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div>
                                    <h4 className="text-sm font-semibold">{approval.title}</h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Badge variant="ghost" className="text-[10px]">{approval.type}</Badge>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due {formatDate(approval.deadline)}</span>
                                    </div>
                                </div>
                                {approval.status === "pending" ? (
                                    <Button size="sm">Review</Button>
                                ) : (
                                    <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Approved</Badge>
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
                            <DollarSign className="h-4 w-4" />Invoices
                        </CardTitle>
                        <Button size="sm" variant="outline"><CreditCard className="h-3 w-3" /> Make Payment</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockInvoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                                <FileText className={`h-4 w-4 ${invoice.status === "paid" ? "text-success" : invoice.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`} />
                                <div>
                                    <p className="text-sm font-semibold">{invoice.number}</p>
                                    <p className="text-xs text-muted-foreground">Due {formatDate(invoice.dueDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-bold">{formatCurrency(invoice.amount)}</p>
                                <Badge variant={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "destructive" : "info"}>
                                    {invoice.status}
                                </Badge>
                                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
