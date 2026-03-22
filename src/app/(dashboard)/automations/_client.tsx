"use client";

import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_AUTOMATION_CONFIG } from "@/config/create-entity-configs";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { WORKFLOW_STATUS_MAP, type WorkflowStatusType } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import { formatDateTime as formatLocaleDateTime } from "@/lib/formatters/locale";
import {
    Activity,
    ArrowRight,
    Bell,
    CheckSquare,
    Clock,
    GitBranch,
    Mail,
    Pause,
    Play,
    Plus,
    Trash2,
    Zap,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useAutomations } from "@/lib/supabase";
import { useAutomationLogs } from "@/lib/supabase";
import {
    useCreateAutomation,
    useDeleteAutomation,
    useUpdateAutomation,
} from "@/lib/supabase/hooks-automation";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";

type AutomationsTab = "builder" | "logs";
type TriggerType =
    | "created"
    | "updated"
    | "status_changed"
    | "due_date_approaching"
    | "overdue"
    | "scheduled";
type ActionType =
    | "send_notification"
    | "send_email"
    | "update_field"
    | "create_task"
    | "assign_user"
    | "move_stage";
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

const LOG_STATUS_CONFIG: Record<
    LogStatus,
    { label: string; variant: "success" | "destructive" | "ghost" }
> = {
    success: { label: "Success", variant: "success" },
    failed: { label: "Failed", variant: "destructive" },
    skipped: { label: "Skipped", variant: "ghost" },
};

function deriveLogStatus(row: Record<string, unknown>): LogStatus {
    if (row.success === true) return "success";
    if (row.success === false) return "failed";
    return "skipped";
}

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

function formatDateTime(dateStr: string): string {
    return formatLocaleDateTime(dateStr);
}

const AUTOMATIONS_TAB_VALUES = ["builder", "logs"] as const;

