"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { WORKFLOW_STATUS_MAP, type WorkflowStatusType } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import {
    Zap, Plus, Play, Pause, ArrowRight,
    Mail, Bell, CheckSquare, GitBranch, Clock, Activity,
} from "lucide-react";

type AutomationsTab = "builder" | "logs";
type TriggerType = "created" | "updated" | "status_changed" | "due_date_approaching" | "overdue" | "scheduled";
type ActionType = "send_notification" | "send_email" | "update_field" | "create_task" | "assign_user" | "move_stage";
type LogStatus = "success" | "failed" | "skipped";

interface ExecutionLog {
    id: string;
    automationName: string;
    triggeredAt: string;
    status: LogStatus;
    duration: string;
    entityType: string;
    entityId: string;
    entityName: string;
    actionsRun: string[];
    error?: string;
}

const LOG_STATUS_CONFIG: Record<LogStatus, { label: string; variant: "success" | "destructive" | "ghost" }> = {
    success: { label: "Success", variant: "success" },
    failed: { label: "Failed", variant: "destructive" },
    skipped: { label: "Skipped", variant: "ghost" },
};

const mockLogs: ExecutionLog[] = [
    { id: "l1", automationName: "New Deal → Notify Sales Manager", triggeredAt: "2026-02-25T14:32:00", status: "success", duration: "1.2s", entityType: "deal", entityId: "d-101", entityName: "Samsung Pop-Up Activation", actionsRun: ["Send Notification", "Send Email"] },
    { id: "l2", automationName: "Task Overdue → Escalate to PM", triggeredAt: "2026-02-25T13:15:00", status: "success", duration: "0.8s", entityType: "task", entityId: "t-312", entityName: "Finalize floor plan layout", actionsRun: ["Create Task", "Send Notification"] },
    { id: "l3", automationName: "Invoice Overdue → Send Reminder", triggeredAt: "2026-02-25T09:00:00", status: "failed", duration: "3.1s", entityType: "invoice", entityId: "inv-087", entityName: "INV-2026-0087", actionsRun: ["Send Email"], error: "SMTP connection timeout — recipient server unreachable" },
    { id: "l4", automationName: "Daily Standup Reminder", triggeredAt: "2026-02-25T09:00:00", status: "success", duration: "2.4s", entityType: "project", entityId: "p-005", entityName: "All Active Projects", actionsRun: ["Send Notification"] },
    { id: "l5", automationName: "Proposal Accepted → Create Project", triggeredAt: "2026-02-24T16:42:00", status: "success", duration: "1.8s", entityType: "proposal", entityId: "prop-022", entityName: "PROP-2026-0022 (Red Bull)", actionsRun: ["Create Task", "Assign User"] },
    { id: "l6", automationName: "Budget Threshold → Alert Finance", triggeredAt: "2026-02-24T11:20:00", status: "skipped", duration: "0.3s", entityType: "project", entityId: "p-008", entityName: "Nike Air Max Launch", actionsRun: [], error: "Condition not met — budget at 72% (threshold: 80%)" },
    { id: "l7", automationName: "New Deal → Notify Sales Manager", triggeredAt: "2026-02-24T10:05:00", status: "success", duration: "1.0s", entityType: "deal", entityId: "d-099", entityName: "Adidas Festival Booth", actionsRun: ["Send Notification", "Send Email"] },
    { id: "l8", automationName: "Task Overdue → Escalate to PM", triggeredAt: "2026-02-23T15:30:00", status: "success", duration: "0.9s", entityType: "task", entityId: "t-298", entityName: "Order LED panels", actionsRun: ["Create Task", "Send Notification"] },
    { id: "l9", automationName: "Invoice Overdue → Send Reminder", triggeredAt: "2026-02-23T09:00:00", status: "success", duration: "1.5s", entityType: "invoice", entityId: "inv-081", entityName: "INV-2026-0081", actionsRun: ["Send Email"] },
    { id: "l10", automationName: "Daily Standup Reminder", triggeredAt: "2026-02-23T09:00:00", status: "success", duration: "2.1s", entityType: "project", entityId: "p-005", entityName: "All Active Projects", actionsRun: ["Send Notification"] },
];

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: React.ElementType }> = {
    created: { label: "When Created", icon: Plus },
    updated: { label: "When Updated", icon: Activity },
    status_changed: { label: "Status Changed", icon: GitBranch },
    due_date_approaching: { label: "Due Date Approaching", icon: Clock },
    overdue: { label: "When Overdue", icon: Clock },
    scheduled: { label: "Scheduled", icon: Clock },
};

