"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { PageShell } from "@/components/layouts/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Calendar,
    CheckCircle2,
    CheckSquare,
    ClipboardList,
    Clock,
    DollarSign,
    FileText,
    Inbox,
    MessageSquare,
    Send,
    ShieldCheck,
    Store,
    Truck,
    Upload,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { useInvoices, useTasks } from "@/lib/supabase";
import { useVendorComplianceDocuments, useWorkOrders } from "@/lib/supabase";

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

const WO_STATUS_BADGE: Record<string, "default" | "info" | "warning" | "success" | "destructive"> =
    {
        in_progress: "warning",
        completed: "success",
        accepted: "info",
        scheduled: "info",
        assigned: "info",
    };

const INV_STATUS_BADGE: Record<string, "default" | "info" | "warning" | "success" | "destructive"> =
    {
        draft: "default",
        submitted: "warning",
        approved: "success",
        paid: "success",
        disputed: "destructive",
    };

function EmptyRow({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{message}</p>
        </div>
    );
}

export default function VendorPortalPage() {
    const { data: sbTasks, isLoading: tasksLoading } = useTasks();
    const { data: sbWorkOrders, isLoading: woLoading } = useWorkOrders();
    const { data: sbDocs, isLoading: docsLoading } = useVendorComplianceDocuments();
    const { data: sbInvoices, isLoading: invLoading } = useInvoices();

    const isLoading = tasksLoading || woLoading || docsLoading || invLoading;

    if (isLoading) {
        return <LoadingState />;
    }

    type TaskView = {
        id: string;
        title: string;
        projectName: string;
        dueDate: string;
        status: string;
        priority: string;
    };
    const tasks: TaskView[] = (sbTasks ?? []).map((t) => ({
        id: t.id,
        title: t.title ?? "",
        projectName: (t as unknown as { projects?: { name: string } }).projects?.name ?? "",
        dueDate: t.due_date ?? "",
        status: (t.status ?? "todo") as string,
        priority: (t.priority ?? "medium") as string,
    }));

    type WOView = {
        id: string;
        number: string;
        title: string;
        projectName: string;
        status: string;
        scheduledStart: string;
        estimatedCost: number;
    };
    const workOrders: WOView[] = (sbWorkOrders ?? []).map((wo: Record<string, unknown>) => ({
        id: wo.id as string,
        number: (wo.number as string) ?? "",
        title: (wo.title as string) ?? "",
        projectName: (wo as unknown as { projects?: { name: string } }).projects?.name ?? "",
        status: (wo.status as string) ?? "draft",
        scheduledStart: (wo.scheduled_start as string) ?? "",
        estimatedCost: (wo.estimated_cost as number) ?? 0,
    }));

    type DocView = { id: string; name: string; type: string; status: string; dueDate: string };
    const docs: DocView[] = (sbDocs ?? []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: (d.doc_name as string) ?? "",
        type: (d.doc_type as string) ?? "",
        status: (d.status as string) ?? "pending_review",
        dueDate: (d.expiry_date as string) ?? "",
    }));

    type InvView = {
        id: string;
        number: string;
        workOrderRef: string;
        amount: number;
        status: string;
        submittedDate: string;
    };
    const invoices: InvView[] = (sbInvoices ?? []).map((inv) => ({
        id: inv.id,
        number: `INV-${inv.id.slice(0, 8).toUpperCase()}`,
        workOrderRef: inv.purchase_order_id ? "PO" : "",
        amount: Number(inv.amount ?? 0),
        status: (inv.status ?? "draft") as string,
        submittedDate: inv.invoice_date ?? "",
    }));

    type WorkOrderView = (typeof workOrders)[number];
    const schedule: WorkOrderView[] = workOrders
        .filter((wo: WorkOrderView) => wo.scheduledStart)
        .sort((a: WorkOrderView, b: WorkOrderView) =>
            a.scheduledStart.localeCompare(b.scheduledStart)
        );

    const activeTasks = tasks.filter((t) => t.status !== "complete" && t.status !== "done").length;
    const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
    const pendingDocs = docs.filter((d) => d.status === "pending_review").length;
    const totalInvoiced = invoices
        .filter((i) => i.status !== "draft")
        .reduce((s, i) => s + i.amount, 0);

    return (
        <PermissionGate resource="vendor_portal" action="read">
            <PageShell
                title="Vendor Portal"
                description="Self-service portal: work orders, invoicing, compliance documents, and scheduling"
                actions={
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" /> Messages
                        </Button>
                        <Badge variant="warning" className="text-sm px-3 py-1">
                            <Store className="mr-2 h-3.5 w-3.5" />
                            Vendor View
                        </Badge>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Active Tasks" value={activeTasks} icon={CheckSquare} />
                    <StatCard title="Overdue" value={overdueTasks} icon={Clock} />
                    <StatCard title="Pending Docs" value={pendingDocs} icon={FileText} />
                    <StatCard title="Work Orders" value={workOrders.length} icon={ClipboardList} />
                    <StatCard
                        title="Total Invoiced"
                        value={formatCurrency(totalInvoiced)}
                        icon={DollarSign}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Work Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Your Work Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {workOrders.length === 0 && <EmptyRow message="No work orders found" />}
                            {workOrders.map((wo) => (
                                <div
                                    key={wo.id}
                                    className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                    {wo.number}
                                                </span>
                                                <Badge
                                                    variant={
                                                        WO_STATUS_BADGE[wo.status] || "default"
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {wo.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <h4 className="text-sm font-semibold mt-1">
                                                {wo.title}
                                            </h4>
                                        </div>
                                        <span className="text-sm font-bold">
                                            {formatCurrency(wo.estimatedCost)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{wo.projectName}</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(wo.scheduledStart)}
                                        </span>
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
                                    <DollarSign className="h-4 w-4" />
                                    Invoice Submissions
                                </CardTitle>
                                <Button size="sm">
                                    <Send className="h-3 w-3" /> Submit Invoice
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {invoices.length === 0 && <EmptyRow message="No invoices found" />}
                            {invoices.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {inv.number}
                                            </span>
                                            <Badge
                                                variant={INV_STATUS_BADGE[inv.status] || "default"}
                                                className="text-[10px]"
                                            >
                                                {inv.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {inv.workOrderRef && `Ref: ${inv.workOrderRef}`}
                                            {inv.submittedDate &&
                                                ` · Submitted ${formatDate(inv.submittedDate)}`}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold">
                                        {formatCurrency(inv.amount)}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            Assigned Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tasks.length === 0 && <EmptyRow message="No tasks assigned" />}
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${TASK_STATUS_COLORS[task.status] ?? ""} transition-colors`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${task.status === "complete" || task.status === "done" ? "bg-success/20" : task.status === "overdue" ? "bg-destructive/20" : "bg-primary/10"}`}
                                    >
                                        {task.status === "complete" || task.status === "done" ? (
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                        ) : (
                                            <CheckSquare className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                            <span>{task.projectName}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Due {formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={PRIORITY_BADGE[task.priority] ?? "ghost"}>
                                        {task.priority}
                                    </Badge>
                                    <Badge
                                        variant={
                                            task.status === "overdue"
                                                ? "destructive"
                                                : task.status === "complete" ||
                                                    task.status === "done"
                                                  ? "success"
                                                  : "ghost"
                                        }
                                    >
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
                            <Calendar className="h-4 w-4" />
                            Upcoming Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {schedule.length === 0 && <EmptyRow message="No upcoming schedule" />}
                        {schedule.map((shift) => (
                            <div
                                key={shift.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">
                                            {shift.projectName}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(shift.scheduledStart)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ClipboardList className="h-3 w-3" />
                                                {shift.number}
                                            </span>
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
                                <ShieldCheck className="h-4 w-4" />
                                Compliance Documents
                            </CardTitle>
                            <Button size="sm" variant="outline">
                                <Upload className="h-3 w-3" /> Upload Document
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {docs.length === 0 && <EmptyRow message="No compliance documents" />}
                        {docs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText
                                        className={`h-4 w-4 ${doc.status === "approved" ? "text-success" : doc.status === "pending_review" ? "text-warning" : "text-muted-foreground"}`}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {doc.type}{" "}
                                            {doc.dueDate && `· Expires ${formatDate(doc.dueDate)}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            doc.status === "approved"
                                                ? "success"
                                                : doc.status === "pending_review"
                                                  ? "warning"
                                                  : doc.status === "rejected"
                                                    ? "destructive"
                                                    : "info"
                                        }
                                    >
                                        {doc.status.replace("_", " ")}
                                    </Badge>
                                    {doc.status === "pending_review" && (
                                        <Button size="sm">
                                            <Upload className="mr-2 h-3 w-3" />
                                            Upload
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </PageShell>
        </PermissionGate>
    );
}
