"use client";

import { useCallback, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { DetailPageShell } from "@/components/shells";
import { useAutomations } from "@/lib/supabase";
import { useAutomationLogs } from "@/lib/supabase";
import { useAutomationWithRules } from "@/lib/supabase/hooks-automation";
import { WORKFLOW_STATUS_MAP, type WorkflowStatusType } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import { COMMON_STRINGS } from "@/lib/i18n/common-strings";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Activity,
    ArrowDown,
    ArrowRight,
    Bell,
    CheckSquare,
    Clock,
    GitBranch,
    Mail,
    MessageSquare,
    Play,
    Plus,
    Save,
    Send,
    Trash2,
    Webhook as WebhookIcon,
    Zap,
} from "lucide-react";

type TriggerType =
    | "created"
    | "updated"
    | "status_changed"
    | "assigned"
    | "due_date_approaching"
    | "overdue"
    | "scheduled"
    | "field_changed";
type ActionType =
    | "send_notification"
    | "send_email"
    | "update_field"
    | "create_task"
    | "assign_user"
    | "move_stage"
    | "webhook"
    | "slack_message"
    | "add_comment";

interface RuleBlock {
    id: string;
    trigger_type: TriggerType;
    conditions: Array<{ field: string; operator: string; value: string }>;
    action_type: ActionType;
    action_config: Record<string, string>;
}

const TRIGGER_OPTIONS: Array<{ value: TriggerType; label: string; icon: React.ElementType }> = [
    { value: "created", label: "When Created", icon: Plus },
    { value: "updated", label: "When Updated", icon: Activity },
    { value: "status_changed", label: "Status Changed", icon: GitBranch },
    { value: "assigned", label: "When Assigned", icon: CheckSquare },
    { value: "due_date_approaching", label: "Due Date Approaching", icon: Clock },
    { value: "overdue", label: "When Overdue", icon: Clock },
    { value: "scheduled", label: "On Schedule", icon: Clock },
    { value: "field_changed", label: "Field Changed", icon: Activity },
];

const ACTION_OPTIONS: Array<{ value: ActionType; label: string; icon: React.ElementType }> = [
    { value: "send_notification", label: "Send Notification", icon: Bell },
    { value: "send_email", label: "Send Email", icon: Mail },
    { value: "update_field", label: "Update Field", icon: Activity },
    { value: "create_task", label: "Create Task", icon: CheckSquare },
    { value: "assign_user", label: "Assign User", icon: Plus },
    { value: "move_stage", label: "Move Stage", icon: ArrowRight },
    { value: "webhook", label: "Outbound Webhook", icon: WebhookIcon },
    { value: "slack_message", label: "Slack Message", icon: MessageSquare },
    { value: "add_comment", label: "Add Comment", icon: Send },
];

const CONDITION_OPERATORS = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
    { value: "is_empty", label: "Is Empty" },
    { value: "is_not_empty", label: "Is Not Empty" },
];