const ACTION_LABELS: Record<ActionType, { label: string; icon: React.ElementType }> = {
    send_notification: { label: "Send Notification", icon: Bell },
    send_email: { label: "Send Email", icon: Mail },
    update_field: { label: "Update Field", icon: Activity },
    create_task: { label: "Create Task", icon: CheckSquare },
    assign_user: { label: "Assign User", icon: Plus },
    move_stage: { label: "Move Stage", icon: ArrowRight },
};

interface AutomationListItem {
    id: string;
    name: string;
    description: string;
    entityType: string;
    trigger: TriggerType;
    actions: ActionType[];
    status: WorkflowStatusType;
    executionCount: number;
    lastExecuted: string;
    createdBy: string;
}

const mockAutomations: AutomationListItem[] = [
    { id: "1", name: "New Deal → Notify Sales Manager", description: "When a new deal is created, notify the assigned sales manager via email and in-app notification", entityType: "deal", trigger: "created", actions: ["send_notification", "send_email"], status: "active", executionCount: 156, lastExecuted: "2026-02-25", createdBy: "Sarah Chen" },
    { id: "2", name: "Task Overdue → Escalate to PM", description: "When a task becomes overdue, create an escalation task and notify the project manager", entityType: "task", trigger: "overdue", actions: ["create_task", "send_notification"], status: "active", executionCount: 43, lastExecuted: "2026-02-24", createdBy: "System" },
    { id: "3", name: "Proposal Accepted → Create Project", description: "When a proposal is accepted, automatically create a project from the proposal details", entityType: "proposal", trigger: "status_changed", actions: ["create_task", "assign_user"], status: "active", executionCount: 12, lastExecuted: "2026-02-20", createdBy: "Sarah Chen" },
    { id: "4", name: "Invoice Overdue → Send Reminder", description: "When an invoice is overdue by 7 days, automatically send a payment reminder email", entityType: "invoice", trigger: "overdue", actions: ["send_email"], status: "active", executionCount: 28, lastExecuted: "2026-02-23", createdBy: "Finance Team" },
    { id: "5", name: "Budget Threshold → Alert Finance", description: "When project budget reaches 80% utilization, notify finance team", entityType: "project", trigger: "updated", actions: ["send_notification"], status: "paused", executionCount: 8, lastExecuted: "2026-02-10", createdBy: "Finance Team" },
    { id: "6", name: "Daily Standup Reminder", description: "Send daily standup reminder to all active project teams at 9:00 AM", entityType: "project", trigger: "scheduled", actions: ["send_notification"], status: "active", executionCount: 340, lastExecuted: "2026-02-25", createdBy: "System" },
    { id: "7", name: "Contract Expiry Warning", description: "30 days before contract expiry, notify account manager and legal team", entityType: "contract", trigger: "due_date_approaching", actions: ["send_email", "send_notification", "create_task"], status: "draft", executionCount: 0, lastExecuted: "", createdBy: "Legal Team" },
];

function formatDateTime(dateStr: string): string {
    return formatDateTime(dateStr);
}

