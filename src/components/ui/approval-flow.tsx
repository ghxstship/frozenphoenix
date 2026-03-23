"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ArrowRight, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

type StepStatus = "pending" | "in_progress" | "approved" | "rejected" | "skipped";

export interface ApprovalStep {
    id: string;
    label: string;
    assigneeName: string;
    status: StepStatus;
    completedAt?: string | undefined;
    notes?: string | undefined;
}

interface ApprovalFlowProps {
    steps: ApprovalStep[];
    onApprove?: ((stepId: string) => void) | undefined;
    onReject?: ((stepId: string, reason?: string) => void) | undefined;
    isSubmitting?: boolean | undefined;
    className?: string | undefined;
}

const STATUS_CONFIG: Record<
    StepStatus,
    { icon: typeof Clock; color: string; bg: string; label: string }
> = {
    pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50", label: "Pending" },
    in_progress: { icon: Loader2, color: "text-info", bg: "bg-info/10", label: "In Review" },
    approved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Approved" },
    rejected: {
        icon: XCircle,
        color: "text-destructive",
        bg: "bg-destructive/10",
        label: "Rejected",
    },
    skipped: {
        icon: ArrowRight,
        color: "text-muted-foreground",
        bg: "bg-muted/30",
        label: "Skipped",
    },
};

export function ApprovalFlow({
    steps,
    onApprove,
    onReject,
    isSubmitting = false,
    className,
}: ApprovalFlowProps) {
    return (
        <div className={cn("space-y-1", className)} role="list" aria-label="Approval workflow">
            {steps.map((step, index) => {
                const config = STATUS_CONFIG[step.status];
                const Icon = config.icon;
                const isLast = index === steps.length - 1;
                const isActionable = step.status === "in_progress" && (onApprove || onReject);

                return (
                    <div key={step.id} role="listitem">
                        <div
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                isActionable && "ring-1 ring-info/30 bg-info/5",
                                !isActionable && "hover:bg-muted/30"
                            )}
                        >
                            {/* Status icon */}
                            <div
                                className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                    config.bg
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-4 w-4",
                                        config.color,
                                        step.status === "in_progress" && "motion-safe:animate-spin"
                                    )}
                                />
                            </div>

                            {/* Step info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{step.label}</span>
                                    <Badge variant="ghost" className="density-caption">
                                        {config.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Avatar name={step.assigneeName} size="sm" />
                                    <span className="text-xs text-muted-foreground">
                                        {step.assigneeName}
                                    </span>
                                    {step.completedAt && (
                                        <span className="density-caption text-muted-foreground/60">
                                            {new Date(step.completedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {step.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                        {step.notes}
                                    </p>
                                )}
                            </div>

                            {/* Action buttons */}
                            {isActionable && (
                                <div className="flex items-center gap-2 shrink-0">
                                    {onReject && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onReject(step.id)}
                                            disabled={isSubmitting}
                                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                            Reject
                                        </Button>
                                    )}
                                    {onApprove && (
                                        <Button
                                            size="sm"
                                            onClick={() => onApprove(step.id)}
                                            disabled={isSubmitting}
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                            Approve
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Connector */}
                        {!isLast && (
                            <div className="flex items-center pl-7 py-0.5" aria-hidden="true">
                                <div className="w-px h-3 bg-border ml-[15px]" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
