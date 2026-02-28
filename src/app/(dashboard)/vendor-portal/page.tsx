"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Store, CheckSquare, FileText, MapPin, Calendar,
    Clock, CheckCircle2, Upload, ClipboardList, Truck,
    DollarSign, ShieldCheck, MessageSquare, Send,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

interface VendorTask {
    id: string;
    title: string;
    projectName: string;
    dueDate: string;
    status: "todo" | "in_progress" | "complete" | "overdue";
    priority: "high" | "medium" | "low";
}

interface VendorDocument {
    id: string;
    name: string;
    type: string;
    status: "pending" | "submitted" | "approved" | "rejected";
    dueDate: string;
}

interface VendorSchedule {
    id: string;
    date: string;
    location: string;
    callTime: string;
    wrapTime: string;
    projectName: string;
}

interface VendorWorkOrder {
    id: string;
    number: string;
    title: string;
    projectName: string;
    status: string;
    scheduledStart: string;
    estimatedCost: number;
}

interface VendorInvoiceSubmission {
    id: string;
    number: string;
    workOrderRef: string;
    amount: number;
    status: "draft" | "submitted" | "approved" | "paid" | "disputed";
    submittedDate: string;
}

const mockTasks: VendorTask[] = [
    { id: "1", title: "Deliver LED panels to Barclays Center", projectName: "Nike Air Max Launch", dueDate: "2026-03-13", status: "in_progress", priority: "high" },
    { id: "2", title: "Install rigging points — Stage Left", projectName: "Nike Air Max Launch", dueDate: "2026-03-14", status: "todo", priority: "high" },
    { id: "3", title: "Submit insurance certificate renewal", projectName: "General", dueDate: "2026-03-01", status: "overdue", priority: "medium" },
    { id: "4", title: "AV equipment check-in", projectName: "Red Bull Festival Activation", dueDate: "2026-04-08", status: "todo", priority: "medium" },
    { id: "5", title: "Generator delivery — Indio site", projectName: "Coachella Brand Experience", dueDate: "2026-03-28", status: "todo", priority: "low" },
];

const mockDocuments: VendorDocument[] = [
    { id: "1", name: "Certificate of Insurance 2026", type: "insurance", status: "pending", dueDate: "2026-03-01" },
    { id: "2", name: "W-9 Tax Form", type: "tax", status: "approved", dueDate: "2026-01-15" },
    { id: "3", name: "Equipment Inventory List", type: "inventory", status: "submitted", dueDate: "2026-03-10" },
    { id: "4", name: "Safety Certification", type: "safety", status: "approved", dueDate: "2026-02-01" },
];

const mockSchedule: VendorSchedule[] = [
    { id: "1", date: "2026-03-13", location: "Barclays Center, Brooklyn", callTime: "06:00", wrapTime: "14:00", projectName: "Nike Air Max Launch" },
    { id: "2", date: "2026-03-14", location: "Barclays Center, Brooklyn", callTime: "07:00", wrapTime: "16:00", projectName: "Nike Air Max Launch" },
    { id: "3", date: "2026-04-08", location: "Randalls Island Park", callTime: "05:00", wrapTime: "18:00", projectName: "Red Bull Festival Activation" },
];

const mockWorkOrders: VendorWorkOrder[] = [
    { id: "wo1", number: "WO-2026-001", title: "Stage Steel Frame Fabrication", projectName: "Coachella Main Stage 2026", status: "in_progress", scheduledStart: "2026-02-15", estimatedCost: 185000 },
    { id: "wo4", number: "WO-2026-004", title: "Custom Fixture Fabrication", projectName: "Glossier Pop-Up NYC", status: "completed", scheduledStart: "2026-02-10", estimatedCost: 28000 },
    { id: "wo5", number: "WO-2026-005", title: "Electrical & Lighting Install", projectName: "Glossier Pop-Up NYC", status: "accepted", scheduledStart: "2026-03-01", estimatedCost: 14500 },
];

const mockInvoiceSubmissions: VendorInvoiceSubmission[] = [
    { id: "vi1", number: "VINV-001", workOrderRef: "WO-2026-004", amount: 26500, status: "approved", submittedDate: "2026-02-28" },
    { id: "vi2", number: "VINV-002", workOrderRef: "WO-2026-001", amount: 92500, status: "submitted", submittedDate: "2026-03-01" },
    { id: "vi3", number: "VINV-003", workOrderRef: "WO-2026-005", amount: 14500, status: "draft", submittedDate: "" },
];

const TASK_STATUS_COLORS: Record<string, string> = {
    todo: "bg-muted text-muted-foreground",
    in_progress: "bg-info/10 text-info",
    complete: "bg-success/10 text-success",
    overdue: "bg-destructive/10 text-destructive",
};