export default function AutomationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<AutomationsTab>("builder");
    const [logFilter, setLogFilter] = useState<string>("all");

    const filtered = mockAutomations.filter((a) => {
        const matchesSearch =
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.entityType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredLogs = mockLogs.filter((l) => {
        const matchesLogFilter = logFilter === "all" || l.status === logFilter;
        const matchesSearch = !searchQuery || l.automationName.toLowerCase().includes(searchQuery.toLowerCase()) || l.entityName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLogFilter && matchesSearch;
    });

    const totalExecutions = mockAutomations.reduce((sum, a) => sum + a.executionCount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Automation Builder" description="Configure trigger-action automations for workflows, notifications, and business logic">
                <Button><Plus className="mr-2 h-4 w-4" />New Automation</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Automations" value={mockAutomations.length} icon={Zap} />
                <StatCard title="Active" value={mockAutomations.filter(a => a.status === "active").length} icon={Play} />
                <StatCard title="Paused" value={mockAutomations.filter(a => a.status === "paused").length} icon={Pause} />
                <StatCard title="Total Executions" value={totalExecutions} icon={Activity} />
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 border-b border-border">
                {([
                    { id: "builder" as const, label: "Automations", icon: Zap },
                    { id: "logs" as const, label: "Execution Logs", icon: Activity },
                ]).map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                            {tab.id === "logs" && (
                                <span className="ml-1 text-xs bg-secondary rounded-full px-1.5 py-0.5">{mockLogs.length}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Builder Tab */}
            {activeTab === "builder" && (
                <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search automations..." className="flex-1 max-w-sm" />
                        <div className="flex gap-2 flex-wrap">
                            {["all", "active", "paused", "draft", "archived"].map((s) => (
                                <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                                    {s === "all" ? "All" : WORKFLOW_STATUS_MAP[s as WorkflowStatusType]?.label ?? s}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filtered.map((automation, i) => {
                            const statusCfg = WORKFLOW_STATUS_MAP[automation.status];
                            const triggerCfg = TRIGGER_LABELS[automation.trigger];
                            const TriggerIcon = triggerCfg.icon;

                            return (
                                <StaggerItem key={automation.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-md transition-all">
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${automation.status === "active" ? "bg-success/10" : automation.status === "paused" ? "bg-warning/10" : "bg-muted"}`}>
                                                    <Zap className={`h-5 w-5 ${automation.status === "active" ? "text-success" : automation.status === "paused" ? "text-warning" : "text-muted-foreground"}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                                                        <Badge variant="ghost">{automation.entityType}</Badge>
                                                    </div>
                                                    <h3 className="text-sm font-semibold mt-1">{automation.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">{automation.description}</p>

                                                    {/* Trigger → Action Flow */}
                                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                        <div className="flex items-center gap-1 rounded-md bg-info/10 px-2 py-1 text-xs font-medium text-info">
                                                            <TriggerIcon className="h-3 w-3" />
                                                            {triggerCfg.label}
                                                        </div>
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                        {automation.actions.map((action, j) => {
                                                            const actionCfg = ACTION_LABELS[action];
                                                            const ActionIcon = actionCfg.icon;
                                                            return (
                                                                <div key={j} className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground">
                                                                    <ActionIcon className="h-3 w-3" />
                                                                    {actionCfg.label}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 space-y-1">
                                                <p className="text-sm font-bold">{automation.executionCount}</p>
                                                <p className="text-[10px] text-muted-foreground">executions</p>
                                                {automation.lastExecuted && (
                                                    <p className="text-[10px] text-muted-foreground">Last: {formatDate(automation.lastExecuted)}</p>
                                                )}
                                                <div className="flex gap-1 justify-end mt-2">
                                                    {automation.status === "active" ? (
                                                        <Button variant="outline" size="sm"><Pause className="h-3 w-3" /></Button>
                                                    ) : (
                                                        <Button variant="outline" size="sm"><Play className="h-3 w-3" /></Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-1">No automations found</h3>
                                <p className="text-muted-foreground text-center">
                                    {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first automation to streamline workflows"}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
                <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search logs..." className="flex-1 max-w-sm" />
                        <div className="flex gap-2">
                            {["all", "success", "failed", "skipped"].map((s) => (
                                <Button key={s} variant={logFilter === s ? "default" : "outline"} size="sm" onClick={() => setLogFilter(s)}>
                                    {s === "all" ? "All" : LOG_STATUS_CONFIG[s as LogStatus]?.label ?? s}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredLogs.map((log, i) => {
                            const statusCfg = LOG_STATUS_CONFIG[log.status];
                            return (
                                <StaggerItem key={log.id} index={i} stagger="tight">
                                <Card>
                                    <CardContent className="py-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                    log.status === "success" ? "bg-success/10" : log.status === "failed" ? "bg-destructive/10" : "bg-muted"
                                                }`}>
                                                    {log.status === "success" ? (
                                                        <CheckSquare className="h-4 w-4 text-success" />
                                                    ) : log.status === "failed" ? (
                                                        <Zap className="h-4 w-4 text-destructive" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                                                        <Badge variant="ghost">{log.entityType}</Badge>
                                                        <span className="text-[10px] text-muted-foreground">{log.duration}</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold mt-1">{log.automationName}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Entity: <span className="font-medium text-foreground">{log.entityName}</span>
                                                    </p>
                                                    {log.actionsRun.length > 0 && (
                                                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                            <span className="text-[10px] text-muted-foreground">Actions:</span>
                                                            {log.actionsRun.map((action, j) => (
                                                                <span key={j} className="text-[10px] rounded bg-secondary/50 px-1.5 py-0.5 font-medium">{action}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {log.error && (
                                                        <div className={`mt-2 text-xs px-2 py-1.5 rounded ${
                                                            log.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                                                        }`}>
                                                            {log.error}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground">{formatDateTime(log.triggeredAt)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>

                    {filteredLogs.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-1">No execution logs found</h3>
                                <p className="text-muted-foreground text-center">
                                    {searchQuery || logFilter !== "all" ? "Try adjusting your filters" : "Logs will appear here as automations execute"}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