export function AutomationDetailPageClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    // Performance: Skip all data fetches for invalid UUIDs
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const { data: allAutomations, isLoading: isListLoading } = useAutomations(
        isValidUuid ? undefined : { _enabled: false }
    );
    const { data: automationDetail, isLoading: isDetailLoading } = useAutomationWithRules(
        isValidUuid ? id : undefined
    );
    const { data: logs } = useAutomationLogs(isValidUuid ? id : undefined);

    const isLoading = isValidUuid ? isListLoading || isDetailLoading : false;
    const automation = automationDetail
        ? (automationDetail as Record<string, unknown>)
        : ((allAutomations ?? []).find((a: Record<string, unknown>) => a.id === id) as
              | Record<string, unknown>
              | undefined);

    const [rules, setRules] = useState<RuleBlock[]>([
        {
            id: crypto.randomUUID(),
            trigger_type: "created",
            conditions: [],
            action_type: "send_notification",
            action_config: {},
        },
    ]);
    const [isDryRun, setIsDryRun] = useState(false);

    const addRule = useCallback(() => {
        setRules((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                trigger_type: "created",
                conditions: [],
                action_type: "send_notification",
                action_config: {},
            },
        ]);
    }, []);

    const removeRule = useCallback((ruleId: string) => {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
    }, []);

    const updateRule = useCallback((ruleId: string, updates: Partial<RuleBlock>) => {
        setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
    }, []);

    const addCondition = useCallback((ruleId: string) => {
        setRules((prev) =>
            prev.map((r) =>
                r.id === ruleId
                    ? {
                          ...r,
                          conditions: [
                              ...r.conditions,
                              { field: "", operator: "equals", value: "" },
                          ],
                      }
                    : r
            )
        );
    }, []);

    const removeCondition = useCallback((ruleId: string, condIndex: number) => {
        setRules((prev) =>
            prev.map((r) =>
                r.id === ruleId
                    ? { ...r, conditions: r.conditions.filter((_, i) => i !== condIndex) }
                    : r
            )
        );
    }, []);

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    const handleSave = async () => {
        setSaveStatus("saving");
        try {
            const res = await fetch(`/api/automations/execute`, {
                method: "POST",
                headers: csrfHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({
                    automation_id: id,
                    rules: rules.map((r) => ({
                        trigger_type: r.trigger_type,
                        conditions: r.conditions,
                        action_type: r.action_type,
                        action_config: r.action_config,
                    })),
                    dry_run: isDryRun,
                }),
            });
            if (!res.ok) {
                setSaveStatus("error");
                return;
            }
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const name = (automation?.name as string) || "Untitled Automation";
    const status = ((automation?.status as string) || "draft") as WorkflowStatusType;
    const statusCfg = WORKFLOW_STATUS_MAP[status];
    const entityType = (automation?.entity_type as string) || "";
    const logEntries = (logs ?? []) as Record<string, unknown>[];

    const config: DetailPageConfig = {
        entityKey: "automation",
        titleFn: () => name,
        subtitleFn: () => `Automation rule builder for ${entityType} entities`,
        statusFn: () => statusCfg?.label ?? status,
        icon: Zap,
        backHref: "/automations",
        backLabel: "Automations",
        fields: [],
        chatter: false,
        tabs: [
            {
                id: "logs",
                label: "Execution Logs",
                icon: Activity,
                count: logEntries.length,
                content:
                    logEntries.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                No execution logs yet.
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Recent Execution Logs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {logEntries.slice(0, 10).map((log, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between text-xs border-b pb-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        log.success ? "success" : "destructive"
                                                    }
                                                >
                                                    {log.success ? "Success" : "Failed"}
                                                </Badge>
                                                <span className="text-muted-foreground">
                                                    {String(log.entity_id ?? "").slice(0, 8)}...
                                                </span>
                                            </div>
                                            <span className="text-muted-foreground">
                                                {log.triggered_at
                                                    ? formatDate(log.triggered_at as string)
                                                    : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ),
            },
        ],
        overviewSlot: (
            <div className="density-gap-page">
                {isDryRun && (
                    <div className="flex items-center gap-2 rounded-lg border border-info/40 bg-info/5 px-4 py-3 text-sm text-info">
                        <Activity className="h-4 w-4 shrink-0" />
                        <span>
                            Dry-run mode is active. Rules will be validated against recent records
                            but no actions will be executed.
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                    <Badge variant={statusCfg?.variant}>{statusCfg?.label ?? status}</Badge>
                    <span className="text-muted-foreground">
                        Entity: <strong>{entityType}</strong>
                    </span>
                    <span className="text-muted-foreground">
                        Rules: <strong>{rules.length}</strong>
                    </span>
                </div>

                {/* Rule Builder */}
                <div className="density-gap-page">
                    {rules.map((rule, ruleIndex) => (
                        <Card key={rule.id} className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">
                                        Rule {ruleIndex + 1}
                                    </CardTitle>
                                    {rules.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeRule(rule.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="density-gap-section">
                                {/* Trigger */}
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                                        WHEN (Trigger)
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {TRIGGER_OPTIONS.map((opt) => {
                                            const Icon = opt.icon;
                                            return (
                                                <Button
                                                    key={opt.value}
                                                    variant={
                                                        rule.trigger_type === opt.value
                                                            ? "outline"
                                                            : "ghost"
                                                    }
                                                    className={`h-auto gap-2 px-3 py-2 text-xs font-medium ${
                                                        rule.trigger_type === opt.value
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        updateRule(rule.id, {
                                                            trigger_type: opt.value,
                                                        })
                                                    }
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {opt.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Conditions */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            IF (Conditions) — optional
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addCondition(rule.id)}
                                        >
                                            <Plus className="mr-1 h-3 w-3" /> Add Condition
                                        </Button>
                                    </div>
                                    {rule.conditions.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            No conditions — rule will trigger for all matching
                                            events.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {rule.conditions.map((cond, ci) => (
                                                <div key={ci} className="flex items-center gap-2">
                                                    <Input
                                                        type="text"
                                                        value={cond.field}
                                                        onChange={(e) => {
                                                            const newConds = [...rule.conditions];
                                                            newConds[ci] = {
                                                                ...newConds[ci]!,
                                                                field: e.target.value,
                                                            };
                                                            updateRule(rule.id, {
                                                                conditions: newConds,
                                                            });
                                                        }}
                                                        placeholder="Field name"
                                                        className="flex-1 rounded-md border bg-background px-3 py-1.5 text-xs"
                                                    />
                                                    <NativeSelect
                                                        value={cond.operator}
                                                        onChange={(e) => {
                                                            const newConds = [...rule.conditions];
                                                            newConds[ci] = {
                                                                ...newConds[ci]!,
                                                                operator: e.target.value,
                                                            };
                                                            updateRule(rule.id, {
                                                                conditions: newConds,
                                                            });
                                                        }}
                                                        className="rounded-md border bg-background px-2 py-1.5 text-xs"
                                                    >
                                                        {CONDITION_OPERATORS.map((op) => (
                                                            <option key={op.value} value={op.value}>
                                                                {op.label}
                                                            </option>
                                                        ))}
                                                    </NativeSelect>
                                                    <Input
                                                        type="text"
                                                        value={cond.value}
                                                        onChange={(e) => {
                                                            const newConds = [...rule.conditions];
                                                            newConds[ci] = {
                                                                ...newConds[ci]!,
                                                                value: e.target.value,
                                                            };
                                                            updateRule(rule.id, {
                                                                conditions: newConds,
                                                            });
                                                        }}
                                                        placeholder="Value"
                                                        className="flex-1 rounded-md border bg-background px-3 py-1.5 text-xs"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCondition(rule.id, ci)}
                                                    >
                                                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center">
                                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Action */}
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                                        THEN (Action)
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {ACTION_OPTIONS.map((opt) => {
                                            const Icon = opt.icon;
                                            return (
                                                <Button
                                                    key={opt.value}
                                                    variant={
                                                        rule.action_type === opt.value
                                                            ? "outline"
                                                            : "ghost"
                                                    }
                                                    className={`h-auto gap-2 px-3 py-2 text-xs font-medium ${
                                                        rule.action_type === opt.value
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        updateRule(rule.id, {
                                                            action_type: opt.value,
                                                        })
                                                    }
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {opt.label}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Action Config */}
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {rule.action_type === "send_notification" && (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder="Notification title"
                                                    value={rule.action_config.title ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                title: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Notification body"
                                                    value={rule.action_config.body ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                body: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                            </>
                                        )}
                                        {rule.action_type === "send_email" && (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder="Subject"
                                                    value={rule.action_config.subject ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                subject: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Email body"
                                                    value={rule.action_config.body ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                body: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                            </>
                                        )}
                                        {rule.action_type === "update_field" && (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder="Field name"
                                                    value={rule.action_config.field ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                field: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="New value"
                                                    value={rule.action_config.value ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                value: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                            </>
                                        )}
                                        {rule.action_type === "create_task" && (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder="Task title"
                                                    value={rule.action_config.title ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                title: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={rule.action_config.description ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                description: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                            </>
                                        )}
                                        {rule.action_type === "move_stage" && (
                                            <Input
                                                type="text"
                                                placeholder="Target stage/status"
                                                value={rule.action_config.stage ?? ""}
                                                onChange={(e) =>
                                                    updateRule(rule.id, {
                                                        action_config: {
                                                            ...rule.action_config,
                                                            stage: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                            />
                                        )}
                                        {rule.action_type === "webhook" && (
                                            <Input
                                                type="text"
                                                placeholder="Webhook URL"
                                                value={rule.action_config.url ?? ""}
                                                onChange={(e) =>
                                                    updateRule(rule.id, {
                                                        action_config: {
                                                            ...rule.action_config,
                                                            url: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="col-span-2 rounded-md border bg-background px-3 py-1.5 text-xs"
                                            />
                                        )}
                                        {rule.action_type === "slack_message" && (
                                            <>
                                                <Input
                                                    type="text"
                                                    placeholder="Channel (optional)"
                                                    value={rule.action_config.channel ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                channel: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Message text"
                                                    value={rule.action_config.text ?? ""}
                                                    onChange={(e) =>
                                                        updateRule(rule.id, {
                                                            action_config: {
                                                                ...rule.action_config,
                                                                text: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="rounded-md border bg-background px-3 py-1.5 text-xs"
                                                />
                                            </>
                                        )}
                                        {rule.action_type === "add_comment" && (
                                            <Input
                                                type="text"
                                                placeholder="Comment body"
                                                value={rule.action_config.body ?? ""}
                                                onChange={(e) =>
                                                    updateRule(rule.id, {
                                                        action_config: {
                                                            ...rule.action_config,
                                                            body: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="col-span-2 rounded-md border bg-background px-3 py-1.5 text-xs"
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button variant="outline" className="w-full" onClick={addRule}>
                        <Plus className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                </div>
            </div>
        ),
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={automation ?? null}
            isLoading={isLoading && !initialRecord}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDryRun(!isDryRun)}>
                        {isDryRun ? (
                            <Play className="mr-2 h-4 w-4" />
                        ) : (
                            <Activity className="mr-2 h-4 w-4" />
                        )}
                        {isDryRun ? "Exit Dry-Run" : "Dry-Run Mode"}
                    </Button>
                    <div className="flex items-center gap-2" role="status" aria-live="polite">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saveStatus === "saving"}
                            variant={
                                saveStatus === "success"
                                    ? "default"
                                    : saveStatus === "error"
                                      ? "destructive"
                                      : "default"
                            }
                        >
                            {saveStatus === "saving" ? (
                                <Activity className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {saveStatus === "saving"
                                ? COMMON_STRINGS.action_saving
                                : saveStatus === "success"
                                  ? "Saved!"
                                  : saveStatus === "error"
                                    ? "Failed — Retry"
                                    : isDryRun
                                      ? "Validate"
                                      : "Save Rules"}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