const PRIORITY_BADGE: Record<string, "destructive" | "warning" | "ghost"> = {
    high: "destructive",
    medium: "warning",
    low: "ghost",
};

const WO_STATUS_BADGE: Record<string, "default" | "info" | "warning" | "success" | "destructive"> = {
    in_progress: "warning",
    completed: "success",
    accepted: "info",
    scheduled: "info",
    assigned: "info",
};

const INV_STATUS_BADGE: Record<string, "default" | "info" | "warning" | "success" | "destructive"> = {
    draft: "default",
    submitted: "warning",
    approved: "success",
    paid: "success",
    disputed: "destructive",
};

export default function VendorPortalPage() {
    const activeTasks = mockTasks.filter(t => t.status !== "complete").length;
    const overdueTasks = mockTasks.filter(t => t.status === "overdue").length;
    const pendingDocs = mockDocuments.filter(d => d.status === "pending").length;
    const totalInvoiced = mockInvoiceSubmissions.filter(i => i.status !== "draft").reduce((s, i) => s + i.amount, 0);

    return (
        <PermissionGate resource="vendor_portal" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Vendor Portal" description="Self-service portal: work orders, invoicing, compliance documents, and scheduling">
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline"><MessageSquare className="h-4 w-4" /> Messages</Button>
                    <Badge variant="warning" className="text-sm px-3 py-1">
                        <Store className="mr-2 h-3.5 w-3.5" />Vendor View
                    </Badge>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Active Tasks" value={activeTasks} icon={CheckSquare} />
                <StatCard title="Overdue" value={overdueTasks} icon={Clock} />
                <StatCard title="Pending Docs" value={pendingDocs} icon={FileText} />
                <StatCard title="Work Orders" value={mockWorkOrders.length} icon={ClipboardList} />
                <StatCard title="Total Invoiced" value={formatCurrency(totalInvoiced)} icon={DollarSign} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Work Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />Your Work Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockWorkOrders.map((wo) => (
                            <div key={wo.id} className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-muted-foreground">{wo.number}</span>
                                            <Badge variant={WO_STATUS_BADGE[wo.status] || "default"} className="text-[10px]">{wo.status.replace("_", " ")}</Badge>
                                        </div>
                                        <h4 className="text-sm font-semibold mt-1">{wo.title}</h4>
                                    </div>
                                    <span className="text-sm font-bold">{formatCurrency(wo.estimatedCost)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{wo.projectName}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(wo.scheduledStart)}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Invoice Submissions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />Invoice Submissions
                            </CardTitle>
                            <Button size="sm"><Send className="h-3 w-3" /> Submit Invoice</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockInvoiceSubmissions.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{inv.number}</span>
                                        <Badge variant={INV_STATUS_BADGE[inv.status] || "default"} className="text-[10px]">{inv.status}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Ref: {inv.workOrderRef}
                                        {inv.submittedDate && ` · Submitted ${formatDate(inv.submittedDate)}`}
                                    </p>
                                </div>
                                <span className="text-sm font-bold">{formatCurrency(inv.amount)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Tasks */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />Assigned Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockTasks.map((task) => (
                        <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg ${TASK_STATUS_COLORS[task.status]} transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${task.status === "complete" ? "bg-success/20" : task.status === "overdue" ? "bg-destructive/20" : "bg-primary/10"}`}>
                                    {task.status === "complete" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <CheckSquare className="h-4 w-4 text-primary" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold">{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                        <span>{task.projectName}</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due {formatDate(task.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                                <Badge variant={task.status === "overdue" ? "destructive" : task.status === "complete" ? "success" : "ghost"}>
                                    {task.status.replace("_", " ")}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />Upcoming Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockSchedule.map((shift) => (
                        <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Truck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold">{shift.projectName}</h4>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(shift.date)}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{shift.callTime} — {shift.wrapTime}</span>
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{shift.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Compliance Documents */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />Compliance Documents
                        </CardTitle>
                        <Button size="sm" variant="outline"><Upload className="h-3 w-3" /> Upload Document</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                                <FileText className={`h-4 w-4 ${doc.status === "approved" ? "text-success" : doc.status === "pending" ? "text-warning" : "text-muted-foreground"}`} />
                                <div>
                                    <p className="text-sm font-semibold">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">{doc.type} · Due {formatDate(doc.dueDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={doc.status === "approved" ? "success" : doc.status === "pending" ? "warning" : doc.status === "rejected" ? "destructive" : "info"}>
                                    {doc.status}
                                </Badge>
                                {doc.status === "pending" && (
                                    <Button size="sm"><Upload className="mr-2 h-3 w-3" />Upload</Button>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
        </PermissionGate>
    );
}