export function AutomationsPageClient() {
    const createAutomation = useCreateAutomation();
    const updateAutomation = useUpdateAutomation();
    const deleteAutomation = useDeleteAutomation();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useQueryTabState<AutomationsTab>({
        key: "tab",
        defaultValue: "builder",
        validValues: AUTOMATIONS_TAB_VALUES,
    });
    const [logFilter, setLogFilter] = useState<string>("all");

    const { data: sbAutomations, isLoading } = useAutomations();
    const { data: sbLogs } = useAutomationLogs();

    const automations: AutomationListItem[] = (sbAutomations ?? []).map(
        (a: Record<string, unknown>) => ({
            id: (a.id as string) ?? "",
            name: (a.name as string) ?? "",
            description: (a.description as string) ?? "",
            entityType: (a.entity_type as string) ?? "",
            trigger: ((a.trigger_type as string) ?? "created") as TriggerType,
            actions: ((a.actions as string[]) ?? []) as ActionType[],
            status: ((a.status as string) ?? "draft") as WorkflowStatusType,
            executionCount: (a.execution_count as number) ?? 0,
            lastExecuted: (a.last_executed_at as string) ?? "",
            createdBy: (a.created_by as string) ?? "",
        })
    );

    const filtered = automations.filter((a) => {
        const matchesSearch =
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.entityType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const automationMap = new Map(automations.map((a) => [a.id, a]));
    const logs: ExecutionLog[] = (sbLogs ?? []).map((row: Record<string, unknown>) => {
        const execData = (row.execution_data ?? {}) as Record<string, unknown>;
        const parent = automationMap.get(row.automation_id as string);
        return {
            id: row.id as string,
            automationName: parent?.name ?? "Unknown Automation",
            triggeredAt: (row.triggered_at as string) ?? "",
            status: deriveLogStatus(row),
            duration: (execData.duration as string) ?? "",
            entityType: parent?.entityType ?? "",
            entityId: (row.entity_id as string) ?? "",
            entityName: (execData.entity_name as string) ?? (row.entity_id as string) ?? "",
            actionsRun: (execData.actions_run as string[]) ?? [],
            error: (row.error_message as string) ?? undefined,
        };
    });

    const filteredLogs = logs.filter((l) => {
        const matchesLogFilter = logFilter === "all" || l.status === logFilter;
        const matchesSearch =
            !searchQuery ||
            l.automationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.entityName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLogFilter && matchesSearch;
    });

    const totalExecutions = automations.reduce((sum, a) => sum + a.executionCount, 0);

    const contentSlot = (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard title="Total Automations" value={automations.length} icon={Zap} />
                <StatCard
                    title="Active"
                    value={automations.filter((a) => a.status === "active").length}
                    icon={Play}
                />
                <StatCard
                    title="Paused"
                    value={automations.filter((a) => a.status === "paused").length}
                    icon={Pause}
                />
                <StatCard title="Total Executions" value={totalExecutions} icon={Activity} />
            </div>

            <TabBar
                idPrefix="automations-tabs"
                ariaLabel="Automation sections"
                items={[
                    { id: "builder", label: "Automations", icon: <Zap className="h-4 w-4" /> },
                    {
                        id: "logs",
                        label: "Execution Logs",
                        icon: <Activity className="h-4 w-4" />,
                        count: logs.length,
                    },
                ]}
                value={activeTab}
                onValueChange={(tabId) => setActiveTab(tabId as AutomationsTab)}
            />

            {/* Builder Tab */}
            <TabPanel
                value="builder"
                activeValue={activeTab}
                idPrefix="automations-tabs"
                className="mt-0"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search automations..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {["all", "active", "paused", "draft", "archived"].map((s) => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === "all"
                                    ? "All"
                                    : (WORKFLOW_STATUS_MAP[s as WorkflowStatusType]?.label ?? s)}
                            </Button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={Zap}
                        title="No automations found"
                        description={
                            searchQuery || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Create your first automation to streamline workflows"
                        }
                        action={
                            !searchQuery && statusFilter === "all"
                                ? { label: "New Automation", onClick: openCreate }
                                : undefined
                        }
                    />
                ) : (
                    <div className="density-gap-section">
                        {filtered.map((automation, i) => {
                            const statusCfg = WORKFLOW_STATUS_MAP[automation.status];
                            const triggerCfg = TRIGGER_LABELS[automation.trigger];
                            const TriggerIcon = triggerCfg.icon;

                            return (
                                <StaggerItem key={automation.id} index={i} stagger="relaxed">
                                    <Card
                                        className="hover:shadow-md transition-all"
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Automation: ${automation.name}, status: ${statusCfg?.label ?? automation.status}`}
                                        onKeyDown={(e: React.KeyboardEvent) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                void automation.id;
                                            }
                                        }}
                                    >
                                        <CardContent className="py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div
                                                        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${automation.status === "active" ? "bg-success/10" : automation.status === "paused" ? "bg-warning/10" : "bg-muted"}`}
                                                    >
                                                        <Zap
                                                            className={`h-5 w-5 ${automation.status === "active" ? "text-success" : automation.status === "paused" ? "text-warning" : "text-muted-foreground"}`}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant={statusCfg?.variant}>
                                                                {statusCfg?.label}
                                                            </Badge>
                                                            <Badge variant="ghost">
                                                                {automation.entityType}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-sm font-semibold mt-1">
                                                            {automation.name}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {automation.description}
                                                        </p>

                                                        {/* Trigger → Action Flow */}
                                                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                            <div className="flex items-center gap-1 rounded-md bg-info/10 px-2 py-1 text-xs font-medium text-info">
                                                                <TriggerIcon className="h-3 w-3" />
                                                                {triggerCfg.label}
                                                            </div>
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                            {automation.actions.map((action, j) => {
                                                                const actionCfg =
                                                                    ACTION_LABELS[action];
                                                                const ActionIcon = actionCfg.icon;
                                                                return (
                                                                    <div
                                                                        key={j}
                                                                        className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground"
                                                                    >
                                                                        <ActionIcon className="h-3 w-3" />
                                                                        {actionCfg.label}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 space-y-1">
                                                    <p className="text-sm font-bold">
                                                        {automation.executionCount}
                                                    </p>
                                                    <p className="density-caption text-muted-foreground">
                                                        executions
                                                    </p>
                                                    {automation.lastExecuted && (
                                                        <p className="density-caption text-muted-foreground">
                                                            Last:{" "}
                                                            {formatDate(automation.lastExecuted)}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-1 justify-end mt-2">
                                                        {automation.status === "active" ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                aria-label={`Pause automation: ${automation.name}`}
                                                                disabled={
                                                                    updateAutomation.isPending
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateAutomation.mutate({
                                                                        id: automation.id,
                                                                        status: "paused",
                                                                    } as Parameters<
                                                                        typeof updateAutomation.mutate
                                                                    >[0]);
                                                                }}
                                                            >
                                                                <Pause className="h-3 w-3" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                aria-label={`Enable automation: ${automation.name}`}
                                                                disabled={
                                                                    updateAutomation.isPending
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateAutomation.mutate({
                                                                        id: automation.id,
                                                                        status: "active",
                                                                    } as Parameters<
                                                                        typeof updateAutomation.mutate
                                                                    >[0]);
                                                                }}
                                                            >
                                                                <Play className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            aria-label={`Delete automation: ${automation.name}`}
                                                            disabled={deleteAutomation.isPending}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    window.confirm(
                                                                        `Delete automation "${automation.name}"? This cannot be undone.`
                                                                    )
                                                                ) {
                                                                    deleteAutomation.mutate(
                                                                        automation.id
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>
                )}
            </TabPanel>

            {/* Logs Tab */}
            <TabPanel
                value="logs"
                activeValue={activeTab}
                idPrefix="automations-tabs"
                className="mt-0"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search logs..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2">
                        {["all", "success", "failed", "skipped"].map((s) => (
                            <Button
                                key={s}
                                variant={logFilter === s ? "default" : "outline"}
                                size="sm"
                                onClick={() => setLogFilter(s)}
                            >
                                {s === "all"
                                    ? "All"
                                    : (LOG_STATUS_CONFIG[s as LogStatus]?.label ?? s)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-lg border border-dashed border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning">
                    <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>
                        Execution logs shown below are placeholder data. Live log streaming will be
                        available once the automation engine is wired.
                    </span>
                </div>
                {filteredLogs.length === 0 ? (
                    <EmptyState
                        icon={Activity}
                        title="No execution logs found"
                        description={
                            searchQuery || logFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Logs will appear here as automations execute"
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredLogs.map((log, i) => {
                            const statusCfg = LOG_STATUS_CONFIG[log.status];
                            return (
                                <StaggerItem key={log.id} index={i} stagger="tight">
                                    <Card>
                                        <CardContent className="py-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div
                                                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                            log.status === "success"
                                                                ? "bg-success/10"
                                                                : log.status === "failed"
                                                                  ? "bg-destructive/10"
                                                                  : "bg-muted"
                                                        }`}
                                                    >
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
                                                            <Badge variant={statusCfg.variant}>
                                                                {statusCfg.label}
                                                            </Badge>
                                                            <Badge variant="ghost">
                                                                {log.entityType}
                                                            </Badge>
                                                            <span className="density-caption text-muted-foreground">
                                                                {log.duration}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-sm font-semibold mt-1">
                                                            {log.automationName}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Entity:{" "}
                                                            <span className="font-medium text-foreground">
                                                                {log.entityName}
                                                            </span>
                                                        </p>
                                                        {log.actionsRun.length > 0 && (
                                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                                <span className="density-caption text-muted-foreground">
                                                                    Actions:
                                                                </span>
                                                                {log.actionsRun.map((action, j) => (
                                                                    <span
                                                                        key={j}
                                                                        className="density-caption rounded bg-secondary/50 px-1.5 py-0.5 font-medium"
                                                                    >
                                                                        {action}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {log.error && (
                                                            <div
                                                                className={`mt-2 text-xs px-2 py-1.5 rounded ${
                                                                    log.status === "failed"
                                                                        ? "bg-destructive/10 text-destructive"
                                                                        : "bg-muted text-muted-foreground"
                                                                }`}
                                                            >
                                                                {log.error}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(log.triggeredAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>
                )}
            </TabPanel>
            <CreateEntityDialog
                config={CREATE_AUTOMATION_CONFIG}
                open={createOpen}
                onClose={closeCreate}
                onSubmit={async (values) => {
                    await createAutomation.mutateAsync(
                        values as Parameters<typeof createAutomation.mutateAsync>[0]
                    );
                }}
            />
        </>
    );

    const config: DashboardPageConfig = {
        resource: "automations",
        action: "read",
        title: "Automation Builder",
        description:
            "Configure trigger-action automations for workflows, notifications, and business logic",
        headerActions: (
            <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Automation
            </Button>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
